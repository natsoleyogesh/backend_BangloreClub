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
        showInGatekeeper: {
            type: Boolean,
            default: false,
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