import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    durationHours: {
      type: Number,
      required: true,
      default: 1.5,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
      required: true,
      default: 'ABSENT',
    },
    sessionType: {
      type: String,
      enum: ['COURS', 'TD', 'TP', 'EXAM'],
      default: 'COURS',
    },
    justification: {
      type: String,
      default: '',
    },
    justified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: -1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
