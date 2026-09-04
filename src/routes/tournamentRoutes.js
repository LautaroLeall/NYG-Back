const express = require('express');
const router = express.Router();
const { 
  getTournaments, 
  getTournament, 
  createTournament, 
  updateTournament, 
  deleteTournament,
  getPointsRules,
  getTiebreakRules
} = require('../controllers/tournamentController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/rules/points', getPointsRules);
router.get('/rules/tiebreak', getTiebreakRules);

router.route('/')
  .get(getTournaments)
  .post(protect, createTournament);

router.route('/:id')
  .get(getTournament)
  .put(protect, updateTournament)
  .delete(protect, deleteTournament);

module.exports = router;
