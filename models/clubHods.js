const mongoose = require("mongoose");

const hodSchema = new mongoose.Schema(
    {
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
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            match: [
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                "Please provide a valid email address",
            ],
        },
        image: {
            type: String, // URL to the profile image
            default: "",
            required: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department', // Reference to the Department model
            required: true
        },
        designation: {
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

// Pre-save middleware to format the `name` field
hodSchema.pre('save', function (next) {
    if (this.name) {
        // Convert to name case (e.g., "OTHER Tax" → "Other Tax")
        this.name = this.name
            .toLowerCase() // Convert all to lowercase first
            .split(' ') // Split the name into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join words back with spaces
    }
    next();
});

const HOD = mongoose.model("ClubHod", hodSchema);

module.exports = HOD;
