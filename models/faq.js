const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
    {
        category: {
            type: String, // FAQ category, e.g., General FAQs, Membership FAQs
            required: true,
            trim: true,
        },
        question: {
            type: String, // FAQ question
            required: true,
            trim: true,
        },
        answer: {
            type: String, // FAQ answer
            required: true,
            trim: true,
        },
        isExpandable: {
            type: Boolean, // Whether it is expandable in the UI
            default: false,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"], // Active or Inactive
            default: "Active",
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

const ClubFAQ = mongoose.model("ClubFAQ", faqSchema);
module.exports = ClubFAQ;
