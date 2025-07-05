const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, // Referință la ID-ul produsului
        ref: 'Product', // Se referă la modelul 'Product'
        required: true
    },
    name: { // Salvăm numele produsului și aici pentru ușurință
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: { // Salvăm prețul produsului la momentul comenzii
        type: Number,
        required: true,
        min: 0
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // Referință la ID-ul utilizatorului care a plasat comanda
        ref: 'User', // Se referă la modelul 'User'
        required: true
    },
    items: [orderItemSchema], // Un array de produse comandate
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    shippingAddress: { // Detalii despre adresa de livrare
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    status: { // Starea comenzii (ex: 'pending', 'processed', 'shipped', 'delivered', 'cancelled')
        type: String,
        enum: ['pending', 'processed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery', 'card'], // Metode de plată acceptate
        default: 'cash_on_delivery'
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;