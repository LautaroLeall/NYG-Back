const Team = require('../models/Team');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
exports.createTeam = async (req, res) => {
  try {
    const { name, club, category } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'El nombre del equipo es obligatorio' });
    }
    if (!club || club.trim() === '') {
      return res.status(400).json({ message: 'El club es obligatorio' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ message: 'La categoría es obligatoria' });
    }

    // Check for duplicate name + category
    const existingTeam = await Team.findOne({ name: name.trim(), category: category.trim() });
    if (existingTeam) {
      return res.status(400).json({ message: `Ya existe un equipo con el nombre "${name.trim()}" en la categoría ${category.trim()}` });
    }

    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
exports.updateTeam = async (req, res) => {
  try {
    const { name, category } = req.body;
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    // If name or category is being updated, check for duplicate
    if (name || category) {
      const checkName = name ? name.trim() : team.name;
      const checkCategory = category ? category.trim() : team.category;

      if (checkName === '') {
        return res.status(400).json({ message: 'El nombre del equipo no puede estar vacío' });
      }

      const existingTeam = await Team.findOne({
        name: checkName,
        category: checkCategory,
        _id: { $ne: req.params.id }
      });

      if (existingTeam) {
        return res.status(400).json({ message: `Ya existe otro equipo con el nombre "${checkName}" en la categoría ${checkCategory}` });
      }
    }

    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    res.status(200).json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
