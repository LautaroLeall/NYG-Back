const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[DB] Conectado a MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB desconectado. Intentando reconectar...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[DB] MongoDB reconectado exitosamente.');
});

module.exports = connectDB;
