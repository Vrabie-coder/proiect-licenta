module.exports = function (roles) {
    return (req, res, next) => {
        // req.user este setat de middleware-ul 'auth'
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Acces interzis: Niciun rol de utilizator definit.' }); // 403 Forbidden
        }

        // Verificăm dacă rolul utilizatorului este inclus în array-ul de roluri permise
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Acces interzis: Nu aveți permisiunile necesare.' }); // 403 Forbidden
        }

        next(); // Permite accesul la ruta următoare
    };
};