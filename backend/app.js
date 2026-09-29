import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';
// 1. IMPORT FACULTY ROUTES (Fix Added)
import facultyRoutes from './faculty/routes/facultyRoutes.js';
import workloadRoutes from './workload/routes/workloadRoutes.js';
//import contactRoutes from './contact/contactRoutes.js';
import noticeRoutes from './notice/routes/noticeRoutes.js';
//import contactRoutes from './routes/contactRoutes.js';
import contactRoutes from './contact/Contactroutes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.100.4:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.CLIENT_URL === origin) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static Folder for Uploaded Images Access
app.use('/uploads', express.static(path.join(__dirname, 'faculty/storage/facultyImages')));

// Base Health Check Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DCS PARS Backend System is operational!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/downloads', downloadRoutes);
// 2. MOUNT FACULTY ROUTE (Fix Added)
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/workload', workloadRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/contact', contactRoutes);
//app.use('/api/v1/contact', contactRoutes);

export default app;