import Stage from '../models/Stage.js';

// @desc    Get all stages/internships
// @route   GET /api/stages
// @access  Public
export const getStages = async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) {
      query.status = status;
    } else {
      query.status = 'OPEN'; // Default to open stages
    }

    const stages = await Stage.find(query)
      .populate('postedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    res.json(stages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single stage
// @route   GET /api/stages/:id
// @access  Public
export const getStageById = async (req, res) => {
  try {
    const stage = await Stage.findById(req.params.id)
      .populate('postedBy', 'firstName lastName');

    if (stage) {
      res.json(stage);
    } else {
      res.status(404).json({ message: 'Stage offer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a stage offer
// @route   POST /api/stages
// @access  Private/Admin/Partner
export const createStage = async (req, res) => {
  try {
    const { title, companyName, location, duration, type, status, requirements, description, contactEmail, deadline } = req.body;

    const stage = new Stage({
      title,
      companyName,
      location,
      duration,
      type,
      status,
      requirements,
      description,
      contactEmail,
      deadline,
      postedBy: req.user._id,
      image: req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : '',
      document: req.files && req.files.document ? `/uploads/${req.files.document[0].filename}` : '',
    });

    const createdStage = await stage.save();
    res.status(201).json(createdStage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a stage (e.g. close it)
// @route   PUT /api/stages/:id
// @access  Private/ChefDept
export const updateStage = async (req, res) => {
  try {
    const stage = await Stage.findById(req.params.id);

    if (stage) {
      stage.title = req.body.title || stage.title;
      stage.companyName = req.body.companyName || stage.companyName;
      stage.location = req.body.location || stage.location;
      stage.duration = req.body.duration || stage.duration;
      stage.type = req.body.type || stage.type;
      stage.status = req.body.status || stage.status;
      stage.description = req.body.description || stage.description;
      stage.contactEmail = req.body.contactEmail || stage.contactEmail;
      stage.deadline = req.body.deadline || stage.deadline;
      if (req.body.requirements) {
        stage.requirements = Array.isArray(req.body.requirements) ? req.body.requirements : JSON.parse(req.body.requirements);
      }
      
      if (req.files) {
        if (req.files.image) stage.image = `/uploads/${req.files.image[0].filename}`;
        if (req.files.document) stage.document = `/uploads/${req.files.document[0].filename}`;
      }

      const updatedStage = await stage.save();
      res.json(updatedStage);
    } else {
      res.status(404).json({ message: 'Stage not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a stage
// @route   DELETE /api/stages/:id
// @access  Private/ChefDept
export const deleteStage = async (req, res) => {
  try {
    const stage = await Stage.findById(req.params.id);

    if (stage) {
      await Stage.deleteOne({ _id: stage._id });
      res.json({ message: 'Stage offer removed' });
    } else {
      res.status(404).json({ message: 'Stage offer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
