// const 
const Event = require('../models/event');
const User = require("../models/user")
const EventBooking = require('../models/eventBooking');
const QRCodeHelper = require('../utils/helper');
const { addBilling } = require('./billingController');
const sendEmail = require('../utils/sendMail');
const emailTemplates = require('../utils/emailTemplates');
const { eventrenderTemplate } = require('../utils/templateRenderer');
const { toTitleCase } = require('../utils/common');
const { default: mongoose } = require('mongoose');
const { createAttendanceRecords } = require('./eventAttendanceController');
const moment = require('moment')

const createEvent = async (req, res) => {
    try {
        const {
            eventTitle,
            eventSubtitle,
            eventStartDate,
            eventEndDate,
            startTime,
            endTime,
            ticketPrice,
            rsvpStatus,
            availableTickets,
            location,
            aboutEvent,
            organizer,
            primaryMemberPrice,
            dependentMemberPrice,
            guestMemberPrice,
            taxTypes,
            showBanner
        } = req.body;

        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: 'Event Banner Image is Required!',
            });
        }

        const normalizedTitle = toTitleCase(eventTitle);
        // Check if the event already exists
        const existingNotice = await Event.findOne({ eventTitle: normalizedTitle, isDeleted: false });
        if (existingNotice) {
            return res.status(400).json({ message: 'Event already exists but is inactive.' });
        }

        const eventImage = `/uploads/event/${req.file.filename}`;

        // Get the current date and time
        const currentDateTime = new Date();
        const eventStartDateTime = new Date(eventStartDate);
        const eventEndDateTime = new Date(eventEndDate);

        // Parse startTime and endTime into hours and minutes
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        // Create Date objects for event start and end times
        const eventStartDateTimeWithTime = new Date(eventStartDateTime.setHours(startHour, startMinute));
        const eventEndDateTimeWithTime = new Date(eventEndDateTime.setHours(endHour, endMinute));

        // Validation 1: Check if the event start date is in the past
        if (eventStartDateTime < currentDateTime.setHours(0, 0, 0, 0)) {
            return res.status(400).json({
                message: 'Event start date must be today or a future date.',
            });
        }

        // Validation 2: If the event start date is today, check that the start time is in the future
        if (eventStartDateTime.toDateString() === currentDateTime.toDateString()) {
            if (eventStartDateTimeWithTime <= currentDateTime) {
                return res.status(400).json({
                    message: 'Event start time must be later than the current time if the event starts today.',
                });
            }
        }

        // Validation 3: Check if the event end date is after the start date
        if (eventEndDateTime < eventStartDateTime) {
            return res.status(400).json({
                message: 'Event end date must be after the start date.',
            });
        }

        // Validation 4: Check if the end time is after the start time on the same day
        if (eventStartDateTime.toDateString() === eventEndDateTime.toDateString() &&
            eventEndDateTimeWithTime <= eventStartDateTimeWithTime) {
            return res.status(400).json({
                message: 'Event end time must be after the start time.',
            });
        }

        // Parse and validate tax types
        const parsedTaxTypes = Array.isArray(taxTypes)
            ? taxTypes
            : typeof taxTypes === 'string'
                ? JSON.parse(taxTypes)
                : [];

        // Create a new event document
        const newEvent = new Event({
            eventTitle,
            eventSubtitle,
            eventStartDate,
            eventEndDate,
            startTime,
            endTime,
            ticketPrice,
            rsvpStatus,
            availableTickets,
            eventImage,
            location,
            aboutEvent,
            organizer,
            primaryMemberPrice,
            dependentMemberPrice,
            guestMemberPrice,
            taxTypes: parsedTaxTypes,
            showBanner: showBanner
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
        const { isAdmin } = req.query;

        // Get the current date and time
        const currentDateTime = new Date();

        // Determine the query for events based on admin or non-admin access
        let query = { isDeleted: false };

        if (isAdmin === 'true') {
            // Admin access: Fetch all non-deleted events without filtering by date
            query = { isDeleted: false };
        } else {
            // Non-admin access: Fetch only non-expired events
            query = {
                isDeleted: false,
                $or: [
                    // Future or ongoing events
                    { eventEndDate: { $gte: currentDateTime.toISOString().split('T')[0] } },
                    // Events ending today but still ongoing based on time
                    {
                        $and: [
                            { eventEndDate: currentDateTime.toISOString().split('T')[0] },
                            { endTime: { $gt: currentDateTime.toTimeString().split(' ')[0] } },
                        ],
                    },
                ],
            };
        }

        // Fetch events and populate the taxTypes field
        const events = await Event.find(query).populate("taxTypes");

        // Reverse events to show the latest first
        const allEvents = events.reverse();

        // Return the fetched events
        return res.status(200).json({
            message: 'Events fetched successfully.',
            allEvents,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


// const getEventById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { opration } = req.query;

//         if (!id) {
//             return res.status(400).json({ message: 'Please Provide the Event Id' });
//         }

//         let event = {};
//         if (opration == 'edit') {
//             event = await Event.findById(id);

//         }

//         event = await Event.findById(id).populate("taxTypes");

//         if (!event || event.isDeleted) {
//             return res.status(404).json({ message: 'Event not found.' });
//         }

//         res.status(200).json({
//             message: 'Event fetched successfully.',
//             event,
//         });
//     } catch (error) {
//         console.error('Error fetching event:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// }

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const { operation } = req.query;

        // Validate event ID
        if (!id) {
            return res.status(400).json({ message: 'Please provide the Event ID.' });
        }

        // Fetch event details
        const query = Event.findById(id);

        // If operation is 'edit', populate tax types
        if (operation !== 'edit') {
            query.populate("taxTypes");
        }

        const event = await query;

        // Check if event exists and is not deleted
        if (!event || event.isDeleted) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Respond with the event details
        res.status(200).json({
            message: 'Event fetched successfully.',
            event,
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        let {
            eventTitle,
            eventSubtitle,
            eventStartDate,
            eventEndDate,
            startTime,
            endTime,
            ticketPrice,
            rsvpStatus,
            availableTickets,
            location,
            aboutEvent,
            organizer,
            status,
            primaryMemberPrice,
            dependentMemberPrice,
            guestMemberPrice,
            taxTypes,
            showBanner
        } = req.body;

        // Find the existing event
        const existingEvent = await Event.findById(id);

        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        let normalizedTitle;
        if (eventTitle) {
            normalizedTitle = toTitleCase(eventTitle);

            const duplicateEvent = await Event.findOne({
                eventTitle: normalizedTitle,
                _id: { $ne: id }, // Exclude the current event by ID
            });

            if (duplicateEvent) {
                return res.status(400).json({ message: 'An event with this title already exists.' });
            }
        }

        // Get the current date and time
        const currentDateTime = new Date();

        // Validate eventStartDate and eventEndDate if provided
        let updatedEventStartDate = existingEvent.eventStartDate;
        let updatedEventEndDate = existingEvent.eventEndDate;

        if (eventStartDate) {
            updatedEventStartDate = new Date(eventStartDate);

            // Check if the provided start date is in the past
            if (updatedEventStartDate < currentDateTime.setHours(0, 0, 0, 0)) {
                return res.status(400).json({
                    message: 'Event start date cannot be in the past.',
                });
            }
        }

        if (eventEndDate) {
            updatedEventEndDate = new Date(eventEndDate);

            // Check if the end date is before the start date
            if (updatedEventEndDate < updatedEventStartDate) {
                return res.status(400).json({
                    message: 'Event end date must be after the start date.',
                });
            }
        }

        let eventStartTime, eventEndTime;

        // Validate startTime and endTime if provided
        if (updatedEventStartDate || startTime || endTime) {
            const eventStartDateTime = updatedEventStartDate || existingEvent.eventStartDate;
            const [startHour, startMinute] = (startTime || existingEvent.startTime).split(':').map(Number);
            const [endHour, endMinute] = (endTime || existingEvent.endTime).split(':').map(Number);

            // Create Date objects for startTime and endTime
            eventStartTime = new Date(eventStartDateTime);
            eventStartTime.setHours(startHour, startMinute);

            eventEndTime = new Date(updatedEventEndDate || eventStartDateTime);
            eventEndTime.setHours(endHour, endMinute);

            // If the event starts today, validate start time against the current time
            if (eventStartDateTime.toDateString() === currentDateTime.toDateString()) {
                if (eventStartTime <= currentDateTime) {
                    return res.status(400).json({
                        message: 'Event start time must be later than the current time if the event starts today.',
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

        // Parse and validate tax types
        const parsedTaxTypes = taxTypes
            ? Array.isArray(taxTypes)
                ? taxTypes
                : typeof taxTypes === 'string'
                    ? taxTypes.split(',').map(id => id.trim())
                    : []
            : undefined;

        if (parsedTaxTypes && parsedTaxTypes.some(id => !mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: 'Invalid tax types provided.' });
        }

        // Handle image upload if a new file is provided
        const eventImage = req.file ? `/uploads/event/${req.file.filename}` : existingEvent.eventImage;

        // const parsedShowBanner = typeof showBanner === "boolean" ? showBanner : showBanner === "true";

        // Update the event fields only if they are provided in the request
        const updateData = {
            eventTitle: normalizedTitle || existingEvent.eventTitle,
            eventSubtitle: eventSubtitle || existingEvent.eventSubtitle,
            eventStartDate: updatedEventStartDate || existingEvent.eventStartDate,
            eventEndDate: updatedEventEndDate || existingEvent.eventEndDate,
            startTime: startTime || existingEvent.startTime,
            endTime: endTime || existingEvent.endTime,
            ticketPrice: ticketPrice || existingEvent.ticketPrice,
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
            taxTypes: parsedTaxTypes || existingEvent.taxTypes,
            showBanner: showBanner || existingEvent.showBanner
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
        const { eventId, primaryMemberId, dependents, guests, primaryMemberChecked } = req.body;

        // Validate request data
        if (!eventId || !primaryMemberId) {
            return res.status(400).json({ message: 'Event ID and Primary Member ID are required.' });
        }

        // Check if the user has already booked this event
        const existingBooking = await EventBooking.findOne({ eventId, primaryMemberId, bookingStatus: "Confirmed" });
        // if (existingBooking) {
        //     return res.status(400).json({ message: 'You have already booked this event.' });
        // }

        // Fetch the event details
        const event = await Event.findById(eventId).populate("taxTypes");
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.status !== 'Active') {
            return res.status(400).json({ message: 'Event is not active or available for booking.' });
        }

        // if (event.availableTickets <= 0) {
        //     return res.status(400).json({ message: 'No tickets available for this event.' });
        // }

        // Pricing calculations
        let primaryMemberCount = 0;
        if (primaryMemberChecked === true) {
            primaryMemberCount = 1; // Primary member is always 1
        }
        const dependentMemberCount = dependents ? dependents.length : 0;
        const guestMemberCount = guests ? guests.length : 0;

        const totalMemberCount = primaryMemberCount + dependentMemberCount + guestMemberCount;

        if (event.availableTickets <= totalMemberCount) {
            return res.status(400).json({ message: 'No tickets available for this event.' });
        }

        const subtotal =
            primaryMemberCount * event.primaryMemberPrice +
            dependentMemberCount * event.dependentMemberPrice +
            guestMemberCount * event.guestMemberPrice;

        // Calculate taxes based on taxTypes
        const taxDetails = event.taxTypes.map(taxType => {
            const taxAmount = (subtotal * taxType.percentage) / 100;
            return {
                taxType: taxType.name || "N/A",
                taxRate: taxType.percentage || 0,
                taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimal places
            };
        });

        const totalTaxAmount = taxDetails.reduce((acc, tax) => acc + tax.taxAmount, 0);
        const totalAmount = subtotal + totalTaxAmount;

        // Generate QR codes for all members
        const members = [
            { userId: primaryMemberId, type: 'Primary', eventId },
            ...(dependents || []).map(dep => ({ userId: dep.userId, type: 'Dependent', eventId })),
            ...(guests || []).map(guest => ({ userId: guest.name, type: 'Guest', eventId })), // For guest, use name instead of userId
        ];
        const qrCodes = await QRCodeHelper.generateMultipleQRCodes(members);

        // Generate QR code for all details
        const uniqueNumber = Math.floor(Math.random() * 10000000000); // Generates a random 10-digit number
        const uniqueQRCodeId = `QR${uniqueNumber}`; // The unique QR code string
        const allDetailsQRCodeData = {
            uniqueQRCodeId,
            eventId,
            eventTitle: event.eventTitle,
            primaryMemberId,
            dependents,
            guests,
            ticketDetails: {
                primaryMemberPrice: event.primaryMemberPrice,
                dependentPrice: event.dependentMemberPrice,
                guestPrice: event.guestMemberPrice,
                taxTypes: taxDetails,
                subtotal,
                taxAmount: totalTaxAmount,
                totalAmount,
            },
        };
        const allDetailsQRCode = await QRCodeHelper.generateQRCode(allDetailsQRCodeData);

        // Prepare dependents and guests with QR codes
        const preparedDependents = dependents
            ? dependents.map(dep => ({
                userId: dep.userId,
                qrCode: qrCodes.find(qr => qr.userId.toString() === dep.userId.toString()).qrCode,
                uniqueQRCode: qrCodes.find(qr => qr.userId.toString() === dep.userId.toString()).uniqueQRCodeData,
            }))
            : [];
        const preparedGuests = guests
            ? guests.map(guest => ({
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                qrCode: qrCodes.find(qr => qr.userId === guest.name).qrCode,
                uniqueQRCode: qrCodes.find(qr => qr.userId === guest.name).uniqueQRCodeData,
            }))
            : [];

        // Save the booking
        const newBooking = new EventBooking({
            eventId,
            primaryMemberId,
            primaryMemberQRCode: qrCodes.find(qr => qr.userId.toString() === primaryMemberId.toString()).qrCode,
            uniqueQRCode: qrCodes.find(qr => qr.userId.toString() === primaryMemberId.toString()).uniqueQRCodeData,
            dependents: preparedDependents,
            guests: preparedGuests,
            counts: {
                primaryMemberCount,
                dependentMemberCount,
                guestMemberCount,
            },
            ticketDetails: {
                primaryMemberPrice: event.primaryMemberPrice,
                dependentPrice: event.dependentMemberPrice,
                guestPrice: event.guestMemberPrice,
                taxTypes: taxDetails,
                subtotal,
                taxAmount: totalTaxAmount,
                totalAmount,
            },
            allDetailsQRCode,
            allDetailsUniqueQRCode: uniqueQRCodeId,
            paymentStatus: 'Pending',
            bookingStatus: 'Confirmed',
        });

        await newBooking.save();

        // Update the available tickets in the Event schema
        event.availableTickets -= (primaryMemberCount + dependentMemberCount + guestMemberCount);
        await event.save();

        // Call this function after booking is created
        await createAttendanceRecords(newBooking);

        // Send confirmation email
        const memberData = await EventBooking.findById(newBooking._id)
            .populate("eventId")
            .populate("primaryMemberId")
            .populate("dependents.userId");

        // const templateData = {
        //     uniqueQRCode: newBooking.allDetailsUniqueQRCode,
        //     qrCode: allDetailsQRCode, // Base64 string for QR Code
        //     eventTitle: event.eventTitle,
        //     eventDate: event.eventStartDate.toDateString(),
        //     primaryName: memberData?.primaryMemberId?.name,
        //     primaryEmail: memberData?.primaryMemberId?.email,
        //     primaryContact: memberData?.primaryMemberId?.mobileNumber,
        //     familyMembers: memberData.dependents.length > 0
        //         ? memberData.dependents.map(dep => ({ name: dep.userId.name }))
        //         : [],
        //     guests: memberData.guests.length > 0
        //         ? memberData.guests.map(guest => ({
        //             name: guest.name,
        //             email: guest.email,
        //             contact: guest.phone,
        //         }))
        //         : [],
        //     taxTypes: newBooking.ticketDetails.taxTypes.length > 0
        //         ? newBooking.ticketDetails.taxTypes.map(taxType => ({
        //             taxType: taxType.taxType || "N/A",
        //             taxRate: taxType.taxRate || 0,
        //             taxAmount: taxType.taxAmount || 0,
        //         }))
        //         : [],
        //     subtotal: newBooking.ticketDetails.subtotal.toFixed(2),
        //     taxAmount: newBooking.ticketDetails.taxAmount.toFixed(2),
        //     totalAmount: newBooking.ticketDetails.totalAmount.toFixed(2),
        // };

        // const emailTemplate = emailTemplates.eventBooking;
        // const htmlBody = eventrenderTemplate(emailTemplate.body, templateData);
        // const subject = eventrenderTemplate(emailTemplate.subject, templateData);

        // const emailDependentTemplate = emailTemplates.eventBookingDependentTemplate;
        // const htmlDependentBody = eventrenderTemplate(emailDependentTemplate.body, templateData);
        // const subjectDependent = eventrenderTemplate(emailDependentTemplate.subject, templateData);

        // await sendEmail(
        //     memberData.primaryMemberId.email,
        //     subject,
        //     htmlBody,
        //     // { ...htmlBody, uniqueQRCode: newBooking.allDetailsUniqueQRCode, },
        //     [
        //         {
        //             filename: "qrcode.png",
        //             // content: newBooking.primaryMemberQRCode.split(",")[1],
        //             content: Buffer.from(newBooking.primaryMemberQRCode.split(",")[1], "base64"), // Convert to Buffer
        //             encoding: "base64",
        //             cid: "qrCodeImage",
        //         },
        //     ]
        // );

        // // Send email to dependents
        // for (const dependent of preparedDependents || []) {
        //     const user = await User.findById(dependent.userId);
        //     if (user) {
        //         await sendEmail(user.email, subjectDependent,
        //             // { ...htmlDependentBody, uniqueQRCode: dependent.uniqueQRCode }
        //             htmlDependentBody
        //             , [
        //                 {
        //                     filename: "qrcode.png",
        //                     // content: dependent.qrCode.split(",")[1],
        //                     content: Buffer.from(dependent.qrCode.split(",")[1], "base64"), // Convert to Buffer
        //                     encoding: "base64",
        //                     cid: "qrCodeImage",
        //                 },
        //             ]);
        //     }
        // }

        // // Send email to guests
        // for (const guest of preparedGuests || []) {
        //     if (guest.email) {
        //         await sendEmail(guest.email, subjectDependent,
        //             //  { ...htmlDependentBody, uniqueQRCode: guest.uniqueQRCode }
        //             htmlDependentBody
        //             , [
        //                 {
        //                     filename: "qrcode.png",
        //                     // content: guest.qrCode.split(",")[1],
        //                     content: Buffer.from(guest.qrCode.split(",")[1], "base64"), // Convert to Buffer
        //                     encoding: "base64",
        //                     cid: "qrCodeImage",
        //                 },
        //             ]);
        //     }
        // }

        const templateData = {
            uniqueQRCode: newBooking.allDetailsUniqueQRCode,
            qrCode: allDetailsQRCode, // Base64 string for QR Code
            eventTitle: event.eventTitle,
            eventDate: event.eventStartDate.toDateString(),
            primaryName: memberData?.primaryMemberId?.name,
            primaryEmail: memberData?.primaryMemberId?.email,
            primaryContact: memberData?.primaryMemberId?.mobileNumber,
            familyMembers: memberData.dependents.length > 0
                ? memberData.dependents.map(dep => ({ name: dep.userId.name }))
                : [],
            guests: memberData.guests.length > 0
                ? memberData.guests.map(guest => ({
                    name: guest.name,
                    email: guest.email,
                    contact: guest.phone,
                }))
                : [],
            taxTypes: newBooking.ticketDetails.taxTypes.length > 0
                ? newBooking.ticketDetails.taxTypes.map(taxType => ({
                    taxType: taxType.taxType || "N/A",
                    taxRate: taxType.taxRate || 0,
                    taxAmount: taxType.taxAmount || 0,
                }))
                : [],
            subtotal: newBooking.ticketDetails.subtotal.toFixed(2),
            taxAmount: newBooking.ticketDetails.taxAmount.toFixed(2),
            totalAmount: newBooking.ticketDetails.totalAmount.toFixed(2),
        };

        const emailTemplate = emailTemplates.eventBooking;
        const htmlBody = eventrenderTemplate(emailTemplate.body, templateData);
        const subject = eventrenderTemplate(emailTemplate.subject, templateData);

        const emailDependentTemplate = emailTemplates.eventBookingDependentTemplate;
        const subjectDependent = eventrenderTemplate(emailDependentTemplate.subject, templateData);

        // Send email to primary member
        await sendEmail(
            memberData.primaryMemberId.email,
            subject,
            htmlBody,
            [
                {
                    filename: "qrcode.png",
                    content: Buffer.from(newBooking.primaryMemberQRCode.split(",")[1], "base64"), // Convert to Buffer
                    encoding: "base64",
                    cid: "qrCodeImage", // For inline embedding in email
                },
            ]
        );

        // Send emails to dependents
        for (const dependent of preparedDependents || []) {
            const user = await User.findById(dependent.userId);
            if (user) {
                // Generate a customized email body for the dependent
                const dependentTemplateData = {
                    ...templateData,
                    uniqueQRCode: dependent.uniqueQRCode, // Dependent's unique QR Code
                };
                const htmlDependentBody = eventrenderTemplate(emailDependentTemplate.body, dependentTemplateData);

                // Send email
                await sendEmail(
                    user.email,
                    subjectDependent,
                    htmlDependentBody,
                    [
                        {
                            filename: "qrcode.png",
                            content: Buffer.from(dependent.qrCode.split(",")[1], "base64"), // Convert to Buffer
                            encoding: "base64",
                            cid: "qrCodeImage",
                        },
                    ]
                );
            }
        }

        // Send emails to guests
        for (const guest of preparedGuests || []) {
            if (guest.email) {
                // Generate a customized email body for the guest
                const guestTemplateData = {
                    ...templateData,
                    uniqueQRCode: guest.uniqueQRCode, // Guest's unique QR Code
                };
                const htmlGuestBody = eventrenderTemplate(emailDependentTemplate.body, guestTemplateData);

                // Send email
                await sendEmail(
                    guest.email,
                    subjectDependent,
                    htmlGuestBody,
                    [
                        {
                            filename: "qrcode.png",
                            content: Buffer.from(guest.qrCode.split(",")[1], "base64"), // Convert to Buffer
                            encoding: "base64",
                            cid: "qrCodeImage",
                        },
                    ]
                );
            }
        }


        await addBilling(newBooking.primaryMemberId, 'Event', { eventBooking: newBooking._id }, newBooking.ticketDetails.subtotal, 0, newBooking.ticketDetails.taxAmount, newBooking.ticketDetails.totalAmount, newBooking.primaryMemberId)


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
        const { eventId, primaryMemberId, dependents, guests, primaryMemberChecked } = req.body;

        // Validate request data
        if (!eventId || !primaryMemberId) {
            return res.status(400).json({ message: 'Event ID and Primary Member ID are required.' });
        }

        // Fetch the event details
        const event = await Event.findById(eventId).populate("taxTypes");
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.status !== 'Active') {
            return res.status(400).json({ message: 'Event is not active or available for booking.' });
        }



        // Pricing calculations
        let primaryMemberCount = 0;
        if (primaryMemberChecked) {
            primaryMemberCount = 1; // Primary member is always 1
        }
        const dependentMemberCount = dependents ? dependents.length : 0;
        const guestMemberCount = guests ? guests.length : 0;

        const totalMemberCount = primaryMemberCount + dependentMemberCount + guestMemberCount;

        if (event.availableTickets <= totalMemberCount) {
            return res.status(400).json({ message: 'No tickets available for this event.' });
        }


        const subtotal =
            primaryMemberCount * event.primaryMemberPrice +
            dependentMemberCount * event.dependentMemberPrice +
            guestMemberCount * event.guestMemberPrice;

        // Calculate taxes based on taxTypes
        const taxDetails = event.taxTypes.map(taxType => {
            const taxAmount = (subtotal * taxType.percentage) / 100;
            return {
                taxType: taxType.name,
                taxRate: taxType.percentage,
                taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimal places
            };
        });

        const totalTaxAmount = taxDetails.reduce((acc, tax) => acc + tax.taxAmount, 0);
        const totalAmount = subtotal + totalTaxAmount;

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
                taxTypes: taxDetails,
                subtotal,
                taxAmount: totalTaxAmount,
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
        console.error('Error calculating booking details:', error);
        return res.status(500).json({
            message: 'An error occurred while calculating the event booking details.',
            error,
        });
    }
};



const getAllBookings = async (req, res) => {
    try {

        const { filterType, customStartDate, customEndDate, bookingStatus, userId } = req.query;

        let filter = { isDeleted: false, deletedAt: null };

        // Add paymentStatus to filter if provided
        if (bookingStatus) {
            filter.bookingStatus = bookingStatus;
        }
        if (userId) {
            filter.primaryMemberId = userId;
        }

        // Handle date filters
        if (filterType) {
            const today = moment().startOf('day');

            switch (filterType) {
                case 'today':
                    filter.createdAt = { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() };
                    break;
                case 'last7days':
                    filter.createdAt = { $gte: moment(today).subtract(7, 'days').toDate(), $lt: today.toDate() };
                    break;
                case 'last30days':
                    filter.createdAt = { $gte: moment(today).subtract(30, 'days').toDate(), $lt: today.toDate() };
                    break;
                case 'last3months':
                    filter.createdAt = { $gte: moment(today).subtract(3, 'months').toDate(), $lt: today.toDate() };
                    break;
                case 'last6months':
                    filter.createdAt = { $gte: moment(today).subtract(6, 'months').toDate(), $lt: today.toDate() };
                    break;
                case 'last1year':
                    filter.createdAt = { $gte: moment(today).subtract(1, 'year').toDate(), $lt: today.toDate() };
                    break;
                case 'custom':
                    if (!customStartDate || !customEndDate) {
                        return res.status(400).json({ message: 'Custom date range requires both start and end dates.' });
                    }
                    filter.createdAt = {
                        $gte: moment(customStartDate, 'YYYY-MM-DD').startOf('day').toDate(),
                        $lt: moment(customEndDate, 'YYYY-MM-DD').endOf('day').toDate(),
                    };
                    break;
                default:
                    break; // No filter applied if no valid filterType
            }
        }

        // const bookings = await EventBooking.find({ isDeleted: false, deletedAt: null })
        const bookings = await EventBooking.find(filter)
            .populate("eventId")
            .populate("primaryMemberId");
        const reversedata = bookings.reverse()
        return res.status(200).json({ message: 'Bookings fetched successfully', bookings: reversedata });
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
            _id: booking._id,
            ticketDetails: booking.ticketDetails,
            memberDetails: [], // Array to hold all members (primary, dependents, and guests)
            allDetailsUniqueQRCode: booking.allDetailsUniqueQRCode, // QR code for all details
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
            uniqueQRCode: booking.uniqueQRCode, // Primary member QR code
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
                uniqueQRCode: dep.uniqueQRCode, // Dependent QR code
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
                uniqueQRCode: guest.uniqueQRCode, // Guest QR code
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

const updateBookingStatusAndPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params; // Booking ID from URL parameter
        const updateData = req.body; // The entire body contains the fields to be updated

        // Validate that at least one field is provided in the request body
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'At least one field is required to update.' });
        }

        // Validate the values of fields in the request body
        const validBookingStatuses = ['Confirmed', 'Cancelled'];
        const validPaymentStatuses = ['Pending', 'Completed', 'Failed'];

        if (updateData.bookingStatus && !validBookingStatuses.includes(updateData.bookingStatus)) {
            return res.status(400).json({ message: 'Invalid bookingStatus value.' });
        }

        if (updateData.paymentStatus && !validPaymentStatuses.includes(updateData.paymentStatus)) {
            return res.status(400).json({ message: 'Invalid paymentStatus value.' });
        }

        // Find the event booking by bookingId
        const booking = await EventBooking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Update the booking with only the fields provided in the request body
        const updatedBooking = await EventBooking.findByIdAndUpdate(
            bookingId,
            { $set: updateData },  // Only update the fields present in updateData
            { new: true } // Return the updated document
        );

        return res.status(200).json({
            message: 'Booking updated successfully.',
            updatedBooking
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({ message: 'An error occurred while updating the booking.', error });
    }
};


const getBookingDetails = async (req, res) => {
    try {
        const { userId } = req.user;
        // Find all bookings for the member, ensuring they are not deleted, and sorted by createdAt in descending order
        const bookings = await EventBooking.find({ primaryMemberId: userId, isDeleted: false, deletedAt: null })
            .populate("eventId")
            .populate("primaryMemberId")
            .populate("dependents.userId") // Populate dependents
            .sort({ createdAt: -1 }); // Sort by createdAt in descending order

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found or all bookings have been deleted' });
        }

        // Format the booking details for each booking
        const formattedBookings = bookings.map(booking => {
            const formattedBooking = {
                _id: booking._id,
                ticketDetails: booking.ticketDetails,
                memberDetails: [], // Array to hold all members (primary, dependents, and guests)
                allDetailsUniqueQRCode: booking.allDetailsUniqueQRCode, // QR code for all details
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
                uniqueQRCode: booking.uniqueQRCode, // Primary member QR code
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
                    uniqueQRCode: dep.uniqueQRCode, // Dependent QR code
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
                    uniqueQRCode: guest.uniqueQRCode, // Guest QR code
                    qrCode: guest.qrCode, // Guest QR code
                });
            });

            return formattedBooking;
        });

        // Return the response with formatted bookings
        return res.status(200).json({
            message: 'Bookings fetched successfully',
            bookings: formattedBookings,
        });

    } catch (error) {
        console.error('Error Getting bookings:', error);
        return res.status(500).json({ message: 'An error occurred while getting the bookings.', error });
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
    getBookingDetailsById,
    updateBookingStatusAndPaymentStatus,
    getBookingDetails
}