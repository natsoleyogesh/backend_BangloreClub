const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
    days: {
        type: [String],
        required: true,
        enum: [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
        ],
    },
    timeSlots: [
        {
            start: { type: String, required: true }, // Example: "11:00 AM"
            end: { type: String, required: true },   // Example: "3:00 PM"
        },
    ],
    price: {
        type: Number,
        required: true,
        min: 0,

    }
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

const banquetsSchema = new mongoose.Schema({
    banquetName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BanquetCategory',
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    // checkInTime: {
    //     type: String,
    //     required: true,
    //     default: '12:00 PM',
    // },
    // checkOutTime: {
    //     type: String,
    //     required: true,
    //     default: '01:00 PM',
    // },
    minAllowedPerRoom: {
        type: Number,
        required: true,
        min: 1,
    },
    maxAllowedPerRoom: {
        type: Number,
        required: true,
        min: 1,
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
    banquetHallSize: {
        type: Number,
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
    billable: {
        type: Boolean,
        default: true,
        required: true
    },
    billableDate: {
        type: Date,
        default: null,
    },
    guideline: {
        type: String,
        required: true,
        default: ""
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

const banquet = mongoose.model('banquet', banquetsSchema);

module.exports = banquet;
