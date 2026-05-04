/**
 * Reset All Passwords Script
 * Sets every user's password in the database to "iset123" (bcrypt-hashed).
 *
 * Usage:  node resetPasswords.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iset_gafsa';
const NEW_PASSWORD = 'iset123';

async function resetAllPasswords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    // Update every user directly (bypasses the pre-save hook)
    const result = await mongoose.connection.db
      .collection('users')
      .updateMany({}, { $set: { password: hashedPassword } });

    console.log(`✅ Done — ${result.modifiedCount} user(s) updated to password "${NEW_PASSWORD}"`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

resetAllPasswords();
