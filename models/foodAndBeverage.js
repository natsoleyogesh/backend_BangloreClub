const mongoose = require("mongoose");

// const SubCategorySchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     // timings: {
//     //     days: { type: [String], required: true },
//     //     startTime: { type: String, required: true },
//     //     endTime: { type: String, required: true },
//     // },
//     timings: [
//         {
//             startDay: {
//                 type: String, // Start day (e.g., "Mon")
//             },
//             endDay: {
//                 type: String, // End day (e.g., "Sun")
//             },
//             startTime: {
//                 type: String, // Start time (e.g., "8:00 AM")
//             },
//             endTime: {
//                 type: String, // End time (e.g., "10:00 PM")
//             },
//         },
//     ],
//     images: { type: [String], default: [] }, // Array of image file paths
//     menu: { type: String, default: null }, // Menu file path (PDF)
// });

// const foodAndBeverageSchema = new mongoose.Schema(
//     {
//         name: { type: String, required: true },
//         description: { type: String },
//         bannerImage: { type: String },
//         subCategories: [SubCategorySchema], // Nested subcategories
//         status: {
//             type: String,
//             enum: ['Active', 'Inactive'], // Status can be ACTIVE or INACTIVE
//             default: 'Active',
//         },
//     },
//     { timestamps: true }
// );

const TimingSchema = new mongoose.Schema({
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

const SubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Subcategory name (e.g., "Buttery Bar")
    },
    description: {
        type: String, // Subcategory description
        required: true,
    },
    timings: {
        type: [TimingSchema], // Array of timings for flexibility
        required: true,
    },
    images: {
        type: [String], // Array of image file paths
        default: [],
    },
    menu: {
        type: String, // Path to the menu file (PDF)
        default: null,
    },
});

const foodAndBeverageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, // Main category name (e.g., "Main Dining Hall")
        },
        description: {
            type: String, // Main category description
            required: true,
        },
        bannerImage: {
            type: String, // Path to the banner image
            required: false,
        },
        subCategories: {
            type: [SubCategorySchema], // Nested subcategories
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"], // Status can be Active or Inactive
            default: "Active",
        },
    },
    { timestamps: true }
);


const FoodAndBeverage = mongoose.model('foodAndBeverage', foodAndBeverageSchema);

module.exports = FoodAndBeverage;
