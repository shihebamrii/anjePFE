import mongoose from 'mongoose'; // MongoDB object modeling tool (ODM)

// Define the database schema for News articles and official university announcements
const newsSchema = new mongoose.Schema(
  {
    // Headline or title of the news article
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Main HTML/text body content of the article
    content: {
      type: String,
      required: true,
    },
    // Brief summary text snippet (used in list views)
    excerpt: {
      type: String,
      required: true,
    },
    // Classification category for grouping/filtering articles
    category: {
      type: String,
      enum: ['academic', 'clubs', 'admin', 'events', 'research', 'announcements'],
      required: true,
    },
    // Format type of announcement card
    type: {
      type: String,
      enum: ['article', 'announcement', 'event', 'urgent'],
      default: 'article',
    },
    // Publication lifecycle status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    // Reference link to the User document who authored/published this article
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Uploaded cover image URL or filename path
    image: {
      type: String,
      default: '',
    },
    // Supplementary uploaded attachment document path (e.g. PDF list or forms)
    document: {
      type: String,
      default: '',
    },
    // Keyword tags array for categorization
    tags: [{ type: String }],
    // Importance classification level
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    // Estimated reading time in minutes
    readTime: {
      type: Number,
      default: 0,
    },
    // Count of total unique views/impressions
    views: {
      type: Number,
      default: 0,
    },
    // Count of total likes or reactions
    likes: {
      type: Number,
      default: 0,
    },
  },
  // Automatically manage 'createdAt' and 'updatedAt' database timestamps
  { timestamps: true }
);

// Create the model
const News = mongoose.model('News', newsSchema);
export default News;
