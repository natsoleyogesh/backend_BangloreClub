// const mongoose = require('mongoose');

// const eventSchema = new mongoose.Schema({
//     eventTitle: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     eventSubtitle: {
//         type: String,
//         trim: true,
//         default: '',
//     },
//     eventDate: {
//         type: Date,
//         required: true,
//     },
//     startTime: {
//         type: String,
//         required: true,
//     },
//     endTime: {
//         type: String,
//         required: true,
//     },
//     ticketPrice: {
//         type: Number,
//         required: true,
//         min: 0,
//     },
//     currency: {
//         type: String,
//         default: 'INR',
//     },
//     rsvpStatus: {
//         type: String,
//         enum: ['Attending', 'Not Attending', 'Maybe', 'Pending', 'Cancelled', 'N/A'],
//         default: 'N/A',
//     },
//     availableTickets: {
//         type: Number,
//         required: true,
//         min: 0,
//     },
//     eventImage: {
//         type: String,
//         required: true,
//     },
//     location: {
//         type: String,
//         required: true,
//     },
//     aboutEvent: {
//         type: String,
//         required: true,
//     },
//     organizer: {
//         type: String,
//         required: true,
//     },
//     status: {
//         type: String,
//         enum: ['Active', 'Inactive', 'Complete'],
//         default: 'Active'
//     },
//     // attendees: [
//     //     {
//     //         userId: {
//     //             type: mongoose.Schema.Types.ObjectId,
//     //             ref: 'User',
//     //         },
//     //         rsvpStatus: {
//     //             type: String,
//     //             enum: ['Attending', 'Not Attending', 'Maybe', 'Cancelled'],
//     //             default: 'Maybe',
//     //         },
//     //         rsvpUpdatedAt: {
//     //             type: Date,
//     //             default: Date.now,
//     //         },
//     //     },
//     // ],
//     // createdAt: {
//     //     type: Date,
//     //     default: Date.now,
//     // },
//     // updatedAt: {
//     //     type: Date,
//     //     default: Date.now,
//     // },
//     isDeleted: {
//         type: Boolean,
//         default: false
//     }
// }, { timestamps: true });

// const Event = mongoose.model('Event', eventSchema);

// module.exports = Event;



const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
    eventDate: {
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
    taxRate: {
        type: Number,
        required: true,
        min: 0,
        default: 16, // Default to 16%
    },
    currency: {
        type: String,
        default: 'INR',
    },
    rsvpStatus: {
        type: String,
        enum: ['Attending', 'Not Attending', 'Maybe', 'Pending', 'Cancelled', 'N/A'],
        default: 'N/A',
    },
    availableTickets: {
        type: Number,
        required: true,
        min: 0,
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
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Complete'],
        default: 'Active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
