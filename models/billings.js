const mongoose = require('mongoose');

// Define the Billing schema for multiple service types (Room, Banquet, Event, etc.)
const billingSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the customer model
            required: true
        },
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        invoiceDate: {
            type: Date,
            default: Date.now
        },
        dueDate: {
            type: Date,
            required: true
        },
        serviceType: {
            type: String,
            enum: ['Room', 'Banquet', 'Event'], // You can add more services here
            required: true
        },
        serviceDetails: {
            roomBooking: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'RoomBooking', // Reference to room booking details (if serviceType is Room)
                default: null
            },
            banquetBooking: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'BanquetBooking', // Reference to banquet booking details (if serviceType is Banquet)
                default: null
            },
            eventBooking: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'eventBooking', // Reference to event booking details (if serviceType is Event)
                default: null
            }
        },
        subTotal: {
            type: Number,
            required: true
        },
        discountAmount: {
            type: Number,
            default: 0
        },
        taxAmount: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['Due', 'Paid', 'Overdue', 'Cancelled'],
            default: 'Due'
        },
        status: {
            type: String,
            enum: ['Active', 'Paid', 'Overdue', 'Cancelled', 'Inactive'],
            default: 'Active'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin', // Reference to the user who created the billing
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date
        }
    },
    { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

// Create the Billing model
const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing;
