/**
 * Reset All Passwords Script
 * Sets every user's password in the database to "iset123" (bcrypt-hashed).
 *
 * Usage:  node resetPasswords.js
 */

import dotenv from 'dotenv'; // Load variables from .env file
import mongoose from 'mongoose'; // Mongoose ODM for database connection
import bcrypt from 'bcrypt'; // Bcrypt library to hash passwords

// Initialize environment configuration
dotenv.config();

// Determine connection URL and define the new universal password string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anjePFE';
const NEW_PASSWORD = 'iset123';

// Main async function to reset passwords for all accounts in the database
async function resetAllPasswords() {
  try {
    // Connect to the database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Generate salt rounds and hash the new password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    // Perform a bulk update directly on the 'users' collection to set the new hashed password.
    // We use the direct MongoDB collection driver to bypass Mongoose's save middleware,
    // avoiding unnecessary schema checks or triggering pre-save hooks again.
    const result = await mongoose.connection.db
      .collection('users')
      .updateMany({}, { $set: { password: hashedPassword } });

    console.log(`✅ Done — ${result.modifiedCount} user(s) updated to password "${NEW_PASSWORD}"`);
  } catch (error) {
    // Log any errors that occurred during the process
    console.error('❌ Error:', error.message);
  } finally {
    // Safely disconnect from the database
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
resetAllPasswords();
