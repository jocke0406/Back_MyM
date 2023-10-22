const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization') ? req.header('Authorization').split(' ')[1] : null;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Accès interdit, token invalide' });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ message: 'Accès interdit, tu dois être connecté' });
    }
};

const authenticateAdminJWT = (req, res, next) => {
    const token = req.header('Authorization') ? req.header('Authorization').split(' ')[1] : null;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Accès interdit, token invalide' });
            }

            if (user.email === process.env.ADMIN_EMAIL) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: 'Accès interdit, tu dois être un administrateur' });
            }
        });
    } else {
        return res.status(401).json({ message: 'Accès interdit, tu dois être connecté' });
    }
};
module.exports = authenticateJWT;
