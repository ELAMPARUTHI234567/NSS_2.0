const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');

// Import Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const attendanceRoutes = require('./routes/attendance');
const nssInfoRoutes = require('./routes/nssInfo');
const announcementRoutes = require('./routes/announcements');
const certificateRoutes = require('./routes/certificates');
const achievementRoutes = require('./routes/achievements');
const galleryRoutes = require('./routes/gallery');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const activityLogRoutes = require('./routes/activityLogs');
const settingsRoutes = require('./routes/settings');
const bannerRoutes = require('./routes/banners');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
const configuredOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    // 1. If explicit CORS origins are configured
    if (configuredOrigins.length > 0) {
      if (configuredOrigins.includes('*') || configuredOrigins.includes(cleanOrigin)) {
        return callback(null, cleanOrigin);
      }
    }

    // 2. Default allow: Vercel frontend, Render, localhost
    if (
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1') ||
      cleanOrigin.endsWith('.onrender.com') ||
      configuredOrigins.length === 0
    ) {
      return callback(null, cleanOrigin);
    }

    return callback(null, cleanOrigin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/nss-info', nssInfoRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/banners', bannerRoutes);

// Base API Check & Health Check
app.get('/api', (req, res) => {
  res.json({ status: 'OK', message: 'NSS College Management API Server is running smoothly!', version: '2.0.0', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NSS College Management API Server health status: Active', timestamp: new Date() });
});

// Start Server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 NSS Management Backend API running on port http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
