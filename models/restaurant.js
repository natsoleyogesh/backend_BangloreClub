const mongoose = require('mongoose');

// Define the schema for the Restaurant model
const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,  // Ensures no two restaurants have the same name
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
    timestamps: true // Adds `createdAt` and `updatedAt` automatically
});

// Create the Restaurant model
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
