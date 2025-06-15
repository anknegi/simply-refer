require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing
const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');

// Middleware
app.use(express.json()); // Enable Express to parse JSON request bodies
app.use(cors()); // Allow all CORS requests for development. In production, configure specific origins.

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Basic route for testing server
app.get('/', (req, res) => {
    res.send('Job Referral App Backend is running!');
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});