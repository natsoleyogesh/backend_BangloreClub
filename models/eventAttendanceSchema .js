const mongoose = require('mongoose');

const eventAttendanceSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event', // Reference to the Event model
            required: true,
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model (for primary member or dependents)
            required: false, // Optional for guests
        },
        guestName: {
            type: String, // Name of the guest
            required: function () {
                return !this.memberId; // Required if memberId is not provided
            },
        },
        qrCode: {
            type: String, // Unique QR code for attendance tracking
            required: true,
        },
        attendanceStatus: {
            type: String,
            enum: ['Present', 'Absent'], // Track if the member or guest attended the event
            default: 'Absent',
        },
        scannedAt: {
            type: Date, // Timestamp of when the QR code was scanned
        },
    },
    { timestamps: true }
);

const EventAttendance = mongoose.model('EventAttendance', eventAttendanceSchema);

module.exports = EventAttendance;
