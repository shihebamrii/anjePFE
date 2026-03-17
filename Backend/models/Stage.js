import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true, // e.g., "3 mois", "6 mois"
    },
    type: {
      type: String,
      enum: ['PFE', 'OUVRIER', 'PERFECTIONNEMENT', 'SUMMER'],
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'FILLED'],
      default: 'OPEN',
    },
    requirements: [{
      type: String,
    }],
    description: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Partner or Admin who posted it
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

const Stage = mongoose.model('Stage', stageSchema);
export default Stage;
