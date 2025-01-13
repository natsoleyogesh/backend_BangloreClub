// // Import Mongoose
// const mongoose = require('mongoose');

// // Define the Billing schema
// const OfflinebillingSchema = new mongoose.Schema(
//     {
//         memberId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User', // Reference to the customer model
//             default: null
//         },
//         memberShipId: {
//             type: String,
//             default: "",
//             trim: true
//         },
// invoiceNumber: {
//     type: String,
//     required: true,
//     // unique: true,
//     trim: true
// },
//         invoiceDate: {
//             type: Date,
//             default: Date.now
//         },
//         dueDate: {
//             type: Date,
//             required: true
//         },
//         serviceType: {
//             type: String,
//             required: true,
//             default: "",
//             trim: true
//         },
//         creditAmount: {
//             type: Number,
//             default: 0,
//             min: 0
//         },
//         debitAmount: {
//             type: Number,
//             default: 0,
//             min: 0
//         },
//         taxAmount: {
//             type: Number,
//             default: 0,
//             min: 0
//         },
//         totalAmount: {
//             type: Number,
//             required: true,
//             min: 0
//         },
//         paymentStatus: {
//             type: String,
//             enum: ['Due', 'Paid', 'Overdue', 'Cancelled', 'Paid Offline'],
//             default: 'Due'
//         },
//         status: {
//             type: String,
//             enum: ['Active', 'Paid', 'Overdue', 'Cancelled', 'Inactive', 'Paid Offline'],
//             default: 'Active'
//         },
//         isDeleted: {
//             type: Boolean,
//             default: false
//         },
//         deletedAt: {
//             type: Date,
//             default: null
//         },
//         createdAt: {
//             type: Date,
//             default: Date.now
//         },
//         updatedAt: {
//             type: Date,
//             default: null
//         }
//     },
//     {
//         timestamps: true // Automatically manages `createdAt` and `updatedAt` fields
//     }
// );

// // Create and export the Billing model
// const OfflineBilling = mongoose.model('OfflineBilling', OfflinebillingSchema);
// module.exports = OfflineBilling;


// // Import Mongoose
const mongoose = require('mongoose');
// Define the Consolidated Billing schema
const ConsolidatedBillingSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the customer model
            required: true
        },
        memberShipId: {
            type: String,
            required: true,
            trim: true
        },
        invoiceNumber: {
            type: String,
            required: true,
            // unique: true,
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
        transactionMonth: {
            type: String, // e.g., "AUGUST-2024"
            required: true,
            trim: true
        },
        serviceTypeEntries: [
            {
                serviceType: { type: String, required: true, trim: true }, // e.g., "Room Rent"
                totalCredit: { type: Number, default: 0, min: 0 },
                totalDebit: { type: Number, default: 0, min: 0 },
                total: { type: Number, default: 0 } // totalDebit - totalCredit
            }
        ],
        totalAmount: {
            type: Number, default: 0 // Overall total across all service types
        },
        paymentStatus: {
            type: String,
            enum: ['Due', 'Paid Offline', 'Paid', 'Overdue'],
            default: 'Due'
        },
        status: {
            type: String,
            enum: ['Active', 'Paid', "Paid Offline"],
            default: 'Active'
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
    },
    {
        timestamps: true
    }
);

// Create and export the ConsolidatedBilling model
const ConsolidatedBilling = mongoose.model('ConsolidatedBilling', ConsolidatedBillingSchema);
module.exports = ConsolidatedBilling;