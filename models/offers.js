const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Offer title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Offer description is required"],
            trim: true,
        },
        couponCode: {
            type: String,
            trim: true,
            default: null, // Optional field for offers without coupons
        },
        discountPercentage: {
            type: Number,
            required: true, // Percentage discount is mandatory
            min: 0,
            max: 100,
        },
        discountAmount: {
            type: Number,
            default: null, // Optional field for fixed discount offers
            min: 0,
        },
        startDate: {
            type: Date,
            required: [true, "Offer start date is required"],
        },
        endDate: {
            type: Date,
            required: [true, "Offer end date is required"],
        },
        status: {
            type: String,
            enum: ["Active", "Expired", "Upcoming", "Inactive"],
            default: "Active",
        },
        type: {
            type: String,
            enum: ["New", "Current"],
            required: [true, "Offer type is required"], // Indicates if it's a "New Offer" or "Current Offer"
        },
        department: {
            type: String,
            enum: ["Recharge", "Purchase", "Subscription", "Entertainment", "Other"],
            required: [true, "Offer department is required"], // Categorizes the offer
        },
        bannerImage: {
            type: String,
            default: null, // URL or path to the banner image
        },
        termsAndConditions: {
            type: String,
            default: "", // Optional field for detailed T&C
        },
        showExclusive: {
            type: Boolean,
            default: false, // Default is false (non-exclusive)
        },
        // createdAt: {
        //     type: Date,
        //     default: Date.now,
        // },
        // updatedAt: {
        //     type: Date,
        //     default: Date.now,
        // },
    },
    { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
