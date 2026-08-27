const express = require('express');
const router = express.Router();

const {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch
} = require('../controllers/matchController');

// Middlewares de autenticación
const { protect, admin } = require('../middlewares/authMiddleware');

// Rutas base: /api/matches
router.route('/')
  .get(getMatches) // Público
  .post(protect, admin, createMatch); // Solo Admin

router.route('/:id')
  .get(getMatchById) // Público
  .put(protect, admin, updateMatch) // Solo Admin
  .delete(protect, admin, deleteMatch); // Solo Admin

module.exports = router;
