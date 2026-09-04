const mongoose = require('mongoose');

const tiebreakRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'URT Estandar'
  },
  criteria: [{
    type: String,
    enum: [
      'HEAD_TO_HEAD_POINTS', // Puntos en el partido entre sí
      'HEAD_TO_HEAD_TRIES', // Tries en el partido entre sí
      'TOTAL_WINS', // Cantidad de partidos ganados
      'POINTS_DIFFERENCE', // Diferencia de tantos a favor y en contra
      'TRIES_DIFFERENCE', // Diferencia de tries a favor y en contra
      'TOTAL_TRIES_SCORED', // Total de tries a favor
      'TOTAL_POINTS_SCORED', // Total de tantos a favor
      'AWAY_WINS', // Mayor cantidad de partidos ganados como visitante
      'CARDS_RECORD' // Menor cantidad de tarjetas rojas/amarillas (fair play)
    ],
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('TiebreakRule', tiebreakRuleSchema);
