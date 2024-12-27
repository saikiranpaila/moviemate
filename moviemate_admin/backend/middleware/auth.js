const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY: secretKey } = require('./../config/config');

// Middleware to check if the user is authenticated
function authenticateJWT(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from 'Authorization' header

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        next();
    });
}

module.exports = authenticateJWT;
