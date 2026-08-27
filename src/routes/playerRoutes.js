const express = require('express');
const router = express.Router();

const {
  createPlayer,
  getPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer
} = require('../controllers/playerController');

// Middlewares de autenticación
const { protect, admin } = require('../middlewares/authMiddleware');

// Rutas base: /api/players
router.route('/')
  .get(getPlayers) // Público (Cualquiera puede ver los planteles)
  .post(protect, admin, createPlayer); // Solo Admin puede agregar jugadores

router.route('/:id')
  .get(getPlayerById) // Público
  .put(protect, admin, updatePlayer) // Solo Admin
  .delete(protect, admin, deletePlayer); // Solo Admin

module.exports = router;
