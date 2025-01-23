const mongoose = require("mongoose");

const smtpSecretSchema = new mongoose.Schema(
    {
        host: {
            type: String,
            required: true,
            trim: true,
        },
        port: {
            type: Number,
            required: true,
            default: 587, // Default SMTP port
        },
        username: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        encryption: {
            type: String,
            enum: ["none", "SSL", "TLS"], // Allowed encryption types
            default: "TLS",
        },
        smtpFrom: {
            type: String,
            required: true,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to admin user
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt
    }
);

const SmtpSecret = mongoose.model("SmtpSecret", smtpSecretSchema);
module.exports = SmtpSecret;
