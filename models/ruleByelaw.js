const mongoose = require("mongoose");

const ruleByelawSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Rule", "Byelaw"], // Rule or Bylaw
            required: true,
        },
        category: {
            type: String, // e.g., Club Rules, Banquet Rules
            required: true,
            trim: true,
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

const ClubRuleByelaw = mongoose.model("ClubRuleBylaw", ruleByelawSchema);
module.exports = ClubRuleByelaw;
