const mongoose = require('mongoose');

// Define the schema for the Amenities model
const amenitiesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,  // Ensures no two amenities have the same name
        trim: true      // Trims leading/trailing spaces
    },
    icon: {
        type: String,    // Store the SVG icon as a string (could be a URL or inline SVG)
        required: true   // Ensure each amenity has an associated icon
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
    timestamps: true // Adds `createdAt` and `updatedAt` automatically
});

// Create the Amenities model
const Amenities = mongoose.model('Amenities', amenitiesSchema);

module.exports = Amenities;
