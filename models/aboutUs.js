const mongoose = require('mongoose');

// Define the schema for the Department model
const aboutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true      // Trims leading/trailing spaces
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // This option will add `createdAt` and `updatedAt` automatically
});

// Pre-save middleware to format the `name` field
aboutSchema.pre('save', function (next) {
    if (this.title) {
        this.title = this.title
            .toLowerCase() // Convert all to lowercase first
            .split(' ') // Split the name into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join words back with spaces
    }
    next();
});
// Create the Department model
const AboutUs = mongoose.model('AboutUs', aboutSchema);

module.exports = AboutUs;
