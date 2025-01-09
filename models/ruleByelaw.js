// const mongoose = require("mongoose");

// const ruleByelawSchema = new mongoose.Schema(
//     {
//         type: {
//             type: String,
//             enum: ["Rule", "Byelaw"], // Rule or Bylaw
//             required: true,
//         },
//         title: {
//             type: String, // Rule/Bylaw title
//             required: true,
//             trim: true,
//         },
//         description: {
//             type: String, // Description of the rule or bylaw
//             required: true,
//         },
//         isExpandable: {
//             type: Boolean, // Whether it is expandable in the UI
//             default: false,
//         },
//         status: {
//             type: String,
//             enum: ["Active", "Inactive"], // Active or Inactive
//             default: "Active",
//         },
//     },
//     {
//         timestamps: true, // Automatically adds createdAt and updatedAt
//     }
// );

// // Pre-save middleware to format the `name` field
// ruleByelawSchema.pre('save', function (next) {
//     if (this.title) {
//         // Convert to title case (e.g., "OTHER Tax" → "Other Tax")
//         this.title = this.title
//             .toLowerCase() // Convert all to lowercase first
//             .split(' ') // Split the name into words
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
//             .join(' '); // Join words back with spaces
//     }
//     next();
// });

// const ClubRuleByelaw = mongoose.model("ClubRuleBylaw", ruleByelawSchema);
// module.exports = ClubRuleByelaw;


const mongoose = require('mongoose');

// Define the Downloads Schema
const ruleByelawSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
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
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Method to check if a record is "current" or "history"
ruleByelawSchema.methods.isCurrent = function () {
    const currentYear = new Date().getFullYear();
    return this.createdAt.getFullYear() === currentYear;
};

// Pre-save middleware to format the `name` field
ruleByelawSchema.pre('save', function (next) {
    if (this.title) {
        // Convert to title case (e.g., "OTHER Tax" → "Other Tax")
        this.title = this.title
            .toLowerCase() // Convert all to lowercase first
            .split(' ') // Split the name into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join words back with spaces
    }
    next();
});

const ClubRuleByelaw = mongoose.model("ClubRuleBylaw", ruleByelawSchema);
module.exports = ClubRuleByelaw;