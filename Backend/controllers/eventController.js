import Event from '../models/Event.js'; // Import Event database model

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const { type, audience } = req.query; // Extract search criteria from query params
    let query = {};

    // Filter by type or target audience if specified
    if (type) query.type = type;
    if (audience) query.audience = { $in: [audience, 'all'] };

    // Query DB, populate organizer information, and sort chronologically by start date
    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName')
      .sort({ startDate: 1 });
      
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    // Locate specific event using ID parameter and populate creator name
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName');

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, type, location, audience } = req.body;

    // audience arrives as a JSON string from FormData, parse it into an array
    let parsedAudience = audience;
    if (typeof audience === 'string') {
      try { parsedAudience = JSON.parse(audience); } catch (e) { parsedAudience = [audience]; }
    }

    // Initialize new Event document, mapping file upload paths if present in the files collection
    const event = new Event({
      title,
      description,
      startDate,
      endDate,
      type,
      location,
      audience: parsedAudience,
      organizer: req.user._id, // Assign organizer ID from session user context
      image: req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : '',
      document: req.files && req.files.document ? `/uploads/${req.files.document[0].filename}` : '',
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/ChefDept
export const updateEvent = async (req, res) => {
  try {
    // Locate event to update
    const event = await Event.findById(req.params.id);

    if (event) {
      const { title, description, startDate, endDate, type, location, audience } = req.body;

      // Conditionally edit properties
      event.title = title || event.title;
      event.description = description || event.description;
      event.startDate = startDate || event.startDate;
      event.endDate = endDate || event.endDate;
      event.type = type || event.type;
      event.location = location || event.location;
      if (audience) {
        // Parse audience list strings if parsed as serialized text
        event.audience = Array.isArray(audience) ? audience : JSON.parse(audience);
      }

      // Update uploaded media files if replacement is attached
      if (req.files) {
        if (req.files.image) event.image = `/uploads/${req.files.image[0].filename}`;
        if (req.files.document) event.document = `/uploads/${req.files.document[0].filename}`;
      }

      // Commit changes to database
      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/ChefDept
export const deleteEvent = async (req, res) => {
  try {
    // Locate target event by ID
    const event = await Event.findById(req.params.id);

    if (event) {
      // Execute deletion
      await Event.deleteOne({ _id: event._id });
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
