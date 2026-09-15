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
  },
  roster: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    isStarter: { type: Boolean, default: false }
  }],
  events: [{
    team: { type: String, enum: ['NYG', 'RIVAL'], required: true },
    type: { type: String, enum: ['Try', 'Conversión', 'Penal', 'Drop', 'Try Penal', 'Tarjeta Amarilla', 'Tarjeta Roja', 'Cambio'], required: true },
    minute: { type: Number, required: true, min: 0, max: 120 },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, // Anotador o Jugador Entrante
    playerOut: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' } // Jugador Saliente (solo cambios)
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);
