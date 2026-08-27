const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título de la noticia es obligatorio'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'El contenido de la noticia es obligatorio'],
  },
  excerpt: {
    type: String,
    required: [true, 'El resumen (excerpt) es obligatorio'],
    maxLength: [200, 'El resumen no puede superar los 200 caracteres'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['Institucional', 'Rugby', 'Hockey', 'Eventos'],
    default: 'Institucional',
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('News', newsSchema);
