const mongoose = require("mongoose");

// Define the schema for RoomGuideline
const roomGuidelineSchema = new mongoose.Schema(
    {
        guidlineDescription: {
            type: String,
            required: true, // Description is required
        },
        roomConditionDescription: {
            type: String,
            required: true, // Description is required
        },
        createdAt: {
            type: Date,
            default: Date.now, // Automatically set the current date for createdAt
        },
        updatedAt: {
            type: Date,
            default: Date.now, // Automatically set the current date for updatedAt
        },
    },
    {
        timestamps: true, // This automatically adds `createdAt` and `updatedAt` fields
    }
);

// Create the RoomGuideline model based on the schema
const RoomGuidelineOrCondition = mongoose.model("RoomGuidelineOrCondition", roomGuidelineSchema);

module.exports = RoomGuidelineOrCondition;
