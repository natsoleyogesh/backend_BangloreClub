const mongoose = require('mongoose');

// Define the Transaction schema
const transactionSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the billing model
            required: true
        },
        billingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Billing', // Reference to the billing model
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['card','upi', 'payPal', 'Bank Transfer', 'cash'],
            required: true
        },
        taxAmount: {
            type: Number,
            required: false,
            default: 0
        },
        other_service_charge: {
            type: Number,
            required: false,
            default: 0
        },
        paymentAmount: {
            type: Number,
            required: true
        },
        transactionId: {
            type: String,
            unique: true,
            required: true
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        paymentStatus: {
            type: String,
            enum: ['Success', 'Failed', 'Pending'],
            required: true
        },
        status: {
            type: String,
            enum: ['Completed', 'Pending', 'Failed'],
            default: 'Pending'
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        },
    },
    { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

// Create the Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
