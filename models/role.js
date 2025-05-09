const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true }, // Role name, e.g., "HR", "Accountant"
        description: { type: String }, // Optional description for the role
        status: { type: Boolean, default: true }, // Active/inactive flag
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin", // Reference to admin user
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true } // Adds createdAt and updatedAt timestamps
);

// Middleware to format the name field to Title Case
roleSchema.pre("save", function (next) {
    if (this.name) {
        this.name = this.name
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toLowerCase() + word.slice(1))
            .join(" ");
    }
    next();
});

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
