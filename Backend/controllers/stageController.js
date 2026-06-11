// Import the Stage Mongoose model representing internship offers in the database
import Stage from '../models/Stage.js';

// @desc    Get all stages/internships
// @route   GET /api/stages
// @access  Public
export const getStages = async (req, res) => {
  try {
    // Read optional query parameters from the request URL (e.g., ?type=PFE&status=OPEN)
    const { type, status } = req.query;
    
    // Initialize an empty query object for filtering
    let query = {};

    // If a specific internship type is requested (e.g., PFE, Summer), add it to filters
    if (type) query.type = type;
    
    // If a status is requested, use it; otherwise, default to showing only 'OPEN' (active) offers
    if (status) {
      query.status = status;
    } else {
      query.status = 'OPEN';
    }

    // Find stages matching our criteria, fill in the creator's first and last name using populate,
    // and sort them with the newest posts appearing first
    const stages = await Stage.find(query)
      .populate('postedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    // Send the list of stages back to the client as JSON
    res.json(stages);
  } catch (error) {
    // Handle database or parsing errors by returning status 500
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single stage details by its ID
// @route   GET /api/stages/:id
// @access  Public
export const getStageById = async (req, res) => {
  try {
    // Find the internship offer matching the ID from parameters
    // and populate the creator's name
    const stage = await Stage.findById(req.params.id)
      .populate('postedBy', 'firstName lastName');

    // If the offer is found, return it as JSON
    if (stage) {
      res.json(stage);
    } else {
      // If not found, return a 404 status
      res.status(404).json({ message: 'Stage offer not found' });
    }
  } catch (error) {
    // Handle lookup or connection errors
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new stage/internship offer
// @route   POST /api/stages
// @access  Private/Admin/Partner
export const createStage = async (req, res) => {
  try {
    // Destructure required fields from the request body
    const { title, companyName, location, duration, type, status, requirements, description, contactEmail, deadline } = req.body;

    // Instantiate a new Stage model using the received data
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
      // Associate this post with the logged-in user's ID
      postedBy: req.user._id,
      // If an image file was uploaded, store its server path; otherwise store an empty string
      image: req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : '',
      // If a document file was uploaded, store its server path; otherwise store an empty string
      document: req.files && req.files.document ? `/uploads/${req.files.document[0].filename}` : '',
    });

    // Save the new internship offer to the database
    const createdStage = await stage.save();
    // Return status 201 (Created) along with the saved document
    res.status(201).json(createdStage);
  } catch (error) {
    // Handle database validation or file uploading errors
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an existing stage offer (e.g., modify text, change status, or upload files)
// @route   PUT /api/stages/:id
// @access  Private/ChefDept
export const updateStage = async (req, res) => {
  try {
    // Search the database for the internship offer by its ID
    const stage = await Stage.findById(req.params.id);

    // If the offer exists in the database
    if (stage) {
      // Update basic fields if new values are provided in the request body, otherwise keep current ones
      stage.title = req.body.title || stage.title;
      stage.companyName = req.body.companyName || stage.companyName;
      stage.location = req.body.location || stage.location;
      stage.duration = req.body.duration || stage.duration;
      stage.type = req.body.type || stage.type;
      stage.status = req.body.status || stage.status;
      stage.description = req.body.description || stage.description;
      stage.contactEmail = req.body.contactEmail || stage.contactEmail;
      stage.deadline = req.body.deadline || stage.deadline;
      
      // Update requirements: parse them from JSON if sent as a string (often from forms), or keep as array
      if (req.body.requirements) {
        stage.requirements = Array.isArray(req.body.requirements) ? req.body.requirements : JSON.parse(req.body.requirements);
      }
      
      // If new files were uploaded through the request, update their paths
      if (req.files) {
        if (req.files.image) stage.image = `/uploads/${req.files.image[0].filename}`;
        if (req.files.document) stage.document = `/uploads/${req.files.document[0].filename}`;
      }

      // Save the updated document back to the database
      const updatedStage = await stage.save();
      // Respond with the updated internship document
      res.json(updatedStage);
    } else {
      // If the internship offer could not be found, return 404
      res.status(404).json({ message: 'Stage not found' });
    }
  } catch (error) {
    // Return a 500 status on database or runtime error
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a stage offer
// @route   DELETE /api/stages/:id
// @access  Private/ChefDept
export const deleteStage = async (req, res) => {
  try {
    // Search for the internship by its ID
    const stage = await Stage.findById(req.params.id);

    // If found, delete the record from the database
    if (stage) {
      await Stage.deleteOne({ _id: stage._id });
      // Return a success confirmation message
      res.json({ message: 'Stage offer removed' });
    } else {
      // Return 404 if the internship offer doesn't exist
      res.status(404).json({ message: 'Stage offer not found' });
    }
  } catch (error) {
    // Return a 500 status code on error
    res.status(500).json({ message: error.message });
  }
};
