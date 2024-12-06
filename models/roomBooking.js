
const mongoose = require('mongoose');

// Define RoomBooking schema
const roomBookingSchema = new mongoose.Schema(
    {
        // Reference to RoomWithCategory model (Room Category Type)
        // roomCategory: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: 'RoomWithCategory', // Reference to RoomWithCategory model
        //         required: true,
        //     },
        // ],

        // Primary member details
        primaryMemberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User schema for primary member
            required: true,
        },
        memberType: {
            type: String,
            enum: ['self', 'guest'], // 'self' or 'guest' to denote the type
            default: 'self',
        },

        // Member details (Multiple members can be added, including guests)
        memberDetails: [
            {
                memberName: {
                    type: String,
                    required: true,
                },
                memberType: {
                    type: String,
                    required: true,
                    default: ''
                }
            },
        ],
        guestContact: {
            type: String,
            required: function () {
                return this.memberType === 'guest'; // Only required for guest members
            },
            trim: true,
            match: [
                /^[0-9]{10}$/, // Validate exactly 10 digits
                "Please provide a valid mobile number",
            ],
        },

        // Room count by category type (e.g., Single, Double, Suite)
        roomCategoryCounts: [
            {
                roomType: {
                    type: mongoose.Schema.Types.ObjectId, // Reference to room category
                    ref: 'RoomWithCategory',
                    required: true,
                },
                roomCount: {
                    type: Number, // Number of rooms for this category type
                    required: true,
                },
                roomPrice: {
                    type: Number, // Price per room for this category type
                    required: true,
                },
                roomNumbers: [
                    {
                        type: mongoose.Schema.Types.ObjectId, // Should reference RoomWithCategory
                        ref: 'RoomWithCategory',  // Reference to the room model (RoomWithCategory)
                    }
                ],
                taxRate: {
                    type: Number, // Tax rate for this room category
                    required: true,
                    // default: 16, // Default tax rate, can be overridden per room category
                },
            },
        ],

        // Member count details (adults, children, infants, total occupants)
        memberCounts: {
            adults: {
                type: Number,
                required: true,
                default: 0,
            },
            children: {
                type: Number,
                required: true,
                default: 0,
            },
            infants: {
                type: Number,
                required: true,
                default: 0,
            },
            totalOccupants: {
                type: Number,
                required: true,
                default: function () {
                    return this.memberCounts.adults + this.memberCounts.children + this.memberCounts.infants;
                },
            },
        },

        // Booking details (check-in, check-out dates, day stay)
        bookingDates: {
            checkIn: {
                type: Date,
                required: true,
            },
            checkOut: {
                type: Date,
                required: true,
            },
            dayStay: {
                type: Number,
                required: true,
                default: function () {
                    const checkIn = new Date(this.bookingDates.checkIn);
                    const checkOut = new Date(this.bookingDates.checkOut);
                    const timeDifference = checkOut - checkIn;
                    return Math.ceil(timeDifference / (1000 * 3600 * 24)); // Calculate number of days
                },
            },
        },

        // Pricing details (per night, total amount, tax, etc.)
        pricingDetails: {
            totalAmount: {
                type: Number,
                required: true,
                default: function () {
                    // Calculate the total amount based on room category prices and tax rates
                    let totalAmount = 0;
                    let totalTaxAmount = 0;
                    this.roomCategoryCounts.forEach(roomCategoryCount => {
                        const { roomPrice, roomCount, taxRate } = roomCategoryCount;
                        const roomTotalPrice = roomPrice * roomCount;
                        const taxAmount = (roomTotalPrice * taxRate) / 100;
                        totalAmount += roomTotalPrice;
                        totalTaxAmount += taxAmount;
                    });

                    // Add total tax amount to the final total amount
                    return totalAmount + totalTaxAmount;
                },
            },
            totalTaxAmount: {
                type: Number,
                required: true,
                default: function () {
                    let totalTaxAmount = 0;
                    this.roomCategoryCounts.forEach(roomCategoryCount => {
                        const { roomPrice, roomCount, taxRate } = roomCategoryCount;
                        const roomTotalPrice = roomPrice * roomCount;
                        const taxAmount = (roomTotalPrice * taxRate) / 100;
                        totalTaxAmount += taxAmount;
                    });
                    return totalTaxAmount;
                },
            },
        },

        // QR code details for booking (All details and Unique QR Code)
        allDetailsQRCode: {
            type: String, // QR code containing all booking details
            // required: true,
            default: ""
        },
        uniqueQRCode: {
            type: String,
            // required: true,
            // unique: true,
            default: ""
        },

        // Payment and Booking Statuses
        paymentMode: {
            type: String,
            default: "Direct to Member A/c.",
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending',
        },
        bookingStatus: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Cancelled'],
            default: 'Pending',
        },

        // Soft delete field
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Create RoomBooking model
const RoomBooking = mongoose.model('RoomBooking', roomBookingSchema);

module.exports = RoomBooking;
