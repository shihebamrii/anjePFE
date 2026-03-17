import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    courseName: {
      type: String,
    },
    teacher: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
    },
    room: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
      name: { type: String },
    },
    classId: {
      type: mongoose.Schema.Types.Mixed, // External string ID or Internal ObjectId
    },
    className: {
      type: String,
    },
    type: {
      type: String, // e.g., "LECTURE", "TUTORIAL", "PRACTICAL"
      default: 'LECTURE',
    },
    dayOfWeek: {
      type: Number, // 1 (Monday) to 6 (Saturday)
      required: true,
    },
    timeSlot: {
      type: Number, // 1 to 6 (1=08:30, 2=10:10, 3=11:50, 4=14:00, 5=15:40, 6=17:20)
      required: true,
    },
    semester: {
      type: Number,
      default: 1,
    },
    group: {
      type: String,
      default: '', // For TP groups like "Groupe 1", "Groupe 2"
    },
    externalId: {
       type: String,
    }
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);
export default Session;
