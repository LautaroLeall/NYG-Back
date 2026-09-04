const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del torneo es obligatorio'],
    trim: true,
  },
  season: {
    type: Number,
    required: [true, 'La temporada (año) es obligatoria'],
  },
  level: {
    type: String,
    enum: ['Regional', 'Local', 'Nacional', 'Amistoso'],
    default: 'Local'
  },
  category: {
    type: String,
    enum: ['Primera', 'Intermedia', 'Pre-Intermedia', 'M19', 'M17', 'M16', 'M15', 'Infantiles'],
    default: 'Primera'
  },
  discipline: {
    type: String,
    enum: ['Rugby', 'Hockey'],
    default: 'Rugby'
  },
  pointsRule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointsRule'
  },
  tiebreakRule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TiebreakRule'
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tournament', tournamentSchema);
