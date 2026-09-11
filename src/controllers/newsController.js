const News = require('../models/News');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res, next) => {
  try {
    const { category, discipline, isFeatured, allStatus, page = 1, limit = 10 } = req.query;

    // Construir query de filtros
    let query = {};

    // Por defecto solo trae las publicadas, a menos que se pida expresamente (para Admin)
    if (allStatus !== 'true') {
      query.isPublished = true;
    }

    if (category) {
      query.category = category;
    }

    if (discipline) {
      query.discipline = discipline;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    // Paginación
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const total = await News.countDocuments(query);

    const news = await News.find(query)
      .sort({ publishDate: -1 })
      .skip(startIndex)
      .limit(limitNum);

    // Pagination result
    const pagination = {};
    if (startIndex + limitNum < total) {
      pagination.next = {
        page: pageNum + 1,
        limit: limitNum
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: pageNum - 1,
        limit: limitNum
      };
    }

    res.status(200).json({
      success: true,
      count: news.length,
      pagination,
      total,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured news (limit 3)
// @route   GET /api/news/destacadas
// @access  Public
exports.getFeaturedNews = async (req, res, next) => {
  try {
    const news = await News.find({ isPublished: true, isFeatured: true })
      .sort({ publishDate: -1 })
      .limit(3);

    // Fallback: si no hay 3 destacadas, rellenar con las últimas publicadas
    if (news.length < 3) {
      const additionalNews = await News.find({
        isPublished: true,
        isFeatured: false,
        _id: { $nin: news.map(n => n._id) }
      })
        .sort({ publishDate: -1 })
        .limit(3 - news.length);

      news.push(...additionalNews);
    }

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get news by slug
// @route   GET /api/news/:slug
// @access  Public
exports.getNewsBySlug = async (req, res, next) => {
  try {
    const newsItem = await News.findOne({ slug: req.params.slug, isPublished: true });

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: newsItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get news by ID (Admin)
// @route   GET /api/news/admin/:id
// @access  Private/Admin
exports.getNewsById = async (req, res, next) => {
  try {
    const newsItem = await News.findById(req.params.id);

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: newsItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new news article
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = async (req, res, next) => {
  try {
    const newsItem = await News.create(req.body);

    res.status(201).json({
      success: true,
      data: newsItem
    });
  } catch (error) {
    console.error('ERROR EN CREATENEWS:', error.stack);
    next(error);
  }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = async (req, res, next) => {
  try {
    const newsItem = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: newsItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = async (req, res, next) => {
  try {
    const newsItem = await News.findByIdAndDelete(req.params.id);

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
