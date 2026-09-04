const Tournament = require('../models/Tournament');
const PointsRule = require('../models/PointsRule');
const TiebreakRule = require('../models/TiebreakRule');

// @desc    Get all PointsRules
// @route   GET /api/tournaments/rules/points
// @access  Public
exports.getPointsRules = async (req, res) => {
  try {
    const rules = await PointsRule.find();
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all TiebreakRules
// @route   GET /api/tournaments/rules/tiebreak
// @access  Public
exports.getTiebreakRules = async (req, res) => {
  try {
    const rules = await TiebreakRule.find();
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('pointsRule tiebreakRule');
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('pointsRule tiebreakRule');
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new tournament
// @route   POST /api/tournaments
// @access  Private
exports.createTournament = async (req, res) => {
  try {
    const { name, season, category, discipline } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'El nombre del torneo es obligatorio' });
    }
    if (!season) {
      return res.status(400).json({ message: 'La temporada es obligatoria' });
    }

    const existingTournament = await Tournament.findOne({
      name: name.trim(),
      season,
      category: category || 'Primera',
      discipline: discipline || 'Rugby'
    });

    if (existingTournament) {
      return res.status(400).json({ message: `Ya existe un torneo con el nombre "${name.trim()}" para la temporada ${season} en la categoría ${category || 'Primera'}` });
    }

    const tournament = await Tournament.create(req.body);
    res.status(201).json(tournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private
exports.updateTournament = async (req, res) => {
  try {
    const { name, season, category, discipline } = req.body;
    let tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    if (name || season || category || discipline) {
      const checkName = name !== undefined ? name.trim() : tournament.name;
      const checkSeason = season !== undefined ? season : tournament.season;
      const checkCategory = category !== undefined ? category : tournament.category;
      const checkDiscipline = discipline !== undefined ? discipline : tournament.discipline;

      if (checkName === '') {
        return res.status(400).json({ message: 'El nombre del torneo no puede estar vacío' });
      }

      const existingTournament = await Tournament.findOne({
        name: checkName,
        season: checkSeason,
        category: checkCategory,
        discipline: checkDiscipline,
        _id: { $ne: req.params.id }
      });

      if (existingTournament) {
        return res.status(400).json({ message: `Ya existe otro torneo con el nombre "${checkName}" para la temporada ${checkSeason} en la categoría ${checkCategory}` });
      }
    }

    tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(tournament);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private
exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }
    res.status(200).json({ message: 'Torneo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
