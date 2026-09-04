const express = require('express');
const router = express.Router();

const {
  getStandings
} = require('../controllers/standingsController');

// Motor de cálculo de posiciones
// GET /api/standings/:tournamentId
router.route('/:tournamentId')
  .get(getStandings);

module.exports = router;
