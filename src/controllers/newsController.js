const News = require('../models/News');

// @desc    Crear una noticia
// @route   POST /api/news
// @access  Private/Admin
const createNews = async (req, res, next) => {
  try {
    const { title, content, excerpt, imageUrl, category, isPublished } = req.body;

    const news = await News.create({
      title,
      content,
      excerpt,
      imageUrl,
      category,
      isPublished,
      author: req.user._id // Obtenido del token por el middleware
    });

    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todas las noticias (con paginación opcional)
// @route   GET /api/news
// @access  Public
const getNews = async (req, res, next) => {
  try {
    const { limit = 10, page = 1, category, all } = req.query;

    // Por defecto, muestra solo publicadas
    let query = { isPublished: true };

    // Si es administrador y pasa ?all=true, muestra todas
    if (all && req.user && req.user.role === 'admin') {
      query = {};
    }

    if (category) {
      query.category = category;
    }

    const news = await News.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await News.countDocuments(query);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener una noticia por ID
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'name email');

    if (!news) {
      const error = new Error('Noticia no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Si la noticia no está publicada y el que la solicita no es admin
    if (!news.isPublished && (!req.user || req.user.role !== 'admin')) {
      const error = new Error('Noticia no encontrada o no publicada');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar noticia
// @route   PUT /api/news/:id
// @access  Private/Admin
const updateNews = async (req, res, next) => {
  try {
    let news = await News.findById(req.params.id);

    if (!news) {
      const error = new Error('Noticia no encontrada');
      error.statusCode = 404;
      throw error;
    }

    news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar noticia
// @route   DELETE /api/news/:id
// @access  Private/Admin
const deleteNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      const error = new Error('Noticia no encontrada');
      error.statusCode = 404;
      throw error;
    }

    await news.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNews,
  getNews,
  getNewsById,
  updateNews,
  deleteNews
};
