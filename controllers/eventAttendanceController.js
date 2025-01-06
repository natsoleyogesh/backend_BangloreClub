const EventAttendance = require("../models/eventAttendanceSchema ");

const createAttendanceRecords = async (booking) => {
    const attendanceRecords = [];

    // Add primary member attendance record
    attendanceRecords.push({
        eventId: booking.eventId,
        memberId: booking.primaryMemberId,
        qrCode: booking.primaryMemberQRCode,
    });

    // Add dependent attendance records
    booking.dependents.forEach((dependent) => {
        attendanceRecords.push({
            eventId: booking.eventId,
            memberId: dependent.userId,
            qrCode: dependent.qrCode,
        });
    });

    // Add guest attendance records
    booking.guests.forEach((guest) => {
        attendanceRecords.push({
            eventId: booking.eventId,
            guestName: guest.name,
            qrCode: guest.qrCode,
        });
    });

    // Save all attendance records
    await EventAttendance.insertMany(attendanceRecords);
};

const markAttendance = async (req, res) => {
    try {
        const { qrCode } = req.body;

        if (!qrCode) {
            return res.status(400).json({ message: 'QR Code is required.' });
        }

        // Find the attendance record by QR code
        const attendanceRecord = await EventAttendance.findOne({ qrCode });

        if (!attendanceRecord) {
            return res.status(404).json({ message: 'Invalid QR Code. No attendance record found.' });
        }

        if (attendanceRecord.attendanceStatus === 'Present') {
            return res.status(400).json({ message: 'Attendance already marked for this member/guest.' });
        }

        // Update attendance status and timestamp
        attendanceRecord.attendanceStatus = 'Present';
        attendanceRecord.scannedAt = new Date();
        await attendanceRecord.save();

        return res.status(200).json({ message: 'Attendance marked successfully.', attendanceRecord });
    } catch (error) {
        console.error('Error marking attendance:', error);
        return res.status(500).json({ message: 'An error occurred while marking attendance.', error });
    }
};

const getEventAttendance = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required.' });
        }

        const attendanceRecords = await EventAttendance.find({ eventId })
            .populate('memberId', 'name email') // Populate member details
            .lean();

        const formattedRecords = attendanceRecords.map((record) => ({
            name: record.memberId ? record.memberId.name : record.guestName,
            email: record.memberId ? record.memberId.email : 'N/A',
            attendanceStatus: record.attendanceStatus,
            scannedAt: record.scannedAt || 'Not Scanned',
        }));

        return res.status(200).json({
            message: 'Attendance records fetched successfully.',
            attendees: formattedRecords,
        });
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        return res.status(500).json({ message: 'An error occurred while fetching attendance records.', error });
    }
};


module.exports = {
    createAttendanceRecords,
    markAttendance,
    getEventAttendance
}
