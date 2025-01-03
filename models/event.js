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
    taxTypes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaxType', // Reference to TaxType model
    }],
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
    showBanner: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Pre-save middleware to format the `name` field
eventSchema.pre('save', function (next) {
    if (this.eventTitle) {
        // Convert to title case (e.g., "OTHER Tax" → "Other Tax")
        this.eventTitle = this.eventTitle
            .toLowerCase() // Convert all to lowercase first
            .split(' ') // Split the name into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join words back with spaces
    }
    next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
