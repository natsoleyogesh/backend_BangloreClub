const mongoose = require('mongoose');

const banquetCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Automatically manages `createdAt` and `updatedAt`
    }
);

// Pre-save middleware to format the `name` field
banquetCategorySchema.pre('save', function (next) {
    if (this.name) {
        // Convert to title case (e.g., "OTHER Tax" → "Other Tax")
        this.name = this.name
            .toLowerCase() // Convert all to lowercase first
            .split(' ') // Split the name into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join words back with spaces
    }
    next();
});

const BanquetCategory = mongoose.model('BanquetCategory', banquetCategorySchema);

module.exports = BanquetCategory;
