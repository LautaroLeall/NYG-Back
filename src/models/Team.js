const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del equipo es obligatorio'],
    trim: true,
  },
  shortName: {
    type: String,
    trim: true,
  },
  club: {
    type: String,
    required: [true, 'El club al que pertenece es obligatorio'],
    trim: true,
  },
  logo: {
    type: String, // URL al logo del club
    default: '/escudos/default.png'
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
  isOwnTeam: {
    type: Boolean,
    default: false, // true si es un equipo de Natación y Gimnasia
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
