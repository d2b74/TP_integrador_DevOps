const { body } = require('express-validator');

const registerValidator = [
  body('nombres')
  .notEmpty().withMessage('El nombre es obligatorio'),
  body('apellidos')
  .notEmpty().withMessage('El apellido es obligatorio'),
  body('correo')
  .isEmail().withMessage('Debe ser un correo válido'),
  body('password')
  .notEmpty().withMessage('La contraseña es obligatoria')
  .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
  .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
  .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
  .matches(/[@$!%*?&#]/).withMessage('La contraseña debe contener al menos un carácter especial'),
  (req, res, next) => {
    console.log('Middleware de validación ejecutado');
    next();
  },
];

  const loginValidation = [
    body('correo')
      .isEmail()
      .normalizeEmail()
      .withMessage('El correo electrónico no es válido'),
  
    body('password')
      .notEmpty()
      .withMessage('La contraseña es obligatoria')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')

  ];
  
  module.exports = {
    registerValidator,
    loginValidation
  };


