const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        eventTitle: {
            type: String,
            required: true,
            trim: true,
        },
        eventSubtitle: {
            type: String,
            trim: true,
            default: '',
        },
        eventStartDate: {
            type: Date,
            required: true,
        },
        eventEndDate: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,

        },
        ticketPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        primaryMemberPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        dependentMemberPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        guestMemberPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        kidsMemberPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        spouseMemberPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        seniorDependentMemberPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        taxTypes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'TaxType', // Reference to TaxType model
            },
        ],
        rsvpStatus: {
            type: String,
            enum: ['Attending', 'Not Attending', 'Maybe', 'Pending', 'Cancelled', 'N/A'],
            default: 'N/A',
        },
        allottedTicketsMember: {
            type: Number,
            required: true,
            min: 0,
        },
        allottedTicketsGuest: {
            type: Number,
            required: true,
            min: 0,
        },
        totalAvailableTickets: {
            type: Number,
            min: 0,
        },
        totalAvailableTicketCounts: {
            type: Number,
            min: 0,
        },
        bookingPermissionPrimary: {
            type: Boolean,
            default: true,
        },
        bookingPermissionSpouse: {
            type: Boolean,
            default: false,
        },
        // bookingPermissionSon: {
        //     type: Boolean,
        //     default: false,
        // },
        // bookingPermissionDaughter: {
        //     type: Boolean,
        //     default: false,
        // },
        bookingPermissionChild: {
            type: Boolean,
            default: false,
        },
        bookingPermissionSeniorDependent: {
            type: Boolean,
            default: false,
        },
        bookingPermissionDependent: {
            type: Boolean,
            default: false,
        },
        eventImage: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        aboutEvent: {
            type: String,
            required: true,
        },
        organizer: {
            type: String,
            required: true,
        },
        guideline: {
            type: String,
            required: true,
            default: ""
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Complete'],
            default: 'Active',
        },
        showBanner: {
            type: Boolean,
            default: false,
        },
        showInApp: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Pre-save middleware for formatting and derived fields
eventSchema.pre('save', function (next) {
    if (this.eventTitle) {
        // Format event title to Title Case
        this.eventTitle = this.eventTitle
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Automatically calculate total available tickets
    this.totalAvailableTickets = this.allottedTicketsMember + this.allottedTicketsGuest;

    next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;


// const mongoose = require('mongoose');

// // // Define a schema for tax types
// // const taxTypeSchema = new mongoose.Schema({
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'TaxType', // Reference to TaxType model
// // });

// // Define the main event schema
// const eventSchema = new mongoose.Schema(
//     {
//         eventTitle: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         eventSubtitle: {
//             type: String,
//             trim: true,
//             default: '',
//         },
//         eventStartDate: {
//             type: Date,
//             required: true,
//         },
//         eventEndDate: {
//             type: Date,
//             required: true,
//         },
//         startTime: {
//             type: String,
//             required: true,
//         },
//         endTime: {
//             type: String,
//             required: true,
//         },
//         ticketPrice: {
//             type: Number,
//             required: true,
//             min: 0,
//         },
//         memberPrices: {
//             primaryMemberPrice: {
//                 price: { type: Number, required: true, min: 0 },
//                 taxTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaxType' }],
//             },
//             dependentMemberPrice: {
//                 price: { type: Number, required: true, min: 0 },
//                 taxTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaxType' }],
//             },
//             guestMemberPrice: {
//                 price: { type: Number, required: true, min: 0 },
//                 taxTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaxType' }],
//             },
//             kidsMemberPrice: {
//                 price: { type: Number, required: true, min: 0 },
//                 taxTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaxType' }],
//             },
//             spouseMemberPrice: {
//                 price: { type: Number, required: true, min: 0 },
//                 taxTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaxType' }],
//             },
//             seniorDependentMemberPrice: {
//                 price: { type: Number, required: true, min: 0 },
//                 taxTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaxType' }],
//             },
//         },
//         rsvpStatus: {
//             type: String,
//             enum: ['Attending', 'Not Attending', 'Maybe', 'Pending', 'Cancelled', 'N/A'],
//             default: 'N/A',
//         },
//         allottedTicketsMember: {
//             type: Number,
//             required: true,
//             min: 0,
//         },
//         allottedTicketsGuest: {
//             type: Number,
//             required: true,
//             min: 0,
//         },
//         totalAvailableTickets: {
//             type: Number,
//             default: 0, // Default to 0 to avoid undefined issues
//         },
//         bookingPermissionPrimary: {
//             type: Boolean,
//             default: true,
//         },
//         bookingPermissionSpouse: {
//             type: Boolean,
//             default: false,
//         },
//         bookingPermissionSon: {
//             type: Boolean,
//             default: false,
//         },
//         bookingPermissionDaughter: {
//             type: Boolean,
//             default: false,
//         },
//         bookingPermissionDependent: {
//             type: Boolean,
//             default: false,
//         },
//         bookingPermissionSeniorDependent: {
//             type: Boolean,
//             default: false,
//         },
//         eventImage: {
//             type: String,
//             required: true,
//             // validate: {
//             //     validator: (v) => /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v),
//             //     message: 'Invalid image URL',
//             // },
//         },
//         location: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         aboutEvent: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         organizer: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         status: {
//             type: String,
//             enum: ['Active', 'Inactive', 'Complete'],
//             default: 'Active',
//         },
//         showBanner: {
//             type: Boolean,
//             default: false,
//         },
//         isDeleted: {
//             type: Boolean,
//             default: false,
//         },
//     },
//     { timestamps: true }
// );

// // Pre-save middleware for formatting and derived fields
// eventSchema.pre('save', function (next) {
//     // Format event title to Title Case
//     if (this.eventTitle) {
//         this.eventTitle = this.eventTitle
//             .toLowerCase()
//             .split(' ')
//             .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(' ');
//     }

//     // Automatically calculate total available tickets
//     this.totalAvailableTickets =
//         (this.allottedTicketsMember || 0) + (this.allottedTicketsGuest || 0);

//     next();
// });

// const Event = mongoose.model('Event', eventSchema);

// module.exports = Event;
