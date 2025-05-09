const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department', // Reference to the Department model
            required: true
        },
    },
    { timestamps: true } // Enable timestamps for future updates
);

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Designation', // Reference to the Department model
            required: true
        },
        subCategories: {
            type: [subCategorySchema], // List of subcategories under this category
            default: [],
        },
    },
    { timestamps: true } // Enable timestamps for future updates
);

const generalCommitteeMemberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Linking the HOD with the User schema
            required: true,
        },
        designation: {
            type: String,
            required: false, // Designation, e.g., "President", "Vice President"
        },
        image: {
            type: String, // URL to the profile image
            default: "",
            required: true,
        },
        categories: {
            type: [categorySchema], // List of categories this member belongs to
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"], // Status can be "Active" or "Inactive"
            default: "Active",
        },
        priority: {
            type: Number, // Priority for the category
            required: true,
            default: 0, // Default priority
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

const GeneralCommitteeMember = mongoose.model(
    "GeneralCommitteeMember",
    generalCommitteeMemberSchema
);

module.exports = GeneralCommitteeMember;
