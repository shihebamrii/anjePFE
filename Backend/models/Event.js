import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema for campus Events, deadlines, and holiday announcements
const eventSchema = new mongoose.Schema(
  {
    // Headline or title of the event
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Detailed description of the event details/activities
    description: {
      type: String,
      required: true,
    },
    // Date and time when the event begins
    startDate: {
      type: Date,
      required: true,
    },
    // Date and time when the event concludes
    endDate: {
      type: Date,
      required: true,
    },
    // Type classification of the event
    type: {
      type: String,
      enum: ['academic', 'exam', 'holiday', 'event', 'deadline'],
      default: 'event',
    },
    // Physical location on campus or remote meeting link
    location: {
      type: String,
      default: '',
    },
    // Targeted user categories who can view the announcement
    audience: [{
      type: String,
      enum: ['all', 'students', 'teachers', 'staff', 'specific_department'],
      default: ['all'],
    }],
    // Reference to the User who created/scheduled this event (User document)
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Path or URL to promotional event poster/image
    image: {
      type: String,
      default: '',
    },
    // Path or URL to supplementary PDF or documentation file
    document: {
      type: String,
      default: '',
    },
  },
  // Automatically manage 'createdAt' and 'updatedAt' timestamps in DB
  { timestamps: true }
);

// Create the model
const Event = mongoose.model('Event', eventSchema);
export default Event;
