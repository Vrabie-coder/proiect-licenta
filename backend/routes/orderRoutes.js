const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Importăm modelul Order
const Product = require('../models/Product'); // Importăm modelul Product pentru a verifica stocul și prețul
const auth = require('../middleware/auth'); // Importăm middleware-ul de autentificare
const authorize = require('../middleware/authorize'); // Vom crea acest middleware imediat pentru roluri

// RUTA 1: POST /api/orders - Plasează o comandă nouă (Necesită autentificare user)
router.post('/', auth, async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id; // ID-ul utilizatorului autentificat (din token)

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Coșul de cumpărături este gol.' });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Verificăm fiecare produs din coș: stoc și preț
        for (let item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Produsul cu ID-ul ${item.product} nu a fost găsit.` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Stoc insuficient pentru produsul: ${product.name}. Stoc disponibil: ${product.stock}. Cantitate cerută: ${item.quantity}.` });
            }

            // Adăugăm produsul la orderItems cu prețul curent din DB
            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price // Folosim prețul actual din baza de date
            });
            totalAmount += product.price * item.quantity;

            // Scădem din stoc (O facem abia după ce toate verificările au trecut)
            product.stock -= item.quantity;
            await product.save();
        }

        const newOrder = new Order({
            user: userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod: paymentMethod || 'cash_on_delivery'
        });

        await newOrder.save();
        res.status(201).json({ message: 'Comanda a fost plasată cu succes!', order: newOrder });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare server la plasarea comenzii.');
    }
});

// RUTA 2: GET /api/orders/my-orders - Obține comenzile utilizatorului curent (Necesită autentificare user)
router.get('/my-orders', auth, async (req, res) => {
    try {
        // Găsim comenzile pentru utilizatorul autentificat, populăm detaliile produselor
        const orders = await Order.find({ user: req.user.id })
                                .populate('items.product', 'name price imageUrl'); // Populează detalii despre produs
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare server la preluarea comenzilor.');
    }
});

// RUTA 3: GET /api/orders - Obține toate comenzile (Necesită autentificare admin)
router.get('/', auth, authorize(['admin']), async (req, res) => {
    try {
        // Găsim toate comenzile, populăm detaliile utilizatorului și ale produselor
        const orders = await Order.find({})
                                .populate('user', 'username email') // Populează detalii despre utilizator
                                .populate('items.product', 'name price imageUrl'); // Populează detalii despre produs
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare server la preluarea tuturor comenzilor.');
    }
});

// RUTA 4: PUT /api/orders/:id/status - Actualizează statusul unei comenzi (Necesită autentificare admin)
router.put('/:id/status', auth, authorize(['admin']), async (req, res) => {
    const { status } = req.body; // Noul status al comenzii

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Comanda nu a fost găsită.' });
        }

        // Validăm noul status conform enum-ului din schema Order
        const allowedStatuses = ['pending', 'processed', 'shipped', 'delivered', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Status invalid.' });
        }

        order.status = status;
        await order.save();
        res.json({ message: 'Statusul comenzii a fost actualizat!', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare server la actualizarea statusului comenzii.');
    }
});

// RUTA 5: GET /api/orders/statistics/sales - Statistici vânzări (produse vândute pe o perioadă) (Necesită autentificare admin)
router.get('/statistics/sales', auth, authorize(['admin']), async (req, res) => {
    try {
        // Agregare MongoDB pentru a calcula cantitatea totală vândută per produs
        const salesStats = await Order.aggregate([
            { $match: { status: { $in: ['processed', 'shipped', 'delivered'] } } }, // Doar comenzi finalizate
            { $unwind: '$items' }, // Despachetează array-ul de produse
            {
                $group: {
                    _id: '$items.product', // Grupăm după ID-ul produsului
                    productName: { $first: '$items.name' }, // Numele produsului
                    totalQuantitySold: { $sum: '$items.quantity' }, // Suma cantităților vândute
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } // Venitul total
                }
            },
            {
                $lookup: { // Join cu colecția de produse pentru a aduce detalii suplimentare
                    from: 'products', // Numele colecției (de obicei pluralul modelului, ex: Product -> products)
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' }, // Despachetează rezultatul lookup-ului
            {
                $project: { // Selectăm doar câmpurile dorite pentru răspuns
                    _id: 0, // Excludem _id-ul de grupare
                    productId: '$_id',
                    productName: 1,
                    totalQuantitySold: 1,
                    totalRevenue: 1,
                    imageUrl: '$productDetails.imageUrl' // Adăugăm și URL-ul imaginii din detalii
                }
            },
            { $sort: { totalQuantitySold: -1 } } // Sortăm după cele mai vândute
        ]);

        res.json(salesStats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare server la generarea statisticilor.');
    }
});


module.exports = router;