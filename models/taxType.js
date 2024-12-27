const mongoose = require('mongoose');

// Define the schema for the TaxType model
const taxTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // enum: ['CGST', 'SGST', 'Luxury', 'Others', 'EmployeesGratisFund'], // Only these tax types are allowed
        unique: true, // Ensures each tax type is unique
        trim: true     // Trims leading/trailing spaces
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,         // Percentage must be a positive number
        max: 100        // The percentage must not exceed 100%
    },
    status: {
        type: String,
        enum: ['active', 'inactive'], // Only 'active' or 'inactive' are allowed
        default: 'active'             // Default status is 'active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` automatically
});

// Create the TaxType model
const TaxType = mongoose.model('TaxType', taxTypeSchema);

module.exports = TaxType;
