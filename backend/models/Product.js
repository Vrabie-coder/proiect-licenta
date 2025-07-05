const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0 // Stocul implicit este 0
    },
    isAvailable: { // Poate fi folosit pentru a ascunde produse temporar
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Adaugă automat createdAt și updatedAt
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;