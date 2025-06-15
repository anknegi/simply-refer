const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User'); // To get referrer email for notifications
const { protect, authorizeRoles } = require('../middleware/auth.middleware');
// For file uploads (e.g., resume), you'd use Multer here
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary destination, use cloud storage in production
// For email sending
const nodemailer = require('nodemailer');

// Configure Nodemailer (replace with your actual email service details)
const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'gmail', 'SendGrid', 'Mailgun'
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    }
});

// @route   POST /api/jobs
// @desc    Create a new job post
// @access  Private (Employee only)
router.post('/', protect, authorizeRoles('employee'), async (req, res) => {
    const { title, description, requirements, location, employmentType } = req.body;

    if (!title || !description || !requirements || !location) {
        return res.status(400).json({ message: 'Please fill all required job fields.' });
    }

    try {
        const newJob = new Job({
            title,
            description,
            requirements,
            location,
            employmentType,
            referrerId: req.user.id, // ID of the logged-in employee
            companyId: req.user.companyId // Company ID of the logged-in employee
        });

        const job = await newJob.save();
        res.status(201).json({ message: 'Job posted successfully!', job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during job creation.', error: error.message });
    }
});

// @route   GET /api/jobs
// @desc    Get all public job listings
// @access  Public (Job seekers)
router.get('/', async (req, res) => {
    try {
        // Fetch all active jobs, populate referrer details and company name
        const jobs = await Job.find({ status: 'active' })
            .populate('referrerId', 'name email') // Only get name and email of the referrer
            .populate('companyId', 'name'); // Only get company name

        res.status(200).json({ message: 'Jobs retrieved successfully!', jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching jobs.', error: error.message });
    }
});

// @route   GET /api/jobs/my
// @desc    Get jobs posted by the logged-in employee
// @access  Private (Employee only)
router.get('/my', protect, authorizeRoles('employee'), async (req, res) => {
    try {
        const jobs = await Job.find({ referrerId: req.user.id })
            .populate('companyId', 'name'); // Populate company name
        res.status(200).json({ message: 'Your posted jobs retrieved successfully!', jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching your jobs.', error: error.message });
    }
});

// @route   GET /api/jobs/:id
// @desc    Get a specific job detail
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('referrerId', 'name email')
            .populate('companyId', 'name');

        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }
        res.status(200).json({ message: 'Job retrieved successfully!', job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching job details.', error: error.message });
    }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job post
// @access  Private (Employee only, for their jobs)
router.put('/:id', protect, authorizeRoles('employee'), async (req, res) => {
    const { title, description, requirements, location, employmentType, status } = req.body;

    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Ensure the logged-in user is the referrer of this job
        if (job.referrerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this job.' });
        }

        job.title = title || job.title;
        job.description = description || job.description;
        job.requirements = requirements || job.requirements;
        job.location = location || job.location;
        job.employmentType = employmentType || job.employmentType;
        job.status = status || job.status;

        await job.save();
        res.status(200).json({ message: 'Job updated successfully!', job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during job update.', error: error.message });
    }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job post
// @access  Private (Employee only, for their jobs)
router.delete('/:id', protect, authorizeRoles('employee'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Ensure the logged-in user is the referrer of this job
        if (job.referrerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this job.' });
        }

        await job.deleteOne(); // Use deleteOne() for Mongoose v6+
        res.status(200).json({ message: 'Job deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during job deletion.', error: error.message });
    }
});

// @route   POST /api/jobs/:jobId/apply
// @desc    Submit a job application
// @access  Public (Job seeker, can be a guest)
router.post('/:jobId/apply', upload.single('resume'), async (req, res) => {
    const { applicantName, applicantEmail, applicantPhone, coverLetter, jobSeekerId } = req.body;
    const jobId = req.params.jobId;
    const resumeFile = req.file; // File uploaded by multer

    if (!applicantName || !applicantEmail || !jobId || !resumeFile) {
        return res.status(400).json({ message: 'Please fill all required application fields (Name, Email, Job, Resume).' });
    }

    try {
        // In a real application, you'd upload resumeFile.path to a cloud storage (S3, GCS)
        // and get a public URL. For this example, we'll use a placeholder.
        const resumeUrl = `http://your-cloud-storage.com/${resumeFile.filename}`; // Placeholder

        const newApplication = new Application({
            jobId,
            jobSeekerId: jobSeekerId || null, // Can be null if guest user
            applicantName,
            applicantEmail,
            applicantPhone,
            resumeUrl,
            coverLetter
        });

        await newApplication.save();

        // --- Email Notification Logic ---
        const job = await Job.findById(jobId).populate('referrerId', 'email name');
        if (job && job.referrerId) {
            const referrerEmail = job.referrerId.email;
            const referrerName = job.referrerId.name;

            const mailOptions = {
                from: process.env.EMAIL_USER, // Your verified sender email
                to: referrerEmail,
                subject: `New Job Application for: ${job.title}`,
                html: `
                    <p>Dear ${referrerName},</p>
                    <p>You have received a new application for your job posting: <strong>${job.title}</strong>.</p>
                    <p><strong>Applicant Name:</strong> ${applicantName}</p>
                    <p><strong>Applicant Email:</strong> ${applicantEmail}</p>
                    <p><strong>Applicant Phone:</strong> ${applicantPhone || 'N/A'}</p>
                    <p><strong>Resume:</strong> <a href="${resumeUrl}">Download Resume</a></p>
                    <p><strong>Cover Letter:</strong></p>
                    <p>${coverLetter || 'N/A'}</p>
                    <p>Thank you,</p>
                    <p>Your Job Referral App Team</p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        }
        // --- End Email Notification Logic ---

        res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during application submission.', error: error.message });
    }
});


// @route   GET /api/jobs/:jobId/applications
// @desc    Get applications for a specific job (for referrer)
// @access  Private (Employee only)
router.get('/:jobId/applications', protect, authorizeRoles('employee'), async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Ensure the logged-in user is the referrer of this job
        if (job.referrerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view applications for this job.' });
        }

        const applications = await Application.find({ jobId })
            .populate('jobSeekerId', 'name email'); // Optionally populate job seeker details

        res.status(200).json({ message: 'Applications retrieved successfully!', applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching applications.', error: error.message });
    }
});


// @route   GET /api/applications/my
// @desc    Get applications submitted by the logged-in job seeker
// @access  Private (Job Seeker only)
router.get('/applications/my', protect, authorizeRoles('job_seeker'), async (req, res) => {
    try {
        const applications = await Application.find({ jobSeekerId: req.user.id })
            .populate('jobId', 'title companyId') // Populate job title and company ID
            .populate('companyId', 'name'); // Populate company name

        res.status(200).json({ message: 'Your applications retrieved successfully!', applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching your applications.', error: error.message });
    }
});


module.exports = router;