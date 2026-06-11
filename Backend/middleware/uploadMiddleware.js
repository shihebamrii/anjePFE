import multer from 'multer'; // Import multer for handling file uploads/multipart form-data
import path from 'path'; // Import path module for filename operations and directory resolution

// Set up disk storage configuration for Multer
const storage = multer.diskStorage({
  // Specify destination folder where files should be saved
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store uploaded files inside the "uploads/" directory
  },
  // Determine naming convention for uploaded files to prevent name collisions
  filename: function (req, file, cb) {
    // Generate a unique filename using fieldname, current timestamp, and original file extension
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Helper function to validate file types/extensions
function checkFileType(file, cb) {
  // Define regular expression matching allowed extensions (Images, PDF, and Word documents)
  const filetypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
  
  // Verify if the uploaded file's extension matches the allowed formats (case-insensitive)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Verify if the MIME type matches the allowed formats, with fallback string checking for PDF/Word
  const mimetype = filetypes.test(file.mimetype) || file.mimetype.includes('pdf') || file.mimetype.includes('word');

  // If both file extension and MIME type are valid, accept the file
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    // Return error if file type is unsupported
    cb(new Error('Erreur: Fichiers non supportés (Images, PDF, Word uniquement)'));
  }
}

// Initialize the Multer middleware instance with config
const upload = multer({
  storage: storage, // Assign the configured disk storage engine
  limits: { fileSize: 10000000 }, // Set maximum file size limit to 10MB (10,000,000 bytes)
  // Define standard file validation handler using the checkFileType helper
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

export default upload; // Export the upload middleware for use in routes that accept file uploads
