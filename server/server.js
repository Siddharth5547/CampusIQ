const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Load environment variables from server/.env and root .env
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting localhost, 127.0.0.1, and configured client URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  'https://campusiq-tawny.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB and start server
let cachedPromise = null;

const ensureDefaultUsers = async () => {
  try {
    const User = require('./models/User');
    const adminExists = await User.exists({ role: 'admin' });
    if (!adminExists) {
      console.log('Seeding default demo users...');
      const defaultUsers = [
        { name: 'Admin User', email: 'admin@campuscare.edu', password: 'Admin@123', role: 'admin', department: 'Administration' },
        { name: 'Rajesh Kumar', email: 'staff1@campuscare.edu', password: 'Staff@123', role: 'staff', department: 'Electrical Department' },
        { name: 'Priya Sharma', email: 'staff2@campuscare.edu', password: 'Staff@123', role: 'staff', department: 'Plumbing & Civil Department' },
        { name: 'Arjun Mehta', email: 'student1@campuscare.edu', password: 'Student@123', role: 'student', studentId: 'STU2024001', department: 'Computer Science' }
      ];
      for (const u of defaultUsers) {
        const exists = await User.exists({ email: u.email });
        if (!exists) {
          await User.create(u);
        }
      }
      console.log('✅ Demo users created.');
    }
  } catch (err) {
    console.error('Initial user seed notice:', err.message);
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    if (isProd) {
      console.error('❌ MONGODB_URI is not configured in environment variables. Database connection aborted.');
      return null;
    }
    console.warn('⚠️  MONGODB_URI not provided. Falling back to local MongoDB for development.');
  }

  const targetUri = mongoUri || 'mongodb://localhost:27017/campuscare';

  cachedPromise = mongoose.connect(targetUri, {
    serverSelectionTimeoutMS: 15000,
  }).then(async (conn) => {
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    ensureDefaultUsers().catch(() => {});
    return conn;
  }).catch((error) => {
    cachedPromise = null;
    console.error(`❌ MongoDB connection error: ${error.message}`);
    if (isProd) {
      console.error('⚠️  Ensure your MongoDB Atlas network access IP whitelist (0.0.0.0/0) and credentials in MONGODB_URI are correct.');
    }
    throw error;
  });

  return cachedPromise;
};

// Ensure database connection for all incoming API requests (vital for serverless cold-starts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    // Handled in individual controllers
  }
  next();
});

// Health check (mounted after connection middleware so it accurately reports readiness)
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    success: true,
    message: 'CampusCare API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use(errorHandler);

// In standalone / development environments, start HTTP listener
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 CampusCare server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  });
}

module.exports = app;
