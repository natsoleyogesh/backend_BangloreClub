const Event = require("../models/event");
const EventAttendance = require("../models/eventAttendanceSchema ");
const User = require("../models/user");

const createAttendanceRecords = async (booking) => {
    const attendanceRecords = [];

    // Add primary member attendance record
    if (booking.counts.primaryMemberCount > 0) {
        attendanceRecords.push({
            eventId: booking.eventId,
            memberId: booking.primaryMemberId,
            qrCode: booking.uniqueQRCode,
            qrCodeData: booking.primaryMemberQRCode
        });
    }


    // Add dependent attendance records
    booking.dependents.forEach((dependent) => {
        attendanceRecords.push({
            eventId: booking.eventId,
            memberId: dependent.userId,
            qrCode: dependent.uniqueQRCode,
            qrCodeData: dependent.qrCode
        });
    });

    // Add guest attendance records
    booking.guests.forEach((guest) => {
        attendanceRecords.push({
            eventId: booking.eventId,
            guestName: guest.name,
            qrCode: guest.uniqueQRCode,
            qrCodeData: guest.qrCode
        });
    });

    // Save all attendance records
    await EventAttendance.insertMany(attendanceRecords);
};

const markAttendance = async (req, res) => {
    try {
        const { qrCode } = req.body;
        const { userId, role } = req.user;
        console.log(userId, role)
        if (role !== 'gatekeeper' && role !== 'admin') {
            return res.status(400).json({ message: 'You are not eligible to scan the QR code.' });
        }

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
        attendanceRecord.gatekeeperId = userId;
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

        const attendanceRecords = await EventAttendance.find({ eventId, attendanceStatus: 'Present' })
            .populate('memberId', 'name email') // Populate member details
            .populate('gatekeeperId', 'name email') // Populate member details
            .lean();

        const formattedRecords = attendanceRecords.map((record) => ({
            name: record.memberId ? record.memberId.name : record.guestName,
            email: record.memberId ? record.memberId.email : 'N/A',
            gatekeeperName: record.gatekeeperId ? record.gatekeeperId.name : 'N/A',
            attendanceStatus: record.attendanceStatus,
            qrCode: record.qrCode,
            scannedAt: record.scannedAt || 'Not Scanned',
        }));
        const finalrecords = formattedRecords.reverse();
        return res.status(200).json({
            message: 'Attendance records fetched successfully.',
            attendees: finalrecords,
        });
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        return res.status(500).json({ message: 'An error occurred while fetching attendance records.', error });
    }
};


const getMemberDetailsFromQR = async (req, res) => {
    try {
        const { qrData } = req.body; // Expecting QR data in the request body

        if (!qrData) {
            return res.status(400).json({ message: "QR data is required" });
        }

        // Parse the QR data
        const { userId, type, eventId, uniqueQRCodeData } = qrData;

        if (!userId || !type || !eventId || !uniqueQRCodeData) {
            return res.status(400).json({ message: "Incomplete QR data" });
        }

        // Initialize response object
        let response = {
            eventDetails: null,
            userDetails: null,
            guestName: null,
        };

        // Fetch event details
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Add event details to response
        response.eventDetails = {
            title: event.eventTitle,
            date: event.eventStartDate,
            status: event.status,
            availableTickets: event.availableTickets,
        };

        if (type === "Guest") {
            // If the type is "Guest", return only the guestName
            response.guestName = userId; // For guests, userId is actually the guest's name
        } else {
            // If type is not "Guest", fetch user details
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Add user details to response
            response.userDetails = {
                name: user.name,
                email: user.email,
                status: user.status,
            };
        }

        // Return the response
        return res.status(200).json({
            message: "Member details fetched successfully",
            data: response,
        });
    } catch (error) {
        console.error("Error fetching member details from QR:", error);
        return res.status(500).json({
            message: "An error occurred while fetching member details",
            error: error.message,
        });
    }
};


module.exports = {
    createAttendanceRecords,
    markAttendance,
    getEventAttendance,
    getMemberDetailsFromQR
}
