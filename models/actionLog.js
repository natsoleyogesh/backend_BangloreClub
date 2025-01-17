const mongoose = require("mongoose");

const actionLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true, // Required user reference
        },
        userType: {
            type: String,
            enum: ["User", "Admin"], // Specify the model type
            required: true, // Ensure we know which model `userId` refers to
        },
        role: {
            type: String,
            enum: ["member", "gatekeeper", "admin"], // Roles to log
            required: true,
        },
        action: {
            type: String,
            enum: ["login", "logout"], // Actions to log
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now, // Automatically logs the time of the action
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
    { timestamps: true } // Adds createdAt and updatedAt fields
);

// // Add a virtual field to format the timestamp as date and time
actionLogSchema.virtual("formattedTimestamp").get(function () {
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
actionLogSchema.set("toJSON", { virtuals: true });
actionLogSchema.set("toObject", { virtuals: true });

// Populate user based on `userType`
actionLogSchema.methods.populateUser = async function () {
    if (this.userType === "User") {
        return await mongoose.model("User").findById(this.userId);
    } else if (this.userType === "Admin") {
        return await mongoose.model("Admin").findById(this.userId);
    }
};

const ActionLog = mongoose.model("ActionLog", actionLogSchema);

module.exports = ActionLog;
