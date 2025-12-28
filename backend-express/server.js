const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Default Configuration Fallbacks (Robustness for missing .env)
if (!process.env.AI_TEXT_SERVICE_URL) process.env.AI_TEXT_SERVICE_URL = 'http://localhost:8002';
if (!process.env.AI_VOICE_SERVICE_URL) process.env.AI_VOICE_SERVICE_URL = 'http://localhost:8003';
if (!process.env.AI_FACE_SERVICE_URL) process.env.AI_FACE_SERVICE_URL = 'http://localhost:8004';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'mindful_ai_secret_key_2025';
if (!process.env.FRONTEND_URL) process.env.FRONTEND_URL = 'http://localhost:3000';

const app = express();

// =======================
// MIDDLEWARE
// =======================

// Security
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // Increased to 1000 to prevent throttling in dev sessions
});
app.use('/api/', limiter);

// CORS
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:3001',
            /\.vercel\.app$/ // Allow any Vercel preview/production links
        ];
        if (!origin || allowedOrigins.some(ao => ao instanceof RegExp ? ao.test(origin) : ao === origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// =======================
// MONGODB CONNECTION
// =======================

const connectDB = async () => {
    try {
        console.log(`Connecting to MongoDB at: ${process.env.MONGODB_URI}`);
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MONGODB CONNECTION FAILED:', error.message);
        process.exit(1); // Exit if DB is required and fails
    }
};

connectDB();

// =======================
// ROUTES
// =======================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'mental_health_api',
        version: '1.0.0',
        stack: 'MERN',
        database: req.isMongoConnected ? 'mongodb' : 'fallback-json',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chat', require('./routes/chat'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Mental Health API - MERN Stack',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            users: '/api/users',
            mood: '/api/mood',
            journal: '/api/journal',
            analysis: '/api/analysis',
            doctors: '/api/doctors',
            notifications: '/api/notifications'
        }
    });
});

// =======================
// ERROR HANDLING
// =======================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// =======================
// START SERVER
// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('🚀 MENTAL HEALTH API - MERN STACK');
    console.log('═══════════════════════════════════════════════');
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️  Database: MongoDB`);
    console.log(`🎨 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');
});

module.exports = app;
