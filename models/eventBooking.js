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
        dependents: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User', // Reference to the User schema for dependents
                },
                qrCode: {
                    type: String, // Individual QR code for this dependent
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
                },
            },
        ],
        counts: {
            primaryMemberCount: {
                type: Number,
                required: true,
                default: 1,
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
        },
        ticketDetails: {
            primaryMemberPrice: {
                type: Number,
                required: true,
            },
            dependentPrice: {
                type: Number,
                required: true,
            },
            guestPrice: {
                type: Number,
                required: true,
            },
            taxRate: {
                type: Number,
                required: true,
                default: 16,
            },
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
        qrCodes: [
            {
                userId: {
                    type: String, // Could be a user ID or guest name
                },
                type: {
                    type: String,
                    enum: ['Primary', 'Dependent', 'Guest'], // Identifies the type of attendee
                    required: true,
                },
                qrCode: {
                    type: String, // Base64 string of the QR code
                    required: true,
                },
            },
        ],
        allDetailsQRCode: {
            type: String, // QR code containing all booking details
            required: true,
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
