const jwt = require('jsonwebtoken');

// Secretul JWT trebuie să fie același cu cel din authRoutes.js
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
    // Obținem token-ul din header
    const token = req.header('x-auth-token'); // Un header comun pentru token-uri

    // Verificăm dacă există token
    if (!token) {
        return res.status(401).json({ message: 'Nicio autentificare, token lipsă.' }); // 401 Unauthorized
    }

    try {
        // Verificăm token-ul
        const decoded = jwt.verify(token, JWT_SECRET); // Decodifică token-ul folosind secretul
        req.user = decoded.user; // Adaugă informațiile utilizatorului (id, role) la obiectul cererii
        next(); // Continuă către următoarea funcție middleware/ruta
    } catch (err) {
        res.status(401).json({ message: 'Token invalid.' }); // Token-ul nu este valid sau a expirat
    }
};