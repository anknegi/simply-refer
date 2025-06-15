const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    domain: {
        type: String, // e.g., 'example.com' for employee registration validation
        required: false, // Not strictly required if manual company creation
        trim: true
    },
    logoUrl: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', CompanySchema);