function errorHandler(err, req, res, next) {
  console.error('Error capturado:', err);

  const statusCode = err.status || 500; // Código de estado
  const message = err.message || 'Error interno del servidor';
  const errors = err.errors || null; // Errores de validación si existen

  res.status(statusCode).json({
    success: false,
    message,
    errors, // Enviar array de errores de validación al cliente
  });
}

module.exports = errorHandler;
