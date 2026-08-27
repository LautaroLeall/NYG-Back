const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rutas (Verifica que haya un Access Token válido)
const protect = async (req, res, next) => {
  let token;

  // Verificamos que el header Authorization exista y empiece con "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtenemos el token (ej: "Bearer eyJhbG...")
      token = req.headers.authorization.split(' ')[1];

      // Decodificamos el token usando el secreto
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscamos al usuario en la BD y lo adjuntamos al request (sin el password)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      const err = new Error('No autorizado, token fallido o expirado');
      err.statusCode = 401;
      next(err);
    }
  }

  if (!token) {
    const error = new Error('No autorizado, no hay token provisto');
    error.statusCode = 401;
    next(error);
  }
};

// Middleware para restringir rutas solo a administradores
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const error = new Error('No autorizado. Se requieren permisos de administrador');
    error.statusCode = 403;
    next(error);
  }
};

// Middleware para extraer el usuario si hay un token válido, pero NO falla si no hay token.
// Útil para rutas públicas donde un admin tiene privilegios extra (ej. ver posts no publicados).
const protectOptional = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignorar errores (token expirado o inválido), simplemente no seteamos req.user
    }
  }
  next();
};

module.exports = {
  protect,
  admin,
  protectOptional
};
