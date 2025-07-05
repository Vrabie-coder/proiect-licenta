// 1. Încărcăm variabilele de mediu din fișierul .env
require('dotenv').config();

// 2. Importăm modulele necesare
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Pentru a permite cereri de la frontend
const productRoutes = require('./routes/productRoutes'); // <--- ASIGURĂ-TE CĂ ACEASTA E AICI
const authRoutes = require('./routes/authRoutes'); // NOU: importam rutele de autentificare
const authMiddleware = require('./middleware/auth'); // NOU: importam middleware-ul de autentificare
const orderRoutes = require('./routes/orderRoutes'); // NOU: importam rutele de comenzi

// 3. Creăm o instanță a aplicației Express
const app = express();

// 4. Middleware-uri
app.use(express.json());
app.use(cors());

// 5. Folosim rutele de produse
// Rute Publice (fără autentificare)
app.use('/api/auth', authRoutes); // Rute pentru înregistrare și login

// Rute Protejate (necesită autentificare)
// Acestea trebuie să treacă prin middleware-ul 'authMiddleware'
app.use('/api/products', authMiddleware, productRoutes); // Acum, toate rutele din productRoutes.js
                                                        // sunt protejate de autentificare.
                                                        // Doar utilizatorii autentificați pot face CRUD pe produse.
app.use('/api/orders', authMiddleware, orderRoutes); // NOU: Rute pentru comenzi, protejate de autentificare

// 6. Conectarea la MongoDB (acest bloc rămâne la fel)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stupina';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Conectat cu succes la MongoDB!');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Serverul rulează pe portul ${PORT}`);
            console.log(`Accesează-l la: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Eroare la conectarea la MongoDB:', err.message);
        process.exit(1);
    });

// 7. Ruta de test (poți să o păstrezi sau să o ștergi)
app.get('/', (req, res) => {
    res.send('API-ul Stupina Vrăbiuțelor funcționează!');
});