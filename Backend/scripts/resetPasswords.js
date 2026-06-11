import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load env from Backend/.env if available, otherwise from root
const envPath = path.resolve(process.cwd(), 'Backend', '.env');
dotenv.config({ path: envPath });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anjePFE';
const NEW_PASSWORD = 'iset123';

async function main() {
  console.log('Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const users = await User.find();
  console.log(`Found ${users.length} users`);

  for (const user of users) {
    user.password = NEW_PASSWORD;
    await user.save();
  }

  console.log('Password reset complete for all users to:', NEW_PASSWORD);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error updating passwords:', err);
  process.exit(1);
});
