import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['academic', 'exam', 'holiday', 'event', 'deadline'],
      default: 'event',
    },
    location: {
      type: String,
      default: '',
    },
    audience: [{
      type: String,
      enum: ['all', 'students', 'teachers', 'staff', 'specific_department'],
      default: ['all'],
    }],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    document: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
