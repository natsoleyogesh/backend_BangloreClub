const mongoose = require('mongoose');

// Define the schema for the Department model
const designationSchema = new mongoose.Schema({
    designationName: {
        type: String,
        required: true,
        trim: true      // Trims leading/trailing spaces
    },
    status: {
        type: String,
        enum: ['active', 'inactive'], // Only these two values are allowed
        default: 'active'             // Default status is 'active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // This option will add `createdAt` and `updatedAt` automatically
});

// Pre-save middleware to format the `name` field
designationSchema.pre('save', function (next) {
    if (this.designationName) {
        // Convert to title case (e.g., "OTHER Tax" → "Other Tax")
        this.designationName = this.designationName
            .toLowerCase() // Convert all to lowercase first
            .split(' ') // Split the name into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join words back with spaces
    }
    next();
});
// Create the Department model
const Designation = mongoose.model('Designation', designationSchema);

module.exports = Designation;
