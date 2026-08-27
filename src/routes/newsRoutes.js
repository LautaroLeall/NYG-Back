const express = require('express');
const router = express.Router();

const {
  createNews,
  getNews,
  getNewsById,
  updateNews,
  deleteNews
} = require('../controllers/newsController');

// Middlewares de autenticación
const { protect, admin, protectOptional } = require('../middlewares/authMiddleware');

// Rutas base: /api/news
router.route('/')
  .get(protectOptional, getNews) // Público (detecta admin si está logueado)
  .post(protect, admin, createNews); // Solo Admin

router.route('/:id')
  .get(protectOptional, getNewsById) // Público (detecta admin si está logueado)
  .put(protect, admin, updateNews) // Solo Admin
  .delete(protect, admin, deleteNews); // Solo Admin

module.exports = router;
