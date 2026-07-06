const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Allowed Origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://place-prep-sooty.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman/mobile apps/no origin
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      console.log('Blocked Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());

// ====================
// Test Routes
// ====================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Placement Prep API running 🚀',
    version: 'TEST-123',
    time: new Date(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'Connected',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ====================
// API Routes
// ====================

app.use('/api/auth', require('./routes/auth'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// ====================
// 404 Handler
// ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ====================
// Global Error Handler
// ====================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ====================
// Start Server
// ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});