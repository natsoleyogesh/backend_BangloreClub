const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true, // Subcategory name, e.g., "Go Green"
        },
    },
    { timestamps: true } // Enable timestamps for future updates
);

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true, // Category name, e.g., "Chairman"
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
        categories: {
            type: [categorySchema], // List of categories this member belongs to
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"], // Status can be "Active" or "Inactive"
            default: "Active",
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
