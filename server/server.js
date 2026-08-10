const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const sequelize = require('./config/db');

const authRoutes = require('./routes/auth');
const promiseRoutes = require('./routes/promises');
const moderationRoutes = require('./routes/moderation');
const districtRoutes = require('./routes/districts');
const constituencyRoutes = require('./routes/constituencies');
const representativeRoutes = require('./routes/representatives');
const budgetRoutes = require('./routes/budgetProjects');
const complaintRoutes = require('./routes/complaints');
const rtiRoutes = require('./routes/rtiRequests');
const civicEventRoutes = require('./routes/civicEvents');
const partyRoutes = require('./routes/parties');
const adminRoutes = require('./routes/admin');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading local uploads in browser
}));
app.use(cors({
  origin: '*', // Allow all origins for the academic prototype
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express parser
app.use(express.json());

// Trust proxy for rate limiting (especially on Vercel/Render deployments)
app.set('trust proxy', 1);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/promises', promiseRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/constituencies', constituencyRoutes);
app.use('/api/representatives', representativeRoutes);
app.use('/api/budget-projects', budgetRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/rti-requests', rtiRoutes);
app.use('/api/civic-events', civicEventRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Nirikshan Watchdog Platform API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize database connection and sync tables if in dev mode
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    if (sequelize.options.dialect === 'postgres') {
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
      console.log('PostGIS extension verified/created.');
    }

    // sync models (optional, for development purposes)
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      await sequelize.sync();
      console.log('Database tables synchronized.');
    }

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();

module.exports = app;


