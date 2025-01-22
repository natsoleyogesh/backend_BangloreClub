const mongoose = require("mongoose");
const TimingSchema = new mongoose.Schema({
    menu: {
        type: String,
        enum: ["Buffet Menu", "A la carte Menu", "Both Menu"],
        required: true
    },
    menuType: {
        type: String,
        enum: ["Breakfast", "Lunch", "Dinner", "Brunch", "Snacks", "Beverages", "Fine Dining", "Cafe Bistro", "Bar Lounge"],
        required: true
    },
    startDay: {
        type: String, // Start day (e.g., "Mon")
        required: true,
    },
    endDay: {
        type: String, // End day (e.g., "Sun")
        required: true,
    },
    startTime: {
        type: String, // Start time (e.g., "8:00 AM")
        required: true,
    },
    endTime: {
        type: String, // End time (e.g., "10:00 PM")
        required: true,
    },
});

const foodAndBeverageSchema = new mongoose.Schema(
    {
        name: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant", // Linking the HOD with the User schema
            required: true, // Main category name (e.g., "Main Dining Hall")
        },
        description: {
            type: String, // Main category description
            required: true,
        },
        bannerImage: {
            type: [String], // Array of image file paths
            default: [],
        },
        timings: {
            type: [TimingSchema], // Array of timings for flexibility
            required: true,
        },
        location: {
            type: String,
            default: ""
        },
        extansion_no: {
            type: String,
            default: ""
        },
        mainmenu: {
            type: String, // Path to the menu file (PDF)
            default: null,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"], // Status can be Active or Inactive
            default: "Active",
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);


const FoodAndBeverage = mongoose.model('foodAndBeverage', foodAndBeverageSchema);

module.exports = FoodAndBeverage;