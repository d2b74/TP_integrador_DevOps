// middlewares/agregarUsuarioAVista.js
const agregarUsuarioAVista = (req, res, next) => {
    // Verifica si el usuario está autenticado y sus datos están en req.usuario
    res.locals.usuarioAutenticado = req.usuario || null;
  
    // Continúa con el siguiente middleware o controlador
    next();
  };
  
  module.exports = agregarUsuarioAVista;
  