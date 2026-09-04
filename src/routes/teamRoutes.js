const express = require('express');
const router = express.Router();
const { getTeams, getTeam, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getTeams)
  .post(protect, createTeam);

router.route('/:id')
  .get(getTeam)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

module.exports = router;
