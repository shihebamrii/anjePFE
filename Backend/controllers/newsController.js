import News from '../models/News.js'; // Import News database model

// @desc    Get all news
// @route   GET /api/news
// @access  Public
export const getNews = async (req, res) => {
  try {
    const { category, type } = req.query; // Extract optional filters from request query
    let query = {};

    // Filter by category or announcement type if specified
    if (category && category !== 'all') {
      query.category = category;
    }
    if (type) {
      query.type = type;
    }

    // Query news list sorted newest first, populating author information details
    const news = await News.find(query)
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: -1 });
      
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single news item
// @route   GET /api/news/:id
// @access  Public
export const getNewsById = async (req, res) => {
  try {
    // Retrieve target news article by ID
    const newsItem = await News.findById(req.params.id)
      .populate('author', 'firstName lastName avatar');

    if (newsItem) {
      res.json(newsItem);
    } else {
      res.status(404).json({ message: 'News item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a news article
// @route   POST /api/news
// @access  Private/Admin
export const createNews = async (req, res) => {
  try {
    const { title, content, excerpt, category, type, image, tags, priority } = req.body;

    // Create a new News document, mapping static upload folders if files exist in request
    const news = new News({
      title,
      content,
      excerpt,
      category,
      type,
      author: req.user._id, // Set creator from the session context
      image: req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : image || '',
      document: req.files && req.files.document ? `/uploads/${req.files.document[0].filename}` : '',
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [], // Parse tag strings to array
      priority,
    });

    const createdNews = await news.save();
    res.status(201).json(createdNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a news article
// @route   PUT /api/news/:id
// @access  Private/ChefDept
export const updateNews = async (req, res) => {
  try {
    // Locate target news item by ID
    const newsItem = await News.findById(req.params.id);

    if (newsItem) {
      const { title, content, excerpt, category, type, tags, priority } = req.body;

      // Update fields conditionally if present in request
      newsItem.title = title || newsItem.title;
      newsItem.content = content || newsItem.content;
      newsItem.excerpt = excerpt || newsItem.excerpt;
      newsItem.category = category || newsItem.category;
      newsItem.type = type || newsItem.type;
      if (tags !== undefined) {
        newsItem.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
      }
      newsItem.priority = priority || newsItem.priority;

      // Update static folders location if new file payloads are attached
      if (req.files) {
        if (req.files.image) newsItem.image = `/uploads/${req.files.image[0].filename}`;
        if (req.files.document) newsItem.document = `/uploads/${req.files.document[0].filename}`;
      }

      // Persist updates to DB
      const updatedNews = await newsItem.save();
      res.json(updatedNews);
    } else {
      res.status(404).json({ message: 'News item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a news article
// @route   DELETE /api/news/:id
// @access  Private/ChefDept
export const deleteNews = async (req, res) => {
  try {
    // Query news item
    const newsItem = await News.findById(req.params.id);

    if (newsItem) {
      // Execute deletion
      await News.deleteOne({ _id: newsItem._id });
      res.json({ message: 'News item removed' });
    } else {
      res.status(404).json({ message: 'News item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
