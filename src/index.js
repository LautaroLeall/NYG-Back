const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Inicializar la app
const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares globales (BE-004)
app.use(helmet()); // Seguridad HTTP headers
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true // Permite envío de cookies para el refresh token
}));
app.use(express.json({ limit: '10mb' })); // Body parser
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET)); // Parsear cookies firmadas

// Logging de requests (BE-005)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rutas base
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Montaje de rutas de la API
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada');
  error.statusCode = 404;
  next(error);
});

// Middleware centralizado de manejo de errores (BE-006)
app.use(errorHandler);

// Iniciar servidor
app.listen(env.PORT, () => {
  console.log(`[Server] Servidor corriendo en http://localhost:${env.PORT} en modo ${env.NODE_ENV}`);
});
