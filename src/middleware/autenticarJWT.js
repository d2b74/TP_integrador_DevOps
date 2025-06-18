const { verifyAccessToken } = require('../utils/jwt');

const autenticarJWT = async (req, res, next) => {
  const token = req.cookies.authToken; // Leer el token desde la cookie

  if (!token) {
    return res.status(401).json({ mensaje: 'Autenticación requerida' });
  }

  try {
    const usuario = await verifyAccessToken(token); // Verifica y decodifica el JWT
    req.usuario = usuario; // Agrega el usuario decodificado al objeto req
    next(); // Continúa al siguiente middleware o ruta
  } catch (err) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = autenticarJWT;
