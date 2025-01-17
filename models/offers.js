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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department', // Reference to the Department model
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
        discountOffer: {
            type: Boolean,
            default: false
        },
        showBanner: {
            type: Boolean,
            default: false
        },

    },
    { timestamps: true }
);

// Pre-save middleware to format the `name` field
offerSchema.pre('save', function (next) {
    if (this.title) {
        // Convert to title case (e.g., "OTHER Tax" → "Other Tax")
        this.title = this.title
            .toLowerCase() // Convert all to lowercase first
            .split(' ') // Split the title into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join words back with spaces
    }
    next();
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
