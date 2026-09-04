const Player = require('../models/Player');

// @desc    Crear un nuevo jugador
// @route   POST /api/players
// @access  Private/Admin
const createPlayer = async (req, res, next) => {
  try {
    const { name, category, position } = req.body;

    if (!name || name.trim() === '') {
      const error = new Error('El nombre completo es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    if (!position || position.trim() === '') {
      const error = new Error('La posición en el campo es obligatoria');
      error.statusCode = 400;
      throw error;
    }

    // Check for duplicate player in the same category
    const existingPlayer = await Player.findOne({
      name: name.trim(),
      category: category || 'Primera'
    });

    if (existingPlayer) {
      const error = new Error(`El jugador "${name.trim()}" ya existe en la categoría ${category || 'Primera'}`);
      error.statusCode = 400;
      throw error;
    }

    const player = await Player.create(req.body);
    res.status(201).json({
      success: true,
      data: player
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todos los jugadores (con filtro por plantel/categoría)
// @route   GET /api/players
// @access  Public
const getPlayers = async (req, res, next) => {
  try {
    const { category, isActive, search } = req.query;

    let query = {};

    // Filtro por Plantel (Ej: solo Plantel Superior)
    if (category) {
      query.category = category;
    }

    // Filtro por estado activo
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Búsqueda por nombre
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Búsqueda insensible a mayúsculas
    }

    const players = await Player.find(query).sort({ name: 1 }); // Orden alfabético

    res.status(200).json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un jugador por ID
// @route   GET /api/players/:id
// @access  Public
const getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      const error = new Error('Jugador no encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: player
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar un jugador
// @route   PUT /api/players/:id
// @access  Private/Admin
const updatePlayer = async (req, res, next) => {
  try {
    const { name, category, position } = req.body;
    let player = await Player.findById(req.params.id);

    if (!player) {
      const error = new Error('Jugador no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (position !== undefined && position.trim() === '') {
      const error = new Error('La posición en el campo es obligatoria');
      error.statusCode = 400;
      throw error;
    }

    if (name) {
      if (name.trim() === '') {
        const error = new Error('El nombre completo no puede estar vacío');
        error.statusCode = 400;
        throw error;
      }

      const existingPlayer = await Player.findOne({
        name: name.trim(),
        category: category || player.category,
        _id: { $ne: req.params.id }
      });

      if (existingPlayer) {
        const error = new Error(`El jugador "${name.trim()}" ya existe en la categoría ${category || player.category}`);
        error.statusCode = 400;
        throw error;
      }
    }

    player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: player
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un jugador
// @route   DELETE /api/players/:id
// @access  Private/Admin
const deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      const error = new Error('Jugador no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await player.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlayer,
  getPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer
};
