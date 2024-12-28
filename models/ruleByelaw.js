const mongoose = require("mongoose");

const ruleByelawSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Rule", "Byelaw"], // Rule or Bylaw
            required: true,
        },
        title: {
            type: String, // Rule/Bylaw title
            required: true,
            trim: true,
        },
        description: {
            type: String, // Description of the rule or bylaw
            required: true,
        },
        isExpandable: {
            type: Boolean, // Whether it is expandable in the UI
            default: false,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"], // Active or Inactive
            default: "Active",
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

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
