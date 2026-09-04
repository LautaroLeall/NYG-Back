const Match = require('../models/Match');

// @desc    Crear un nuevo partido
// @route   POST /api/matches
// @access  Private/Admin
const createMatch = async (req, res, next) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todos los partidos
// @route   GET /api/matches
// @access  Public
const getMatches = async (req, res, next) => {
  try {
    const { status, tournament, limit = 10, page = 1 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (tournament) query.tournament = tournament;

    const matches = await Match.find(query)
      .populate('tournament homeTeam awayTeam')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Match.countDocuments(query);

    res.status(200).json({
      success: true,
      count: matches.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un partido por ID
// @route   GET /api/matches/:id
// @access  Public
const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).populate('tournament homeTeam awayTeam');

    if (!match) {
      const error = new Error('Partido no encontrado');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar un partido
// @route   PUT /api/matches/:id
// @access  Private/Admin
const updateMatch = async (req, res, next) => {
  try {
    let match = await Match.findById(req.params.id);

    if (!match) {
      const error = new Error('Partido no encontrado');
      error.statusCode = 404;
      throw error;
    }

    match = await Match.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un partido
// @route   DELETE /api/matches/:id
// @access  Private/Admin
const deleteMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      const error = new Error('Partido no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await match.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener próximos partidos (Fixture)
// @route   GET /api/matches/upcoming
// @access  Public
const getUpcomingMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ status: 'Programado' })
      .populate('tournament homeTeam awayTeam')
      .sort({ date: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener últimos resultados
// @route   GET /api/matches/latest-results
// @access  Public
const getLatestResults = async (req, res, next) => {
  try {
    const matches = await Match.find({ status: 'Finalizado' })
      .populate('tournament homeTeam awayTeam')
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
  getUpcomingMatches,
  getLatestResults
};
