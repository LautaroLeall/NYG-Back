const express = require('express');
const router = express.Router();

const {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
  getUpcomingMatches,
  getLatestResults,
  getLatestUpdate
} = require('../controllers/matchController');

const { saveMatchStats, getMatchStatsByMatchId } = require('../controllers/statsController');

// Middlewares de autenticación
const { protect, admin } = require('../middlewares/authMiddleware');

// Rutas estáticas específicas (Deben ir siempre antes de las rutas con :id)
router.get('/upcoming', getUpcomingMatches);
router.get('/latest-results', getLatestResults);
router.get('/latest-update', getLatestUpdate);

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
  .get(getMatchStatsByMatchId)
  .post(protect, admin, saveMatchStats);

// BE-061-v2: Carga unificada de estadísticas y línea de tiempo
const { saveUnifiedStats } = require('../controllers/statsController');
router.route('/:id/unified-stats')
  .post(protect, admin, saveUnifiedStats);

module.exports = router;
