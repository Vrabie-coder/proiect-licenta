const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Pentru hash-uirea parolelor
const jwt = require('jsonwebtoken'); // Pentru generarea/verificarea token-urilor JWT
const User = require('../models/User'); // Importăm modelul User

// Secretul JWT. Folosim o variabila de mediu.
// Asigură-te că o vei adăuga în fișierul .env (vezi Pasul 6.3)
const JWT_SECRET = process.env.JWT_SECRET;

// RUTA 1: POST /api/auth/register - Înregistrarea unui utilizator nou
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Verificăm dacă utilizatorul există deja
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Utilizatorul cu acest email există deja.' });
        }
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Numele de utilizator este deja folosit.' });
        }

        // Criptăm parola
        const salt = await bcrypt.genSalt(10); // Generăm un "salt" (valoare aleatoare)
        const hashedPassword = await bcrypt.hash(password, salt); // Hash-uim parola

        // Creăm un nou utilizator
        user = new User({
            username,
            email,
            password: hashedPassword,
            // Dacă nu se specifică rolul, Mongoose va folosi 'user' by default (vezi schema User.js)
            // Putem permite înregistrarea de admini doar din backend sau printr-un proces special
            role: role === 'admin' ? 'admin' : 'user' // Asigurăm că rolul este fie 'admin', fie 'user'
        });

        await user.save(); // Salvăm utilizatorul în baza de date

        // Generăm un token JWT
        const payload = {
            user: {
                id: user.id, // ID-ul utilizatorului din baza de date
                role: user.role // Rolul utilizatorului
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, // Token-ul expiră după 1 oră (poate fi setat mai mult)
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ message: 'Utilizator înregistrat cu succes!', token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare server.');
    }
});

// RUTA 2: POST /api/auth/login - Autentificarea utilizatorului
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificăm dacă utilizatorul există
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credențiale invalide.' }); // Email sau parolă greșită
        }

        // Verificăm parola
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credențiale invalide.' }); // Email sau parolă greșită
        }

        // Generăm un token JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ message: 'Autentificare reușită!', token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Eroare server.');
    }
});

module.exports = router;