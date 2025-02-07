const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event', // Reference to the Event schema
            required: true,
        },
        primaryMemberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User schema for the primary member
            required: true,
        },
        primaryMemberQRCode: {
            type: String, // Store the QR code for the primary member
            default: ""
        },
        uniqueQRCode: {
            type: String,
            required: false,
            default: ""
            // unique: true,
        },
        dependents: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User', // Reference to the User schema for dependents
                },
                qrCode: {
                    type: String, // Individual QR code for this dependent
                    default: ""
                },
                type: {
                    type: String,
                    default: "dependent"
                },
                uniqueQRCode: {
                    type: String,
                    required: true,
                    // unique: true,
                },
            },
        ],
        guests: [
            {
                name: {
                    type: String,
                    required: true,
                },
                email: {
                    type: String,
                    required: true,
                },
                phone: {
                    type: String,
                    required: true,
                },
                qrCode: {
                    type: String, // Individual QR code for this guest
                    default: ""
                },
                type: {
                    type: String,
                    default: "guest"
                },
                uniqueQRCode: {
                    type: String,
                    required: true,
                    // unique: true,
                },
            },
        ],
        counts: {
            primaryMemberCount: {
                type: Number,
                required: true,
                default: 0,
            },
            dependentMemberCount: {
                type: Number,
                required: true,
                default: 0,
            },
            guestMemberCount: {
                type: Number,
                required: true,
                default: 0,
            },
            spouseMemberCount: {
                type: Number,
                required: true,
                default: 0,
            },
            kidsMemberCount: {
                type: Number,
                required: true,
                default: 0,
            },
            seniorDependentMemberCount: {
                type: Number,
                required: true,
                default: 0,
            },
        },
        ticketDetails: {
            primaryMemberPrice: {
                type: Number,
                required: true,
            },
            dependentMemberPrice: {
                type: Number,
                required: true,
            },
            guestPrice: {
                type: Number,
                required: true,
            },
            spouseMemberPrice: {
                type: Number,
                required: true,
            },
            kidsMemberPrice: {
                type: Number,
                required: true,
            },
            seniorDependentMemberPrice: {
                type: Number,
                required: true,
            },
            taxTypes: [
                {
                    taxType: {
                        type: String,
                        required: true,
                    },
                    taxRate: {
                        type: Number,
                        required: true,
                    },
                    taxAmount: {
                        type: Number,
                        required: true,
                    },
                },
            ],
            subtotal: {
                type: Number,
                required: true,
            },
            taxAmount: {
                type: Number,
                required: true,
            },
            totalAmount: {
                type: Number,
                required: true,
            },
        },

        allDetailsQRCode: {
            type: String, // QR code containing all booking details
            required: true,
        },
        allDetailsUniqueQRCode: {
            type: String,
            required: true,
            unique: true,
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending',
        },
        bookingStatus: {
            type: String,
            enum: ['Confirmed', 'Cancelled'],
            default: 'Confirmed',
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

const EventBooking = mongoose.model('eventBooking', eventBookingSchema);

module.exports = EventBooking;
