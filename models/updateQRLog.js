const mongoose = require("mongoose");

const updateQrLogSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the Member model
            required: true,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin", // Reference to the Gatekeeper (User) model
            required: true,
        },
        activity: {
            type: String,
            enum: ["qrUpdate"], // Define the activities you want to track
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now, // Automatically logs the time of the activity
        },
        details: {
            type: String, // Additional details about the activity
            default: "",
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
updateQrLogSchema.virtual("formattedTimestamp").get(function () {
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
updateQrLogSchema.set("toJSON", { virtuals: true });
updateQrLogSchema.set("toObject", { virtuals: true });

const UpdateQrLog = mongoose.model("updateQrLog", updateQrLogSchema);

module.exports = UpdateQrLog;
