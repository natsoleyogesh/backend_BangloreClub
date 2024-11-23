const mongoose = require('mongoose');

// Define the Downloads Schema
const clubNoticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'], // Status can be ACTIVE or INACTIVE
            default: 'Active',
        },
        expiredDate: {
            type: Date,
            default: null,
            required: true
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Method to check if a record is "current" or "history"
clubNoticeSchema.methods.isCurrent = function () {
    const currentYear = new Date().getFullYear();
    return this.createdAt.getFullYear() === currentYear;
};

// Export the model
const ClubNotice = mongoose.model('clubNotice', clubNoticeSchema);


module.exports = ClubNotice;
