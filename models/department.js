const mongoose = require('mongoose');

// Define the schema for the Department model
const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        unique: true,  // Ensures no two departments have the same name
        trim: true      // Trims leading/trailing spaces
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
            "Please provide a valid email address",
        ],
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
departmentSchema.pre('save', function (next) {
    if (this.departmentName) {
        // Convert to title case (e.g., "OTHER Tax" → "Other Tax")
        this.departmentName = this.departmentName
            .toLowerCase() // Convert all to lowercase first
            .split(' ') // Split the name into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join words back with spaces
    }
    next();
});
// Create the Department model
const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
