const mongoose = require('mongoose');
const slugify = require('slugify');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [120, 'El título no puede tener más de 120 caracteres'],
    minlength: [5, 'El título debe tener al menos 5 caracteres']
  },
  subtitle: {
    type: String,
    required: [true, 'El subtítulo es obligatorio'],
    trim: true,
    maxlength: [250, 'El subtítulo no puede tener más de 250 caracteres']
  },
  content: {
    type: String,
    required: [true, 'El contenido es obligatorio'],
    minlength: [50, 'El contenido de la noticia es demasiado corto (mínimo 50 caracteres)']
  },
  imageUrl: {
    type: String,
    required: [true, 'La imagen de portada es obligatoria']
  },
  gallery: [{
    type: String
  }],
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: {
      values: ['Institucional', 'Rugby', 'Hockey', 'Infantiles', 'Club'],
      message: '{VALUE} no es una categoría válida'
    }
  },
  discipline: {
    type: String,
    enum: ['Rugby', 'Hockey'],
    default: null
  },
  author: {
    type: String,
    required: [true, 'El autor es obligatorio'],
    trim: true,
    default: 'Prensa NYG'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function (v) {
        // No permitir fechas mayores a 1 año en el futuro
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return v <= oneYearFromNow;
      },
      message: 'La fecha de publicación no puede ser irreal (muy en el futuro)'
    }
  },
  slug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generar el slug automáticamente antes de guardar basado en el título
newsSchema.pre('save', function() {
  // Solo generamos el slug si es un documento nuevo o el título ha sido modificado
  if (!this.isModified('title')) {
    return;
  }

  const baseSlug = slugify(this.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  // Agregamos un string aleatorio al final para evitar colisiones si hay títulos iguales
  const randomStr = Math.random().toString(36).substring(2, 6);
  this.slug = `${baseSlug}-${randomStr}`;
});

module.exports = mongoose.model('News', newsSchema);
