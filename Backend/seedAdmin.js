/**
 * Admin Seed Script
 * Creates the default ADMIN user if one doesn't already exist.
 *
 * Usage:  node seedAdmin.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iset_gafsa';

const adminData = {
  firstName: 'System',
  lastName: 'Admin',
  email: 'admin@iset.tn',
  password: 'iset123',
  role: 'ADMIN',
  isActive: true,
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'ADMIN' });

    if (existingAdmin) {
      console.log(`⚠️  An ADMIN user already exists: ${existingAdmin.email}`);
      console.log('   Skipping seed. Delete the existing admin first if you want to re-create.');
    } else {
      const admin = await User.create(adminData);
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email:    ${admin.email}`);
      console.log(`   Password: iset123`);
      console.log(`   Role:     ${admin.role}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedAdmin();
