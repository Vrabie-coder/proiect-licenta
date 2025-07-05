const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Numele de utilizator trebuie să fie unic
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email-ul trebuie să fie unic
        trim: true,
        lowercase: true // Stochează email-urile în litere mici
    },
    password: {
        type: String,
        required: true
    },
    role: { // Rolul utilizatorului (ex: 'user', 'admin')
        type: String,
        enum: ['user', 'admin'], // Poate fi doar 'user' sau 'admin'
        default: 'user'
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;