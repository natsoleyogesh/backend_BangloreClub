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
        gatekeeperId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin", // Reference to the Gatekeeper (User) model
            default: null
        },
        guestName: {
            type: String, // Name of the guest
            required: function () {
                return !this.memberId; // Required if memberId is not provided
            },
        },
        name: {
            type: String, // Name of the guest
            default: ""
        },
        email: {
            type: String, // Unique QR code for attendance tracking
            default: ""
        },
        mobileNumber: {
            type: String, // Unique QR code for attendance tracking
            default: ""
        },
        qrCode: {
            type: String, // Unique QR code for attendance tracking
            required: true,
        },
        qrCodeData: {
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
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const EventAttendance = mongoose.model('EventAttendance', eventAttendanceSchema);

module.exports = EventAttendance;
