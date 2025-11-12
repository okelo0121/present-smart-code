import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import attendanceRoutes from './routes/attendanceRoutes';

// Debug: Log environment variables
console.log('[CONFIG] RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set');
console.log('[CONFIG] MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Not set');
console.log('[CONFIG] JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');

const app: Express = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/present-smart';

// Middleware
const allowedOrigins = [
  'http://localhost:8080',           // local frontend
  'http://localhost:5173',           // optional Vite dev server
  'https://edutrackst.vercel.app'   // deployed frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err.message || err);
  console.error('[STACK]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Database connection
async function connectDatabase(): Promise<void> {
  try {
    console.log('[DB] Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Start server
async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });

    // Handle server errors
    server.on('error', (err: any) => {
      console.error('✗ Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(error => {
  console.error('✗ Unhandled error:', error);
  process.exit(1);
});
