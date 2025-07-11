const express = require('express');
const Datastore = require('nedb');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

//Baza de date Nedb
const productsDb = new Datastore({ filename: './data/products.db', autoload: true });
const ordersDb = new Datastore({ filename: './data/orders.db', autoload: true });
const adminsDb = new Datastore({ filename: './data/admins.db', autoload: true });

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'honey-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));


async function initializeData() {
  try {
    //Admin Default
    adminsDb.findOne({ username: 'admin' }, async (err, admin) => {
      if (err) {
        console.error('Error checking admin:', err);
        return;
      }
      
      if (!admin) {
        const hashedPassword = await bcrypt.hash('honey123', 10);
        adminsDb.insert({ username: 'admin', password: hashedPassword }, (err) => {
          if (err) {
            console.error('Error creating admin:', err);
          } else {
            console.log('Admin user created');
          }
        });
      }
    });

    //Conditie daca nu exista produse adaugate
    productsDb.count({}, (err, count) => {
      if (err) {
        console.error('Error counting products:', err);
        return;
      }
      
      if (count === 0) {
        const sampleProducts = [
          {
            name: 'Wildflower Honey',
            price: 24.99,
            description: 'Pure wildflower honey with a delicate floral taste, perfect for tea and toast.',
            image: '/images/honey-jar-1.jpg',
            category: 'Raw Honey',
            inStock: true,
            createdAt: new Date()
          },
          {
            name: 'Manuka Honey',
            price: 49.99,
            description: 'Premium Manuka honey from New Zealand, known for its unique health benefits.',
            image: '/images/honey-jar-2.jpg',
            category: 'Premium Honey',
            inStock: true,
            createdAt: new Date()
          },
          {
            name: 'Clover Honey',
            price: 19.99,
            description: 'Light and mild clover honey, ideal for baking and everyday use.',
            image: '/images/honey-jar-5.jpg',
            category: 'Raw Honey',
            inStock: true,
            createdAt: new Date()
          },
          {
            name: 'Acacia Honey',
            price: 34.99,
            description: 'Light-colored acacia honey with a subtle, sweet flavor.',
            image: '/images/honey-jar-3.jpg',
            category: 'Premium Honey',
            inStock: true,
            createdAt: new Date()
          },
          {
            name: 'Buckwheat Honey',
            price: 27.99,
            description: 'Dark, robust buckwheat honey with a rich, molasses-like flavor.',
            image: '/images/honey-jar-6.jpg',
            category: 'Specialty Honey',
            inStock: true,
            createdAt: new Date()
          },
          {
            name: 'Lavender Honey',
            price: 39.99,
            description: 'Aromatic lavender honey with floral notes, perfect for relaxation.',
            image: '/images/honey-jar-4.jpg',
            category: 'Specialty Honey',
            inStock: true,
            createdAt: new Date()
          }
        ];
        
        productsDb.insert(sampleProducts, (err) => {
          if (err) {
            console.error('Error creating sample products:', err);
          } else {
            console.log('Sample products created');
          }
        });
      }
    });
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

//Middleware
const requireAuth = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

//Produse
app.get('/api/products', (req, res) => {
  productsDb.find({}, (err, products) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(products);
    }
  });
});

app.post('/api/products', requireAuth, (req, res) => {
  const productData = {
    ...req.body,
    createdAt: new Date()
  };
  
  productsDb.insert(productData, (err, product) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(product);
    }
  });
});

app.put('/api/products/:id', requireAuth, (req, res) => {
  productsDb.update({ _id: req.params.id }, req.body, {}, (err, numReplaced) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (numReplaced === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      productsDb.findOne({ _id: req.params.id }, (err, product) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json(product);
        }
      });
    }
  });
});

app.delete('/api/products/:id', requireAuth, (req, res) => {
  productsDb.remove({ _id: req.params.id }, {}, (err, numRemoved) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (numRemoved === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ message: 'Product deleted' });
    }
  });
});

//Comenzi
app.get('/api/orders', requireAuth, (req, res) => {
  ordersDb.find({}).sort({ createdAt: -1 }).exec((err, orders) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(orders);
    }
  });
});

app.post('/api/orders', (req, res) => {
  const orderData = {
    ...req.body,
    createdAt: new Date()
  };
  
  ordersDb.insert(orderData, (err, order) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(order);
    }
  });
});

app.put('/api/orders/:id/status', requireAuth, (req, res) => {
  ordersDb.update({ _id: req.params.id }, { $set: { status: req.body.status } }, {}, (err, numReplaced) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (numReplaced === 0) {
      res.status(404).json({ error: 'Order not found' });
    } else {
      ordersDb.findOne({ _id: req.params.id }, (err, order) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json(order);
        }
      });
    }
  });
});

//Autentificare
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    adminsDb.findOne({ username }, async (err, admin) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (admin && await bcrypt.compare(password, admin.password)) {
        req.session.isAdmin = true;
        res.json({ success: true });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

//Contact
app.post('/api/contact', async (req, res) => {
  try {
    console.log('Contact form submission:', req.body);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initializeData();
});