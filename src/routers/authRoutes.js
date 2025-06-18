const express = require('express');
const { registerValidator ,loginValidation} = require('../middleware/authValidators');
const { validationResult } = require('express-validator');
//const { registerValidation, loginValidation } = require('../validations/authValidations');
const usuarioController = require('../controllers/usuario');
const SesionController= require('../controllers/sesion');
const { handleValidationErrors } = require('../middleware/handleValidationErrors');
const verificarRol = require('../middleware/verificarRol');
const { body } = require('express-validator');
const autenticarJWT = require('../middleware/autenticarJWT')
const agregarUsuarioAVista = require('../middleware/sessionData')

const authrouter = express.Router();


/*
// Ruta para probar
authrouter.get('/', (req, res) => {
  res.send('¡Ruta de autenticación funcionando!');
});
http://localhost:8000/api/auth
*/
// Ruta para registro
// Ruta para el registro
authrouter.post(
  '/registro',
  autenticarJWT,
  agregarUsuarioAVista,
  verificarRol(['administrativo']), 
  //registerValidation, // Validaciones
  registerValidator,
  handleValidationErrors, // Manejo de errores
  usuarioController.registro // Lógica del controlador
  
);


// Ruta de login
authrouter.post(
  '/login', 
 
  loginValidation,
  handleValidationErrors,
  SesionController.login
);


module.exports = authrouter;
