/**
 * Admin Seed Script
 * Creates the default ADMIN user if one doesn't already exist.
 *
 * Usage:  node seedAdmin.js
 */

import dotenv from 'dotenv'; // Load environment variables helper
import mongoose from 'mongoose'; // Mongoose ODM for database interaction
import User from './models/User.js'; // Import the User database model

// Initialize dotenv configuration to parse process.env variables
dotenv.config();

// Determine database connection string from environment or fall back to local instance
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iset_gafsa';

// Define the default administrator account credentials and details
const adminData = {
  firstName: 'System',
  lastName: 'Admin',
  email: 'admin@iset.tn',
  password: 'iset123', // Will be hashed automatically by the pre-save hook in User model
  role: 'ADMIN',
  isActive: true,
};

// Asynchronous function to seed the administrator user in MongoDB
async function seedAdmin() {
  try {
    // Establish connection to MongoDB database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Query database to find if any user with role 'ADMIN' already exists
    const existingAdmin = await User.findOne({ role: 'ADMIN' });

    if (existingAdmin) {
      // Admin already exists, log warnings and abort creation
      console.log(`⚠️  An ADMIN user already exists: ${existingAdmin.email}`);
      console.log('   Skipping seed. Delete the existing admin first if you want to re-create.');
    } else {
      // Create new admin user in database using adminData definitions
      const admin = await User.create(adminData);
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email:    ${admin.email}`);
      console.log(`   Password: iset123`);
      console.log(`   Role:     ${admin.role}`);
    }
  } catch (error) {
    // Catch and print any database errors during connection or insertion
    console.error('❌ Error:', error.message);
  } finally {
    // Terminate database connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Execute the seed script
seedAdmin();
