const { body } = require('express-validator');

const registerValidation = [

  body('username')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es obligatorio')
    .isAlphanumeric()
    .withMessage('El nombre de usuario solo debe contener letras y números'),
  
  body('correo')
    .isEmail()
    .normalizeEmail()
    .withMessage('El correo electrónico no es válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&#]/)
    .withMessage('La contraseña debe contener al menos un carácter especial'),

  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Las contraseñas no coinciden')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('El correo electrónico no es válido'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
];

module.exports = {
  registerValidation,
  loginValidation
};
