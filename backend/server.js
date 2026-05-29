require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/db');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const parentRoutes = require('./routes/parent');
const studentRoutes = require('./routes/student');
const commonRoutes = require('./routes/common');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration (allow requests from development frontend ports)
app.use(cors({
  origin: '*', // For local dev and demonstration ease-of-use
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root path diagnostic greeting
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SmartSchool LK School Administration API Gateway.',
    status: 'ONLINE',
    time: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api', commonRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Database Bootstrap & Server Boot
async function startServer() {
  try {
    // Spin up SQLite schemas & demo data
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`SmartSchool LK REST API is running on http://localhost:${PORT}`);
      console.log(`Mode: Development / Portfolio Demonstration`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize database and boot server:', error);
    process.exit(1);
  }
}

startServer();
