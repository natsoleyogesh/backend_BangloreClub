// const mongoose = require("mongoose");
// const TimingSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         default: ""
//     },
//     startDay: {
//         type: String, // Start day (e.g., "Mon")
//         required: true,
//     },
//     endDay: {
//         type: String, // End day (e.g., "Sun")
//         required: true,
//     },
//     startTime: {
//         type: String, // Start time (e.g., "8:00 AM")
//         required: true,
//     },
//     endTime: {
//         type: String, // End time (e.g., "10:00 PM")
//         required: true,
//     },
// });

// // const SubCategorySchema = new mongoose.Schema({
// //     name: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "Restaurant", // Linking the HOD with the User schema
// //         required: true, // Subcategory name (e.g., "Buttery Bar")
// //     },
// //     description: {
// //         type: String, // Subcategory description
// //         required: true,
// //     },
// //     timings: {
// //         type: [TimingSchema], // Array of timings for flexibility
// //         required: true,
// //     },
// //     location: {
// //         type: String,
// //         default: ""
// //     },
// //     extansion_no: {
// //         type: String,
// //         default: ""
// //     },
//     // images: {
//     //     type: [String], // Array of image file paths
//     //     default: [],
//     // },
// //     menu: {
// //         type: String, // Path to the menu file (PDF)
// //         default: null,
// //     },
// // });

// const foodAndBeverageSchema = new mongoose.Schema(
//     {
//         name: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Restaurant", // Linking the HOD with the User schema
//             required: true, // Main category name (e.g., "Main Dining Hall")
//         },
//         description: {
//             type: String, // Main category description
//             required: true,
//         },
//         bannerImage:  {
//             type: [String], // Array of image file paths
//             default: [],
//         },
//         timings: {
//             type: [TimingSchema], // Array of timings for flexibility
//             required: true,
//         },
//         location: {
//             type: String,
//             default: ""
//         },
//         extansion_no: {
//             type: String,
//             default: ""
//         },
//         mainmenu: {
//             type: String, // Path to the menu file (PDF)
//             default: null,
//         },
//         // subCategories: {
//         //     type: [SubCategorySchema], // Nested subcategories
//         //     required: true,
//         // },
//         status: {
//             type: String,
//             enum: ["Active", "Inactive"], // Status can be Active or Inactive
//             default: "Active",
//         },
//     },
//     { timestamps: true }
// );


// const FoodAndBeverage = mongoose.model('foodAndBeverage', foodAndBeverageSchema);

// module.exports = FoodAndBeverage;


const mongoose = require("mongoose");
const TimingSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ""
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