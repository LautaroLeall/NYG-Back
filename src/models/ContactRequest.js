const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, enum: ['Jugador', 'Sponsor', 'Otro'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Pendiente', 'Leído'], default: 'Pendiente' }
}, { timestamps: true });

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
