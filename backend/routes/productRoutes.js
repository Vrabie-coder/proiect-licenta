const express = require('express');
const router = express.Router(); // Cream un obiect 'router' pentru a defini rutele
const Product = require('../models/Product'); // Importam modelul Product

// RUTA 1: GET /api/products - Obține toate produsele
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}); // Gaseste toate produsele in baza de date
        res.json(products); // Returneaza produsele in format JSON
    } catch (err) {
        res.status(500).json({ message: err.message }); // Eroare server
    }
});

// RUTA 2: POST /api/products - Adaugă un produs nou (doar pentru admin)
// Vom adauga logica de autentificare/autorizare mai tarziu
router.post('/', async (req, res) => {
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        stock: req.body.stock
        // isAvailable va fi true by default conform schemei
    });

    try {
        const newProduct = await product.save(); // Salveaza produsul in baza de date
        res.status(201).json(newProduct); // Returneaza produsul nou creat cu status 201 (Created)
    } catch (err) {
        res.status(400).json({ message: err.message }); // Eroare de validare sau date incorecte
    }
});

// RUTA 3: GET /api/products/:id - Obține un produs după ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produsul nu a fost găsit.' }); // Produsul nu exista
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message }); // Eroare server
    }
});

// RUTA 4: PUT /api/products/:id - Actualizează un produs (doar pentru admin)
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produsul nu a fost găsit.' });
        }

        // Actualizeaza doar campurile care sunt prezente in body-ul cererii
        if (req.body.name != null) product.name = req.body.name;
        if (req.body.description != null) product.description = req.body.description;
        if (req.body.price != null) product.price = req.body.price;
        if (req.body.imageUrl != null) product.imageUrl = req.body.imageUrl;
        if (req.body.stock != null) product.stock = req.body.stock;
        if (req.body.isAvailable != null) product.isAvailable = req.body.isAvailable;

        const updatedProduct = await product.save(); // Salveaza modificarile
        res.json(updatedProduct); // Returneaza produsul actualizat
    } catch (err) {
        res.status(400).json({ message: err.message }); // Eroare de validare sau date incorecte
    }
});

// RUTA 5: DELETE /api/products/:id - Șterge un produs (doar pentru admin)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produsul nu a fost găsit.' });
        }

        await product.deleteOne(); // Sterge produsul
        res.json({ message: 'Produsul a fost șters cu succes.' }); // Mesaj de confirmare
    } catch (err) {
        res.status(500).json({ message: err.message }); // Eroare server
    }
});

module.exports = router; // Exportam router-ul pentru a-l folosi in server.js