const express = require('express');
const router = express.Router();

const {
  getRankings
} = require('../controllers/statsController');

// Endpoint de rankings
// GET /api/stats/rankings?tipo=goleadores
router.route('/rankings')
  .get(getRankings);

module.exports = router;
