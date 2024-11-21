const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the Member model
            required: true,
        },
        gatekeeperId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin", // Reference to the Gatekeeper (User) model
            required: true,
        },
        activity: {
            type: String,
            enum: ["qrScan", "entryApproval", "exitApproval"], // Define the activities you want to track
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now, // Automatically logs the time of the activity
        },
        details: {
            type: String, // Additional details about the activity
            default: null,
        },
        ipAddress: {
            type: String, // To log IP address if available
            default: null,
        },
        userAgent: {
            type: String, // To log browser or device details
            default: null,
        },
    },
    { timestamps: true }
);

// Add a virtual field to format the timestamp as date and time
activityLogSchema.virtual("formattedTimestamp").get(function () {
    return this.timestamp
        ? new Date(this.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
        : null;
});

// Ensure virtual fields are included in JSON output
activityLogSchema.set("toJSON", { virtuals: true });
activityLogSchema.set("toObject", { virtuals: true });

const ActivityLog = mongoose.model("activityLog", activityLogSchema);

module.exports = ActivityLog;
