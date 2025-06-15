const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    jobSeekerId: { // If the job seeker has an account
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null if applied as guest
    },
    applicantName: {
        type: String,
        required: true,
        trim: true
    },
    applicantEmail: {
        type: String,
        required: true,
        trim: true
    },
    applicantPhone: {
        type: String,
        required: false,
        trim: true
    },
    resumeUrl: { // URL to the uploaded resume in cloud storage
        type: String,
        required: true
    },
    coverLetter: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'rejected', 'hired'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', ApplicationSchema);