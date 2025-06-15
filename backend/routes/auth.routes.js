const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company'); // Assuming Company model exists for employee registration
const { protect } = require('../middleware/auth.middleware');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user (employee or job seeker)
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, companyName, companyDomain } = req.body;

    // Simple validation
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        let companyId = null;
        if (role === 'employee') {
            if (!companyName) {
                return res.status(400).json({ message: 'Company name is required for employees.' });
            }
            let company = await Company.findOne({ name: companyName });
            if (!company) {
                // If company doesn't exist, create it (or handle via admin interface)
                company = new Company({ name: companyName, domain: companyDomain });
                await company.save();
            }
            companyId = company._id;
        }

        user = new User({
            name,
            email,
            password,
            role,
            companyId: role === 'employee' ? companyId : null,
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId
            },
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Logged in successfully!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId
            },
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    // req.user is populated by the protect middleware
    res.status(200).json({
        message: 'User profile retrieved successfully!',
        user: req.user,
    });
});

module.exports = router;