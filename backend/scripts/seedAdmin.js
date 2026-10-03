import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Resolve .env path from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'DCS Admin';

    if (!adminEmail || !adminPassword || adminPassword.length < 12) {
      throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in backend/.env');
    }

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/dcs_uaf_db';

    await mongoose.connect(mongoUri);
    console.log('\x1b[32m[Database Connected]: Ready for Seeding...\x1b[0m');

    // Existing admin check
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('\x1b[33m[Seeder Warning]: Admin user already exists!\x1b[0m');
      process.exit(0);
    }

    const adminData = {
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'superadmin',
    };

    await User.create(adminData);
    console.log('\x1b[32m[Seeder Success]: Admin user created successfully!\x1b[0m');
    console.log(`\x1b[36mEmail: ${adminEmail}\x1b[0m`);

    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m[Seeder Error]: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

seedAdmin();