const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
    guestType: {
        type: String,
        required: true,
        enum: [
            'Club Member',
            'Club Member (Self Stay)',
            'Corporate Member',
            'Guest of Member (Indian)',
            'Affiliated Club Member (Indian)',
            'Nominees of Corporate Member',
            'Affiliated Foreign Club',
            'Foreign Guest',
        ],
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String,
        default: '',
    },
});

const bookingSchema = new mongoose.Schema({
    fromDate: {
        type: Date,
        required: true,
        default: null
    },
    toDate: {
        type: Date,
        required: true,
        default: null
    },
});


const roomSchema = new mongoose.Schema(
    {
        roomName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        roomNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        floorNumber: {
            type: Number,
            required: true,
            min: 0,
        },
        roomType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
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
            default: [],
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
        amenities: {
            type: [String],
            default: [],
            enum: [
                'WiFi',
                'AC',
                'Television',
                'Mini Bar',
                'Room Service',
                'Gym Access',
                'Swimming Pool',
                'Laundry Service',
                'Parking',
                'Breakfast Included',
                'Laundry'
            ],
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
        bookedDates: {
            type: [bookingSchema],
            // default: [], // Initialize as an empty array
        },
        status: {
            type: String,
            required: true,
            enum: ['Available', 'Booked', 'Under Maintenance'],
            default: 'Available',
        },
        images: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            default: '',
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
