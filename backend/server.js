import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve .env path from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import app from './app.js';
import { connectDB } from './config/database.js';


const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(
        `\x1b[36m[Server Running]: Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}\x1b[0m`
      );
    });

    // Handle Unhandled Promise Rejections (e.g. Async Errors outside Express)
    process.on('unhandledRejection', (err) => {
      console.error(`\x1b[31m[Unhandled Rejection]: ${err.message}\x1b[0m`);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error(`\x1b[31m[Server Startup Error]: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

startServer();