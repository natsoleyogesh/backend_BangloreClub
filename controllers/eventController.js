// const 
const Event = require('../models/event');
const EventBooking = require('../models/eventBooking');
const QRCodeHelper = require('../utils/helper');

const createEvent = async (req, res) => {
    try {
        const {
            eventTitle,
            eventSubtitle,
            eventDate,
            startTime,
            endTime,
            ticketPrice,
            currency,
            rsvpStatus,
            availableTickets,
            location,
            aboutEvent,
            organizer,
            primaryMemberPrice,
            dependentMemberPrice,
            guestMemberPrice,
            taxRate,
        } = req.body;

        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: 'Event Banner Image is Required!',
            });
        }

        const eventImage = `/uploads/event/${req.file.filename}`;

        // Get the current date and time
        const currentDateTime = new Date();
        const eventDateTime = new Date(eventDate);

        // Parse startTime and endTime into hours and minutes
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        // Create Date objects for startTime and endTime
        const eventStartTime = new Date(eventDateTime.setHours(startHour, startMinute));
        const eventEndTime = new Date(eventDateTime.setHours(endHour, endMinute));

        // Validation 1: Check if the event date is in the past
        if (eventDateTime < currentDateTime.setHours(0, 0, 0, 0)) {
            return res.status(400).json({
                message: 'Event date must be today or a future date.',
            });
        }

        // Validation 2: If the event date is today, check that the start time is in the future
        if (eventDateTime.toDateString() === currentDateTime.toDateString()) {
            if (eventStartTime <= currentDateTime) {
                return res.status(400).json({
                    message: 'Event start time must be later than the current time if the event is today.',
                });
            }
        }

        // Validation 3: Check if end time is after start time
        if (eventEndTime <= eventStartTime) {
            return res.status(400).json({
                message: 'Event end time must be after the start time.',
            });
        }

        // Create a new event document
        const newEvent = new Event({
            eventTitle,
            eventSubtitle,
            eventDate,
            startTime,
            endTime,
            ticketPrice,
            currency,
            rsvpStatus,
            availableTickets,
            eventImage,
            location,
            aboutEvent,
            organizer,
            primaryMemberPrice,
            dependentMemberPrice,
            guestMemberPrice,
            taxRate,
        });

        // Save the event to the database
        const savedEvent = await newEvent.save();
        res.status(201).json({
            message: 'Event created successfully.',
            event: savedEvent,
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


const getAllEvents = async (req, res) => {
    try {
        // Fetch all events that are not marked as deleted
        const events = await Event.find({ isDeleted: false });
        const allEvents = events.reverse();
        res.status(200).json({
            message: 'Events fetched successfully.',
            allEvents,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Please Provide the Event Id' });
        }

        const event = await Event.findById(id);

        if (!event || event.isDeleted) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.status(200).json({
            message: 'Event fetched successfully.',
            event,
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            eventTitle,
            eventSubtitle,
            eventDate,
            startTime,
            endTime,
            ticketPrice,
            currency,
            rsvpStatus,
            availableTickets,
            location,
            aboutEvent,
            organizer,
            status,
            primaryMemberPrice,
            dependentMemberPrice,
            guestMemberPrice,
            taxRate,
        } = req.body;

        // Find the existing event
        const existingEvent = await Event.findById(id);

        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Get the current date and time
        const currentDateTime = new Date();
        const currentHour = currentDateTime.getHours();
        const currentMinute = currentDateTime.getMinutes();

        // Validate eventDate if provided
        let updatedEventDate = existingEvent.eventDate;
        if (eventDate) {
            updatedEventDate = new Date(eventDate);

            // Check if the provided eventDate is in the past
            if (updatedEventDate < currentDateTime.setHours(0, 0, 0, 0)) {
                return res.status(400).json({
                    message: 'Event date cannot be in the past.',
                });
            }
        }

        let eventStartTime, eventEndTime;

        // Validate date and time if provided
        if (updatedEventDate || startTime || endTime) {
            const eventDateTime = updatedEventDate || existingEvent.eventDate;
            const [startHour, startMinute] = (startTime || existingEvent.startTime).split(':').map(Number);
            const [endHour, endMinute] = (endTime || existingEvent.endTime).split(':').map(Number);

            // Create Date objects for startTime and endTime
            eventStartTime = new Date(eventDateTime);
            eventStartTime.setHours(startHour, startMinute);

            eventEndTime = new Date(eventDateTime);
            eventEndTime.setHours(endHour, endMinute);

            // If the event date is today, validate start time against the current time
            if (eventDateTime.toDateString() === currentDateTime.toDateString()) {
                // Check if the provided start time is earlier than the current time
                if (
                    startHour < currentHour ||
                    (startHour === currentHour && startMinute <= currentMinute)
                ) {
                    return res.status(400).json({
                        message: 'Event start time must be later than the current time.',
                    });
                }
            }

            // Check if end time is after start time
            if (eventEndTime <= eventStartTime) {
                return res.status(400).json({
                    message: 'Event end time must be after the start time.',
                });
            }
        }

        // Handle image upload if a new file is provided
        const eventImage = req.file ? `/uploads/event/${req.file.filename}` : existingEvent.eventImage;

        // Update the event fields only if they are provided in the request
        const updateData = {
            eventTitle: eventTitle || existingEvent.eventTitle,
            eventSubtitle: eventSubtitle || existingEvent.eventSubtitle,
            eventDate: updatedEventDate || existingEvent.eventDate,
            startTime: startTime || existingEvent.startTime,
            endTime: endTime || existingEvent.endTime,
            ticketPrice: ticketPrice || existingEvent.ticketPrice,
            currency: currency || existingEvent.currency,
            rsvpStatus: rsvpStatus || existingEvent.rsvpStatus,
            availableTickets: availableTickets || existingEvent.availableTickets,
            eventImage: eventImage,
            location: location || existingEvent.location,
            aboutEvent: aboutEvent || existingEvent.aboutEvent,
            organizer: organizer || existingEvent.organizer,
            status: status || existingEvent.status,
            primaryMemberPrice: primaryMemberPrice || existingEvent.primaryMemberPrice,
            dependentMemberPrice: dependentMemberPrice || existingEvent.dependentMemberPrice,
            guestMemberPrice: guestMemberPrice || existingEvent.guestMemberPrice,
            taxRate: taxRate || existingEvent.taxRate,
        };

        // Update the event using findByIdAndUpdate
        const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.status(200).json({
            message: 'Event updated successfully.',
            event: updatedEvent,
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Please Provide the Event Id!' });
        }
        // Attempt to find and delete the event by ID
        const deletedEvent = await Event.findByIdAndDelete(id);

        // Check if the event was found and deleted
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.status(200).json({
            message: 'Event deleted successfully.',
            eventId: id,
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}


const bookEvent = async (req, res) => {
    try {
        const { eventId, primaryMemberId, dependents, guests } = req.body;

        // Validate request data
        if (!eventId || !primaryMemberId) {
            return res.status(400).json({ message: 'Event ID and Primary Member ID are required.' });
        }

        // Check if the user has already booked this event
        const existingBooking = await EventBooking.findOne({ eventId, primaryMemberId, bookingStatus: "Confirmed" });
        if (existingBooking) {
            return res.status(400).json({ message: 'You have already booked this event.' });
        }

        // Fetch the event details
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.status !== 'Active') {
            return res.status(400).json({ message: 'Event is not active or available for booking.' });
        }

        if (event.availableTickets <= 0) {
            return res.status(400).json({ message: 'No tickets available for this event.' });
        }

        // Pricing calculations
        const primaryMemberCount = 1; // Primary member is always 1
        const dependentMemberCount = dependents ? dependents.length : 0;
        const guestMemberCount = guests ? guests.length : 0;

        const subtotal =
            primaryMemberCount * event.primaryMemberPrice +
            dependentMemberCount * event.dependentMemberPrice +
            guestMemberCount * event.guestMemberPrice;

        const taxAmount = (subtotal * event.taxRate) / 100;
        const totalAmount = subtotal + taxAmount;

        // Prepare individual QR data
        const members = [
            { userId: primaryMemberId, type: 'Primary', eventId },
            ...(dependents || []).map(dep => ({ userId: dep.userId, type: 'Dependent', eventId })),
            ...(guests || []).map(guest => ({ userId: guest.name, type: 'Guest', eventId })), // For guest, use name instead of userId
        ];

        // Generate individual QR codes
        const qrCodes = await QRCodeHelper.generateMultipleQRCodes(members);

        // Generate QR code for all details
        const allDetailsQRCodeData = {
            eventId,
            eventTitle: event.eventTitle,
            eventDate: event.eventDate,
            primaryMemberId,
            dependents,
            guests,
            ticketDetails: {
                primaryMemberPrice: event.primaryMemberPrice,
                dependentPrice: event.dependentMemberPrice,
                guestPrice: event.guestMemberPrice,
                taxRate: event.taxRate,
                subtotal,
                taxAmount,
                totalAmount,
            },
        };
        const allDetailsQRCode = await QRCodeHelper.generateQRCode(allDetailsQRCodeData);

        // Generate QR code for the primary member
        const primaryMemberQRCode = qrCodes.find(qr => qr.userId.toString() === primaryMemberId.toString()).qrCode;

        // Save the booking
        const newBooking = new EventBooking({
            eventId,
            primaryMemberId,
            primaryMemberQRCode, // Store the primary member's QR code
            dependents: dependents.map(dep => ({
                userId: dep.userId,
                qrCode: qrCodes.find(qr => qr.userId.toString() === dep.userId.toString()).qrCode,
            })),
            guests: guests.map(guest => ({
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                qrCode: qrCodes.find(qr => qr.userId === guest.name).qrCode,
            })),
            counts: {
                primaryMemberCount,
                dependentMemberCount,
                guestMemberCount,
            },
            ticketDetails: {
                primaryMemberPrice: event.primaryMemberPrice,
                dependentPrice: event.dependentMemberPrice,
                guestPrice: event.guestMemberPrice,
                taxRate: event.taxRate,
                subtotal,
                taxAmount,
                totalAmount,
            },
            allDetailsQRCode,
            paymentStatus: 'Pending',
            bookingStatus: 'Confirmed',
        });

        await newBooking.save();

        // Update the available tickets in the Event schema
        event.availableTickets -= (primaryMemberCount + dependentMemberCount + guestMemberCount);
        await event.save();

        // Return the response
        return res.status(201).json({
            message: 'Booking successful',
            bookingDetails: newBooking,
        });
    } catch (error) {
        console.error('Error booking event:', error);
        return res.status(500).json({ message: 'An error occurred while booking the event.', error });
    }
};



const bookingDetails = async (req, res) => {
    try {
        const { eventId, primaryMemberId, dependents, guests } = req.body;

        // Validate request data
        if (!eventId || !primaryMemberId) {
            return res.status(400).json({ message: 'Event ID and Primary Member ID are required.' });
        }

        // Fetch the event details
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.status !== 'Active') {
            return res.status(400).json({ message: 'Event is not active or available for booking.' });
        }

        if (event.availableTickets <= 0) {
            return res.status(400).json({ message: 'No tickets available for this event.' });
        }

        // Pricing calculations
        const primaryMemberCount = 1; // Primary member is always 1
        const dependentMemberCount = dependents ? dependents.length : 0;
        const guestMemberCount = guests ? guests.length : 0;

        const subtotal =
            primaryMemberCount * event.primaryMemberPrice +
            dependentMemberCount * event.dependentMemberPrice +
            guestMemberCount * event.guestMemberPrice;

        const taxAmount = (subtotal * event.taxRate) / 100;
        const totalAmount = subtotal + taxAmount;

        // Prepare the response data without QR codes
        const bookingDetails = {
            eventId,
            primaryMemberId,
            dependents: dependents || [],
            guests: guests || [],
            counts: {
                primaryMemberCount,
                dependentMemberCount,
                guestMemberCount,
            },
            ticketDetails: {
                primaryMemberPrice: event.primaryMemberPrice,
                dependentPrice: event.dependentMemberPrice,
                guestPrice: event.guestMemberPrice,
                taxRate: event.taxRate,
                subtotal,
                taxAmount,
                totalAmount,
            },
            paymentStatus: 'Pending', // Default status
            bookingStatus: 'Pending', // Default status
        };

        // Return the booking details without saving to the database
        return res.status(200).json({
            message: 'Booking details calculated successfully.',
            bookingDetails,
        });
    } catch (error) {
        console.error('Error booking event:', error);
        return res.status(500).json({ message: 'An error occurred while calculating the event booking details.', error });
    }
};


const getAllBookings = async (req, res) => {
    try {
        const bookings = await EventBooking.find({ isDeleted: false, deletedAt: null })
            .populate("eventId")
            .populate("primaryMemberId");
        return res.status(200).json({ message: 'Bookings fetched successfully', bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ message: 'An error occurred while fetching bookings', error });
    }
};


const getBookingDetailsById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find the booking, ensuring it is not deleted
        const booking = await EventBooking.findById(bookingId)
            .populate("eventId")
            .populate("primaryMemberId")
            .populate("dependents.userId") // Populate dependents
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or has been deleted' });
        }

        // Format the booking details
        const formattedBooking = {
            ticketDetails: booking.ticketDetails,
            _id: booking._id,
            memberDetails: [], // Array to hold all members (primary, dependents, and guests)
            allDetailsQRCode: booking.allDetailsQRCode, // QR code for all details
            paymentStatus: booking.paymentStatus,
            bookingStatus: booking.bookingStatus,
            isDeleted: booking.isDeleted,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        };

        // Add primary member to memberDetails array
        formattedBooking.memberDetails.push({
            _id: booking.primaryMemberId._id,
            name: booking.primaryMemberId.name,
            email: booking.primaryMemberId.email,
            mobileNumber: booking.primaryMemberId.mobileNumber,
            memberId: booking.primaryMemberId.memberId,
            relation: booking.primaryMemberId.relation,
            profilePicture: booking.primaryMemberId.profilePicture,
            type: booking.primaryMemberId.relation,
            qrCode: booking.primaryMemberQRCode, // Primary member QR code
        });

        // Add dependents to memberDetails array
        booking.dependents.forEach(dep => {
            formattedBooking.memberDetails.push({
                _id: dep.userId._id,
                name: dep.userId.name,
                email: dep.userId.email,
                mobileNumber: dep.userId.mobileNumber,
                memberId: dep.userId.memberId,
                relation: dep.userId.relation,
                profilePicture: dep.userId.profilePicture,
                type: dep.type,
                qrCode: dep.qrCode, // Dependent QR code
            });
        });

        // Add guests to memberDetails array
        booking.guests.forEach(guest => {
            formattedBooking.memberDetails.push({
                _id: guest._id,
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                type: guest.type,
                qrCode: guest.qrCode, // Guest QR code
            });
        });

        // Return the response with formatted booking details
        return res.status(200).json({
            message: 'Booking fetched successfully',
            booking: formattedBooking,
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the booking', error });
    }
};



const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find the booking, ensuring it is not deleted
        const booking = await EventBooking.findById(bookingId)
            .populate("eventId")
            .populate("primaryMemberId")
            .populate("dependents.userId")
        // .populate('eventId primaryMemberId dependents.userId guests.userId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or has been deleted' });
        }

        return res.status(200).json({ message: 'Booking fetched successfully', booking });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the booking', error });
    }
};


const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await EventBooking.findById(bookingId)

        // If no booking was found or already deleted
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or already deleted' });
        }
        // Soft delete: set `deletedAt` to the current time using findByIdAndUpdate
        const deletedbooking = await EventBooking.findByIdAndUpdate(
            bookingId,
            { isDeleted: true, deletedAt: new Date() },
            { new: true, runValidators: true } // `new: true` returns the updated document
        );

        return res.status(200).json({ message: 'Booking deleted successfully!', booking: deletedbooking });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the booking', error });
    }
};



module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    bookEvent,
    bookingDetails,
    getAllBookings,
    getBookingById,
    deleteBooking,
    getBookingDetailsById
}