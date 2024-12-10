// const mongoose = require('mongoose');

// const pricingSchema = new mongoose.Schema({
//     guestType: {
//         type: String,
//         required: true,
//         enum: [
//             'Club Member',
//             'Club Member (Self Stay)',
//             'Corporate Member',
//             'Guest of Member (Indian)',
//             'Affiliated Club Member (Indian)',
//             'Nominees of Corporate Member',
//             'Affiliated Foreign Club',
//             'Foreign Guest',
//         ],
//     },
//     price: {
//         type: Number,
//         required: true,
//         min: 0,
//     },
//     description: {
//         type: String,
//         default: '',
//     },
// });

// const roomDetailsSchema = new mongoose.Schema({
//     roomNumber: {
//         type: Number,
//         required: true,
//         unique: true,
//     },
//     status: {
//         type: String,
//         enum: ['Available', 'Booked', 'Under Maintenance'],
//         default: 'Available',
//     },
//     lastUpdated: {
//         type: Date,
//         default: Date.now,
//     },
// });

// const roomWithCategorySchema = new mongoose.Schema(
//     {
//         categoryName: {
//             type: String,
//             required: true,
//             unique: true,
//         },
//         code: {
//             type: String,
//             required: true,
//             unique: true,
//             uppercase: true,
//         },
//         description: {
//             type: String,
//             default: '',
//         },
//         totalAvailableRoom: {
//             type: Number,
//             default: 0,
//         },
//         roomDetails: {
//             type: [roomDetailsSchema],
//             required: true,
//             default: [],
//         },
//         images: {
//             type: [String],
//             default: [],
//         },
// priceRange: {
//     minPrice: {
//         type: Number,
//         required: true,
//         min: 0,
//     },
//     maxPrice: {
//         type: Number,
//         required: true,
//         min: 0,
//     },
// },
//         pricingDetails: {
//             type: [pricingSchema],
//             required: true,
//             default: [],
//         },
//         pricingDescription: {
//             type: String,
//             default: ""
//         },
//         taxRate: {
//             type: Number,
//             required: true,
//             default: 16,
//         },
//         primaryMemberPrice: {
//             type: Number,
//             required: true,
//         },
//         guestPrice: {
//             type: Number,
//             required: true,
//         },
//         capacity: {
//             type: Number,
//             required: true,
//             min: 1,
//         },
//         amenities: {
//             type: [String],
//             default: [],
//             enum: [
//                 'WiFi',
//                 'AC',
//                 'Television',
//                 'Mini Bar',
//                 'Room Service',
//                 'Gym Access',
//                 'Swimming Pool',
//                 'Laundry Service',
//                 'Parking',
//                 'Breakfast Included',
//                 'Laundry',
//             ],
//         },
// roomSize: {
//     type: Number,
//     required: true,
// },
// bedType: {
//     type: String,
//     enum: ['Single', 'Double', 'Queen', 'King', 'Twin', 'Sofa Bed'],
//     required: true,
// },
// features: {
//     smokingAllowed: {
//         type: Boolean,
//         default: false,
//     },
//     petFriendly: {
//         type: Boolean,
//         default: false,
//     },
//     accessible: {
//         type: Boolean,
//         default: false,
//     },
// },
//         status: {
//             type: String,
//             required: true,
//             enum: ['Active', 'Inactive'],
//             default: 'Active',
//         },
//         isDeleted: {
//             type: Boolean,
//             default: false,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// // Middleware to calculate total available rooms (updated to use existing room details)
// roomWithCategorySchema.pre('save', function (next) {
//     this.totalAvailableRoom = this.roomDetails.filter((room) => room.status === 'Available').length;
//     next();
// });

// const RoomWithCategory = mongoose.model('RoomWithCategory', roomWithCategorySchema);

// module.exports = RoomWithCategory;



const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
    guestType: {
        type: String,
        required: true,
        enum: [
            'Member',
            'Member Spouse & Children',
            'Corporate Member',
            'Guest of Member',
            'Affiliated Club Member',
            'Nominee of Corporate Member',
            'Affiliated Foreign Club Member',
            'Foreign Guest',
        ],
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
});

const roomDetailsSchema = new mongoose.Schema({
    roomNumber: {
        type: Number,
        required: true,
        // unique: true,
    },
    status: {
        type: String,
        enum: ['Available', 'Booked', 'Under Maintenance'],
        default: 'Available',
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});


// Schema for special day tariff
const specialDayTariffSchema = new mongoose.Schema({
    special_day_name: {
        type: String,
        default: ""
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    extraCharge: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String,
        default: '',
    },
});

const roomWithCategorySchema = new mongoose.Schema({
    categoryName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    checkInTime: {
        type: String,
        required: true,
        default: '12:00 PM',
    },
    checkOutTime: {
        type: String,
        required: true,
        default: '01:00 PM',
    },
    maxAllowedPerRoom: {
        type: Number,
        required: true,
        min: 1,
    },
    totalAvailableRoom: {
        type: Number,
        default: 0,
    },
    roomDetails: {
        type: [roomDetailsSchema],
        required: true,
        default: [],
    },
    images: {
        type: [String],
        default: [],
    },
    priceRange: {
        minPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        maxPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    pricingDetails: {
        type: [pricingSchema],
        required: true,
    },
    pricingDetailDescription: {
        type: String,
        default: ""
    },
    extraBedPrice: {
        type: Number,
        required: false,
        default: 0,
    },
    specialDayTariff: {
        type: [specialDayTariffSchema],
        default: [],
    },
    taxTypes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaxType', // Reference to TaxType model
    }],
    amenities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenities', // Reference to Amenity model
    }],
    // cancellationPolicy: {
    //     type: [
    //         {
    //             condition: { type: String, required: true },
    //             percentage: { type: Number, required: true, min: 0, max: 100 },
    //         },
    //     ],
    //     default: [],
    // },
    cancellationPolicy: {
        before7Days: {
            type: Number,
            default: 0,
        },
        between7To2Days: {
            type: Number,
            default: 25,
        },
        between48To24Hours: {
            type: Number,
            default: 50,
        },
        lessThan24Hours: {
            type: Number,
            default: 100,
        },
    },
    breakfastIncluded: {
        type: Boolean,
        default: false,
    },
    roomSize: {
        type: Number,
        required: true,
    },
    bedType: {
        type: String,
        enum: ['Single', 'Double', 'Queen', 'King', 'Twin', 'Sofa Bed'],
        required: true,
    },
    features: {
        smokingAllowed: {
            type: Boolean,
            default: false,
        },
        petFriendly: {
            type: Boolean,
            default: false,
        },
        accessible: {
            type: Boolean,
            default: false,
        },
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Middleware to calculate total available rooms
roomWithCategorySchema.pre('save', function (next) {
    this.totalAvailableRoom = this.roomDetails.filter((room) => room.status === 'Available').length;
    next();
});

const RoomWithCategory = mongoose.model('RoomWithCategory', roomWithCategorySchema);

module.exports = RoomWithCategory;
