const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const usuario = req.usuario; // Obtener usuario desde el middleware anterior

    if (!usuario) {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ mensaje: 'Permiso denegado' });
    }

    next(); // Usuario tiene el rol adecuado
  };
};

module.exports = verificarRol;
