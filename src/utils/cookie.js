
const cookieConfig = {
    httpOnly: true, // La cookie no estará disponible en el cliente mediante JavaScript
    secure: process.env.NODE_ENV === 'production', // Solo usa cookies seguras en producción
    sameSite: 'strict', // Ayuda a prevenir ataques CSRF
    maxAge: 30 * 60 * 1000, // 30 minutos de expiración
  };
  
  module.exports = cookieConfig;
  