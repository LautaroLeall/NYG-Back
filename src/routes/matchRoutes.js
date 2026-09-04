const express = require('express');
const router = express.Router();

const {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
  getUpcomingMatches,
  getLatestResults
} = require('../controllers/matchController');

const { saveMatchStats } = require('../controllers/statsController');

// Middlewares de autenticación
const { protect, admin } = require('../middlewares/authMiddleware');

// Rutas estáticas específicas (Deben ir siempre antes de las rutas con :id)
router.get('/upcoming', getUpcomingMatches);
router.get('/latest-results', getLatestResults);

// Rutas base: /api/matches
router.route('/')
  .get(getMatches) // Público
  .post(protect, admin, createMatch); // Solo Admin

router.route('/:id')
  .get(getMatchById) // Público
  .put(protect, admin, updateMatch) // Solo Admin
  .delete(protect, admin, deleteMatch); // Solo Admin

// BE-061: Carga de estadísticas por partido
router.route('/:id/stats')
  .post(protect, admin, saveMatchStats);

module.exports = router;
