const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: [true, 'El torneo es obligatorio']
  },
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'El equipo local es obligatorio']
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'El equipo visitante es obligatorio']
  },
  date: {
    type: Date,
    required: [true, 'La fecha del partido es obligatoria'],
  },
  homeScore: { type: Number, default: 0 },
  awayScore: { type: Number, default: 0 },
  homeTries: { type: Number, default: 0 },
  awayTries: { type: Number, default: 0 },
  homeConversions: { type: Number, default: 0 },
  awayConversions: { type: Number, default: 0 },
  homePenalties: { type: Number, default: 0 },
  awayPenalties: { type: Number, default: 0 },
  homeDrops: { type: Number, default: 0 },
  awayDrops: { type: Number, default: 0 },
  homePenaltyTries: { type: Number, default: 0 },
  awayPenaltyTries: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Programado', 'En Curso', 'Finalizado', 'Postergado', 'Walkover'],
    default: 'Programado',
  },
  isHomeMatch: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);
