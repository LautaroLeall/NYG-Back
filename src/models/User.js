const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'player', 'user'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Middleware para encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function () {
  // Solo hashear si la contraseña ha sido modificada (o es nueva)
  if (!this.isModified('password')) {
    return;
  }

  // En Mongoose 8+ no se usa 'next()', simplemente usamos async/await y si falla lanza la excepcion sola
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Metodo para comparar contraseñas en el login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
