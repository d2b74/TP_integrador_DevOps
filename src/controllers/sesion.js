const Usuario = require('../models/usuarios'); // Importa el esquema base
const { setUsuarioAutenticado } = require('../utils/session');
const { createAccessToken } = require('../utils/jwt'); // Importa la función para crear tokens
const { compararPass } = require('../utils/bcrypt'); // Asegúrate de que bcrypt está instalado y configurado
const cookieConfig = require('../utils/cookie'); // Configuración de cookies

const SesionController = {
  login: async (req, res, next) => {
    const { correo, password } = req.body;
    try {
      // Buscar al usuario por correo
      const usuario = await Usuario.findOne({ correo });
      
      if (!usuario) {
        //return res.status(400).json({ mensaje: 'Usuario no encontrado' });
        const error = new Error('Usuario no encontrado');
        error.statusCode = 400;
        throw error;
      }

      // Comparar la contraseña
      const esPasswordValido = await compararPass(password, usuario.password);
      if (!esPasswordValido) {
        //return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
        const error = new Error('Contraseña incorrecta');
        error.statusCode = 400;
        throw error;
      }

      // Generar el token de acceso
      const token = await createAccessToken({
        id: usuario._id,
        rol: usuario.rol,
        nombres: usuario.nombres,
      });

      // Establecer la cookie con el token
      res.cookie('authToken', token, cookieConfig);

      return res.redirect('/home2');
    } catch (error) {
      //res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
      next(error);
    }
  },

  logout: (req, res) => {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.redirect('/');
  },
};

module.exports = SesionController;
