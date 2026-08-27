const jwt = require('jsonwebtoken');

// Generar Access Token (Tiempo de vida corto para seguridad)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// Generar Refresh Token (Tiempo de vida largo)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// Configuración estándar para la Cookie del Refresh Token
const sendRefreshTokenCookie = (res, token) => {
  res.cookie('jwt_refresh', token, {
    httpOnly: true, // No accesible desde JavaScript (protege contra ataques XSS)
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: 'strict', // Protege contra ataques CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshTokenCookie
};
