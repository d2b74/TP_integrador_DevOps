const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const error = new Error('Error de validación');
    error.status = 400;
    error.errors = errores.array(); // Array de errores detallados
    return next(error); // Pasa el error al manejador global
  }
  next();
};

module.exports = { handleValidationErrors };
