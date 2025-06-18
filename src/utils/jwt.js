const jwt = require('jsonwebtoken');

// Obtén el secreto desde las variables de entorno
const SECRET_KEY = process.env.JWT_SECRET || 'tuClaveSuperSecreta';

/**
 * Crea un token de acceso.
 * @param {Object} payload - Los datos que incluirá el token.
 * @returns {Promise<String>} Una promesa que resuelve con el token generado.
 */
function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            SECRET_KEY,
            { expiresIn: '30m' }, // Expiración del token
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        );
    });
}

/**
 * Verifica y decodifica un token de acceso.
 * @param {String} token - El token a verificar.
 * @returns {Promise<Object>} Una promesa que resuelve con los datos decodificados del token.
 */
function verifyAccessToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) reject(new Error('Token no válido o expirado'));
            resolve(decoded);
        });
    });
}

module.exports = { createAccessToken, verifyAccessToken };