const express = require('express');
const router = express.Router();

const {
  getNews,
  getFeaturedNews,
  getNewsBySlug,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');

// Proteccion de rutas admin
const { protect } = require('../middlewares/authMiddleware');

// Rutas Públicas
router.get('/', getNews);
router.get('/destacadas', getFeaturedNews);
router.get('/:slug', getNewsBySlug);

// Rutas Privadas (Admin)
router.get('/admin/:id', protect, getNewsById);
router.post('/', protect, createNews);
router.put('/:id', protect, updateNews);
router.delete('/:id', protect, deleteNews);

module.exports = router;
