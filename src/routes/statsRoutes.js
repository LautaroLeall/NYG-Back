const express = require('express');
const router = express.Router();
const { protect, admin, authorize } = require('../middlewares/authMiddleware');

const {
  getRankings,
  getAlerts
} = require('../controllers/statsController');

// Endpoint de rankings
// GET /api/stats/rankings?tipo=goleadores
router.route('/rankings')
  .get(getRankings);

router.route('/alerts')
  .get(protect, admin, getAlerts);

module.exports = router;
