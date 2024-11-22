const mongoose = require("mongoose");

const hodSchema = new mongoose.Schema(
    {
        designation: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        contactNumber: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\d{10}$/.test(v); // Validates a 10-digit phone number
                },
                message: (props) => `${props.value} is not a valid phone number!`,
            },
        },
        image: {
            type: String, // URL to the profile image
            required: true,
        },
        department: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"], // Restrict to "Active" or "Inactive"
            default: "Active", // Default to "Active"
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

const HOD = mongoose.model("ClubHod", hodSchema);

module.exports = HOD;
