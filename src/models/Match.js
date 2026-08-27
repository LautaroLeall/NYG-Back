const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  competition: {
    type: String,
    required: [true, 'La competición es obligatoria'],
    trim: true,
  },
  homeTeam: {
    type: String,
    required: [true, 'El equipo local es obligatorio'],
    trim: true,
  },
  awayTeam: {
    type: String,
    required: [true, 'El equipo visitante es obligatorio'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'La fecha del partido es obligatoria'],
  },
  homeScore: {
    type: Number,
    default: 0,
  },
  awayScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Programado', 'En Curso', 'Finalizado'],
    default: 'Programado',
  },
  isHomeMatch: {
    type: Boolean,
    default: true, // Indica si Natación y Gimnasia juega de local
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);
