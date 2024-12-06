const mongoose = require('mongoose');

// Define the schema for the Department model
const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        unique: true,  // Ensures no two departments have the same name
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

// Create the Department model
const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
