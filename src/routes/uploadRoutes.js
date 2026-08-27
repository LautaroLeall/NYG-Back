const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { protect, admin } = require('../middlewares/authMiddleware');

// @route   POST /api/upload
// @desc    Subir una imagen
// @access  Private/Admin
router.post('/', protect, admin, (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      // Manejar el error de Multer o filtro de archivo
      const error = new Error(err.message);
      error.statusCode = 400;
      return next(error);
    }

    if (!req.file) {
      const error = new Error('Por favor, selecciona una imagen para subir');
      error.statusCode = 400;
      return next(error);
    }

    // Si todo salió bien, devolver la ruta relativa de la imagen guardada
    // Se reemplaza \ por / para estandarizar las rutas en Windows
    const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;

    res.status(200).json({
      success: true,
      imageUrl: imagePath,
      message: 'Imagen subida con éxito'
    });
  });
});

module.exports = router;
