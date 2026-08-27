const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, sendRefreshTokenCookie } = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validación básica de campos
    if (!firstName || !lastName || !email || !password) {
      const error = new Error('Por favor, complete todos los campos');
      error.statusCode = 400;
      throw error;
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('El usuario ya está registrado con este correo');
      error.statusCode = 400;
      throw error;
    }

    // Crear el usuario en la BD (la contraseña se hashea sola en el modelo)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    // Enviar respuesta
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Login de usuario y generación de tokens
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificar si mandaron email y password
    if (!email || !password) {
      const error = new Error('Por favor, ingrese email y contraseña');
      error.statusCode = 400;
      throw error;
    }

    // Buscar al usuario por su email
    const user = await User.findOne({ email });

    // Verificar si el usuario existe y si la contraseña coincide (usando el metodo del modelo)
    if (user && (await user.matchPassword(password))) {
      // 1. Generar Tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // 2. Enviar el Refresh Token en una Cookie HTTP-Only
      sendRefreshTokenCookie(res, refreshToken);

      // 3. Responder con el Access Token y los datos del usuario
      res.json({
        message: 'Login exitoso',
        accessToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } else {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
