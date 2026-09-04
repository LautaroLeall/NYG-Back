const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre completo es obligatorio'],
    trim: true,
  },
  position: {
    type: String,
    required: [true, 'La posición en el campo es obligatoria (ej: Medio Scrum, Pilar)'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  height: {
    type: Number, // en cm
    min: 0,
  },
  weight: {
    type: Number, // en kg
    min: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: [
      'Primera',
      'Intermedia',
      'Pre-Intermedia',
      'M19',
      'M17',
      'M16',
      'M15',
      'Infantiles',
      'Staff'
    ],
    default: 'Primera',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true, // Para marcar si está jugando la temporada actual o está retirado/lesionado
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);
