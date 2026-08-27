// src/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  const statusCode = err.statusCode || 500;
  const response = {
    error: {
      message: err.message || 'Error interno del servidor',
      code: statusCode
    }
  };

  // No enviamos el stacktrace en produccion por seguridad
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
