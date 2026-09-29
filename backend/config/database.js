import mongoose from 'mongoose';

/**
 * Production-grade MongoDB Connection
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dcs_uaf_db';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`\x1b[32m[MongoDB Connected]: ${conn.connection.host} | Database: ${conn.connection.name}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m[MongoDB Connection Error]: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('\x1b[33m[MongoDB Warning]: Connection lost. Reconnecting...\x1b[0m');
});

mongoose.connection.on('error', (err) => {
  console.error(`\x1b[31m[MongoDB Event Error]: ${err.message}\x1b[0m`);
});