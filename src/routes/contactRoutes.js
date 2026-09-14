const express = require('express');
const router = express.Router();
const { createRequest, getRequests, markAsRead } = require('../controllers/contactController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', createRequest);
router.get('/', protect, admin, getRequests);
router.patch('/:id/read', protect, admin, markAsRead);

module.exports = router;
