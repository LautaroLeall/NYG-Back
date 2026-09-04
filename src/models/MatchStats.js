const mongoose = require('mongoose');

const matchStatsSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  isStarter: {
    type: Boolean,
    default: false,
    required: true,
  },
  minutesPlayed: {
    type: Number,
    default: 0,
    min: 0,
    max: 120, // Por si hay tiempos extra
  },
  tries: {
    type: Number,
    default: 0,
    min: 0,
  },
  conversions: {
    type: Number,
    default: 0,
    min: 0,
  },
  penalties: {
    type: Number,
    default: 0,
    min: 0,
  },
  drops: {
    type: Number,
    default: 0,
    min: 0,
  },
  yellowCards: {
    type: Number,
    default: 0,
    min: 0,
    max: 2,
  },
  redCards: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índice compuesto para asegurar que un jugador no tenga dos planillas en el mismo partido
matchStatsSchema.index({ match: 1, player: 1 }, { unique: true });

// Virtual property para calcular los puntos en base al sistema estándar de Rugby
// tries * 5 + conversions * 2 + penalties * 3 + drops * 3
matchStatsSchema.virtual('pointsScored').get(function () {
  return (this.tries * 5) + (this.conversions * 2) + (this.penalties * 3) + (this.drops * 3);
});

module.exports = mongoose.model('MatchStats', matchStatsSchema);
