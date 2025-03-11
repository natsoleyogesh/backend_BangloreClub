// const 
const Event = require('../models/event');
const User = require("../models/user");
const Admin = require("../models/Admin");
const EventBooking = require('../models/eventBooking');
const QRCodeHelper = require('../utils/helper');
const { addBilling } = require('./billingController');
const sendEmail = require('../utils/sendMail');
const emailTemplates = require('../utils/emailTemplates');
const { eventrenderTemplate, eventrenderDependentTemplate } = require('../utils/templateRenderer');
const { toTitleCase } = require('../utils/common');
const { default: mongoose } = require('mongoose');
const { createAttendanceRecords } = require('./eventAttendanceController');
const moment = require('moment');
const Department = require('../models/department');
const { createNotification } = require('../utils/pushNotification');
const { sendSMSViaPOST } = require('../utils/sendOtp');
const EventAttendance = require('../models/eventAttendanceSchema ');
const Billing = require('../models/billings');

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
            primaryMemberPrice,
            dependentMemberPrice,
            guestMemberPrice,
            kidsMemberPrice,
            spouseMemberPrice,
            seniorDependentMemberPrice,
            allottedTicketsMember,
            allottedTicketsGuest,
            rsvpStatus,
            location,
            aboutEvent,
            organizer,
            taxTypes,
            showBanner,
            bookingPermissionPrimary,
            bookingPermissionSpouse,
            // bookingPermissionSon,
            // bookingPermissionDaughter,
            bookingPermissionChild,
            bookingPermissionDependent,
            bookingPermissionSeniorDependent,
            guideline,
            showInApp,
            showInGatekeeper
        } = req.body;

        // Check if the required image file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Event Banner Image is Required!' });
        }

        // Normalize event title
        const normalizedTitle = toTitleCase(eventTitle);

        // Check if the event already exists
        const existingEvent = await Event.findOne({ eventTitle: normalizedTitle, isDeleted: false });
        if (existingEvent) {
            return res.status(400).json({ message: 'Event with the same title already exists.' });
        }

        const eventImage = `/uploads/event/${req.file.filename}`;

        // Get current date and time for validation
        const currentDateTime = new Date();
        const eventStartDateTime = new Date(eventStartDate);
        const eventEndDateTime = new Date(eventEndDate);

        // Parse startTime and endTime into hours and minutes
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        // Create Date objects with times included
        const eventStartDateTimeWithTime = new Date(eventStartDateTime.setHours(startHour, startMinute));
        const eventEndDateTimeWithTime = new Date(eventEndDateTime.setHours(endHour, endMinute));

        // Validation 1: Event start date must not be in the past
        if (eventStartDateTime < currentDateTime.setHours(0, 0, 0, 0)) {
            return res.status(400).json({ message: 'Event start date must be today or a future date.' });
        }

        // Validation 2: If the event starts today, ensure the start time is in the future
        if (eventStartDateTime.toDateString() === currentDateTime.toDateString() &&
            eventStartDateTimeWithTime <= currentDateTime) {
            return res.status(400).json({
                message: 'Event start time must be later than the current time if the event starts today.',
            });
        }

        // Validation 3: Event end date must be after the start date
        if (eventEndDateTime < eventStartDateTime) {
            return res.status(400).json({ message: 'Event end date must be after the start date.' });
        }

        // Validation 4: Event end time must be after start time if they are on the same day
        if (eventStartDateTime.toDateString() === eventEndDateTime.toDateString() &&
            eventEndDateTimeWithTime <= eventStartDateTimeWithTime) {
            return res.status(400).json({ message: 'Event end time must be after the start time.' });
        }

        // Calculate totalAvailableTickets
        const totalAvailableTickets = allottedTicketsMember + allottedTicketsGuest;
        const totalAvailableTicketCounts = allottedTicketsMember + allottedTicketsGuest;
        // Parse and validate tax types
        const parsedTaxTypes = Array.isArray(taxTypes)
            ? taxTypes
            : typeof taxTypes === 'string'
                ? JSON.parse(taxTypes)
                : [];

        // Create a new event
        const newEvent = new Event({
            eventTitle: normalizedTitle,
            eventSubtitle,
            eventStartDate,
            eventEndDate,
            startTime,
            endTime,
            ticketPrice,
            primaryMemberPrice,
            dependentMemberPrice,
            guestMemberPrice,
            kidsMemberPrice,
            spouseMemberPrice,
            seniorDependentMemberPrice,
            allottedTicketsMember,
            allottedTicketsGuest,
            totalAvailableTickets,
            totalAvailableTicketCounts,
            rsvpStatus,
            eventImage,
            location,
            aboutEvent,
            organizer,
            taxTypes: parsedTaxTypes,
            showBanner: showBanner || false,
            bookingPermissionPrimary: bookingPermissionPrimary || true,
            bookingPermissionSpouse: bookingPermissionSpouse || false,
            // bookingPermissionSon: bookingPermissionSon || false,
            // bookingPermissionDaughter: bookingPermissionDaughter || false,
            bookingPermissionChild: bookingPermissionChild || false,
            bookingPermissionDependent: bookingPermissionDependent || false,
            bookingPermissionSeniorDependent: bookingPermissionSeniorDependent || false,
            guideline,
            showInApp: showInApp || true,
            showInGatekeeper: showInGatekeeper || false
        });

        // Save the new event to the database
        const savedEvent = await newEvent.save();

        // Call the createNotification function
        await createNotification({
            title: `Event - ${savedEvent.eventTitle} Is Scheduled`,
            send_to: "All",
            push_message: `The ${savedEvent.eventTitle} Is Scheduled On ${savedEvent.eventStartDate} To ${savedEvent.eventEndDate} In ${savedEvent.location}`,
            department: "Event",
            image: eventImage, // Assign the value directly
        });


        res.status(201).json({
            message: 'Event created successfully.',
            event: savedEvent,
        });
    } catch (error) {
        console.error('Error creating event:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// const createEvent = async (req, res) => {
//     try {
//         const {
//             eventTitle,
//             eventSubtitle,
//             eventStartDate,
//             eventEndDate,
//             startTime,
//             endTime,
//             ticketPrice,
//             memberPrices,
//             allottedTicketsMember,
//             allottedTicketsGuest,
//             rsvpStatus,
//             location,
//             aboutEvent,
//             organizer,
//             showBanner,
//             bookingPermissionPrimary,
//             bookingPermissionSpouse,
//             bookingPermissionSon,
//             bookingPermissionDaughter,
//             bookingPermissionDependent,
//             bookingPermissionSeniorDependent,
//         } = req.body;

//         // Check if the required image file is uploaded
//         if (!req.file) {
//             return res.status(400).json({ message: 'Event Banner Image is Required!' });
//         }

//         // Normalize event title
//         const normalizedTitle = eventTitle
//             .toLowerCase()
//             .split(' ')
//             .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(' ');

//         // Check if the event already exists
//         const existingEvent = await Event.findOne({ eventTitle: normalizedTitle, isDeleted: false });
//         if (existingEvent) {
//             return res.status(400).json({ message: 'Event with the same title already exists.' });
//         }

//         const eventImage = `/uploads/event/${req.file.filename}`;

//         // Get current date and time for validation
//         const currentDateTime = new Date();
//         const eventStartDateTime = new Date(eventStartDate);
//         const eventEndDateTime = new Date(eventEndDate);

//         // Parse startTime and endTime into hours and minutes
//         const [startHour, startMinute] = startTime.split(':').map(Number);
//         const [endHour, endMinute] = endTime.split(':').map(Number);

//         // Create Date objects with times included
//         const eventStartDateTimeWithTime = new Date(eventStartDateTime.setHours(startHour, startMinute));
//         const eventEndDateTimeWithTime = new Date(eventEndDateTime.setHours(endHour, endMinute));

//         // Validation 1: Event start date must not be in the past
//         if (eventStartDateTime < currentDateTime.setHours(0, 0, 0, 0)) {
//             return res.status(400).json({ message: 'Event start date must be today or a future date.' });
//         }

//         // Validation 2: If the event starts today, ensure the start time is in the future
//         if (
//             eventStartDateTime.toDateString() === currentDateTime.toDateString() &&
//             eventStartDateTimeWithTime <= currentDateTime
//         ) {
//             return res.status(400).json({
//                 message: 'Event start time must be later than the current time if the event starts today.',
//             });
//         }

//         // Validation 3: Event end date must be after the start date
//         if (eventEndDateTime < eventStartDateTime) {
//             return res.status(400).json({ message: 'Event end date must be after the start date.' });
//         }

//         // Validation 4: Event end time must be after start time if they are on the same day
//         if (
//             eventStartDateTime.toDateString() === eventEndDateTime.toDateString() &&
//             eventEndDateTimeWithTime <= eventStartDateTimeWithTime
//         ) {
//             return res.status(400).json({ message: 'Event end time must be after the start time.' });
//         }

//         // Calculate totalAvailableTickets
//         const totalAvailableTickets = (allottedTicketsMember || 0) + (allottedTicketsGuest || 0);

//         // Parse memberPrices for tax types
//         const parsedMemberPrices = {};
//         for (const key in memberPrices) {
//             parsedMemberPrices[key] = {
//                 price: memberPrices[key]?.price || 0,
//                 taxTypes: Array.isArray(memberPrices[key]?.taxTypes)
//                     ? memberPrices[key].taxTypes
//                     : typeof memberPrices[key]?.taxTypes === 'string'
//                         ? JSON.parse(memberPrices[key].taxTypes)
//                         : [],
//             };
//         }

//         // Create a new event
//         const newEvent = new Event({
//             eventTitle: normalizedTitle,
//             eventSubtitle,
//             eventStartDate,
//             eventEndDate,
//             startTime,
//             endTime,
//             ticketPrice,
//             memberPrices: parsedMemberPrices,
//             allottedTicketsMember,
//             allottedTicketsGuest,
//             totalAvailableTickets,
//             rsvpStatus,
//             eventImage,
//             location,
//             aboutEvent,
//             organizer,
//             showBanner: showBanner || false,
//             bookingPermissionPrimary: bookingPermissionPrimary || true,
//             bookingPermissionSpouse: bookingPermissionSpouse || false,
//             bookingPermissionSon: bookingPermissionSon || false,
//             bookingPermissionDaughter: bookingPermissionDaughter || false,
//             bookingPermissionDependent: bookingPermissionDependent || false,
//             bookingPermissionSeniorDependent: bookingPermissionSeniorDependent || false,
//         });

//         // Save the new event to the database
//         const savedEvent = await newEvent.save();

//         res.status(201).json({
//             message: 'Event created successfully.',
//             event: savedEvent,
//         });
//     } catch (error) {
//         console.error('Error creating event:', error.message);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// };

//-------------------------------------------------------------------------------------

// const getAllEventsList = async (req, res) => {
//     try {
//         const { isAdmin } = req.query;

//         // Get the current date and time
//         const currentDateTime = new Date();

//         // Determine the query for events based on admin or non-admin access
//         let query = { isDeleted: false };

//         if (isAdmin === 'true') {
//             // Admin access: Fetch all non-deleted events without filtering by date
//             query = { isDeleted: false, };
//         } else {
//             // Non-admin access: Fetch only non-expired events
//             query = {
//                 isDeleted: false,
//                 showInApp: true,
//                 $or: [
//                     // Future or ongoing events
//                     { eventEndDate: { $gte: currentDateTime.toISOString().split('T')[0] } },
//                     // Events ending today but still ongoing based on time
//                     {
//                         $and: [
//                             { eventEndDate: currentDateTime.toISOString().split('T')[0] },
//                             { endTime: { $gt: currentDateTime.toTimeString().split(' ')[0] } },
//                         ],
//                     },
//                 ],
//             };
//         }

//         // Fetch events and populate the taxTypes field
//         const events = await Event.find(query).populate("taxTypes");

//         // Reverse events to show the latest first
//         const allEvents = events.reverse();

//         // Return the fetched events
//         return res.status(200).json({
//             message: 'Events fetched successfully.',
//             allEvents,
//         });
//     } catch (error) {
//         console.error('Error fetching events:', error);
//         return res.status(500).json({ message: 'Internal server error.' });
//     }
// };

// const getAllEvents = async (req, res) => {
//     try {
//         let { isAdmin, page, limit } = req.query;

//         // Convert pagination parameters
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         const skip = (page - 1) * limit;

//         // Get the current date and time
//         const currentDateTime = new Date();

//         // Determine the query for events based on admin or non-admin access
//         let query = { isDeleted: false };

//         if (isAdmin === "true") {
//             // Admin access: Fetch all non-deleted events without filtering by date
//             query = { isDeleted: false };
//         } else {
//             // Non-admin access: Fetch only non-expired events
//             query = {
//                 isDeleted: false,
//                 showInApp: true,
//                 $or: [
//                     // Future or ongoing events
//                     { eventEndDate: { $gte: currentDateTime.toISOString().split("T")[0] } },
//                     // Events ending today but still ongoing based on time
//                     {
//                         $and: [
//                             { eventEndDate: currentDateTime.toISOString().split("T")[0] },
//                             { endTime: { $gt: currentDateTime.toTimeString().split(" ")[0] } },
//                         ],
//                     },
//                 ],
//             };
//         }

//         // Get total count of matching events
//         const totalEvents = await Event.countDocuments(query);
//         const totalPages = Math.ceil(totalEvents / limit);

//         // Fetch paginated events and populate taxTypes field
//         const events = await Event.find(query)
//             .populate("taxTypes")
//             .sort({ createdAt: -1 }) // Sort by latest first
//             .skip(skip)
//             .limit(limit);

//         // Return the fetched events with pagination
//         return res.status(200).json({
//             message: "Events fetched successfully.",
//             events,
//             pagination: {
//                 currentPage: page,
//                 totalPages,
//                 totalEvents,
//                 pageSize: limit,
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching events:", error);
//         return res.status(500).json({ message: "Internal server error.", error: error.message });
//     }
// };

// const getEventsQuery = ({ isAdmin, gateKeeper }) => {
//     const currentDateTime = new Date();

//     if (isAdmin === "true") {
//         return { isDeleted: false }; // Admin fetches all non-deleted events
//     }
//     else if (isAdmin === "false" && gateKeeper === "true") {
//         return {
//             isDeleted: false,
//             showInGatekeeper: true,
//             $or: [
//                 { eventEndDate: { $gte: currentDateTime.toISOString().split("T")[0] } },
//                 {
//                     $and: [
//                         { eventEndDate: currentDateTime.toISOString().split("T")[0] },
//                         { endTime: { $gt: currentDateTime.toTimeString().split(" ")[0] } },
//                     ],
//                 },
//             ],
//         };
//     } else {
//         return {
//             isDeleted: false,
//             showInApp: true,
//             $or: [
//                 { eventEndDate: { $gte: currentDateTime.toISOString().split("T")[0] } },
//                 {
//                     $and: [
//                         { eventEndDate: currentDateTime.toISOString().split("T")[0] },
//                         { endTime: { $gt: currentDateTime.toTimeString().split(" ")[0] } },
//                     ],
//                 },
//             ],
//         };
//     }
// };
const getEventsQuery = ({ isAdmin, gateKeeper }) => {
    const currentDateTime = new Date();
    const currentDate = currentDateTime.toISOString().split("T")[0];  // YYYY-MM-DD
    const currentTime = currentDateTime.toTimeString().split(" ")[0]; // HH:MM:SS

    const commonConditions = {
        isDeleted: false,
        $or: [
            { eventEndDate: { $gte: currentDate } },
            {
                $and: [
                    { eventEndDate: currentDate },
                    { endTime: { $gt: currentTime } },
                ],
            },
        ],
    };

    if (isAdmin === "true") {
        return commonConditions; // Admin fetches all non-deleted events
    }
    else if (isAdmin === "false" && gateKeeper === "true") {
        return {
            ...commonConditions,
            showInGatekeeper: true,
        };
    } else {
        return {
            ...commonConditions,
            showInApp: true,
        };
    }
};


/**
 * Get all events list (without pagination)
 */
const getAllEventsList = async (req, res) => {
    try {
        const { isAdmin, gateKeeper } = req.query;
        const query = getEventsQuery({ isAdmin, gateKeeper });

        // Fetch events and populate taxTypes
        const events = await Event.find(query).populate("taxTypes").sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Events fetched successfully.",
            allEvents: events,
        });
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

/**
 * Get paginated events
 */
const getAllEvents = async (req, res) => {
    try {
        let { isAdmin, page, limit } = req.query;

        // Convert pagination parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        const query = getEventsQuery({ isAdmin });

        // Get total count of matching events
        const totalEvents = await Event.countDocuments(query);
        const totalPages = Math.ceil(totalEvents / limit);

        // Fetch paginated events
        const events = await Event.find(query)
            .populate("taxTypes")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            message: "Events fetched successfully.",
            events,
            pagination: {
                currentPage: page,
                totalPages,
                totalEvents,
                pageSize: limit,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};


//--------------------------------------------------------------

// const getAllEvents = async (req, res) => {
//     try {
//         const { isAdmin } = req.query;

//         // Get the current date and time
//         const currentDateTime = new Date();

//         // Determine the query for events based on admin or non-admin access
//         let query = { isDeleted: false };

//         if (isAdmin === 'true') {
//             // Admin access: Fetch all non-deleted events without filtering by date
//             query = { isDeleted: false };
//         } else {
//             // Non-admin access: Fetch only non-expired events
//             query = {
//                 isDeleted: false,
//                 $or: [
//                     // Future or ongoing events
//                     { eventEndDate: { $gte: currentDateTime.toISOString().split('T')[0] } },
//                     // Events ending today but still ongoing based on time
//                     {
//                         $and: [
//                             { eventEndDate: currentDateTime.toISOString().split('T')[0] },
//                             { endTime: { $gt: currentDateTime.toTimeString().split(' ')[0] } },
//                         ],
//                     },
//                 ],
//             };
//         }

//         // Fetch events and populate the nested taxTypes fields for each member price
//         const events = await Event.find(query)
//             .populate('memberPrices.primaryMemberPrice.taxTypes')
//             .populate('memberPrices.dependentMemberPrice.taxTypes')
//             .populate('memberPrices.guestMemberPrice.taxTypes')
//             .populate('memberPrices.kidsMemberPrice.taxTypes')
//             .populate('memberPrices.spouseMemberPrice.taxTypes')
//             .populate('memberPrices.seniorDependentMemberPrice.taxTypes');

//         // Reverse events to show the latest first
//         const allEvents = events.reverse();

//         // Return the fetched events
//         return res.status(200).json({
//             message: 'Events fetched successfully.',
//             allEvents,
//         });
//     } catch (error) {
//         console.error('Error fetching events:', error);
//         return res.status(500).json({ message: 'Internal server error.' });
//     }
// };


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
            primaryMemberPrice,
            dependentMemberPrice,
            guestMemberPrice,
            kidsMemberPrice,
            spouseMemberPrice,
            seniorDependentMemberPrice,
            allottedTicketsMember,
            allottedTicketsGuest,
            rsvpStatus,
            location,
            aboutEvent,
            organizer,
            status,
            taxTypes,
            showBanner,
            bookingPermissionPrimary,
            bookingPermissionSpouse,
            bookingPermissionChild,
            // bookingPermissionSon,
            // bookingPermissionDaughter,
            bookingPermissionDependent,
            bookingPermissionSeniorDependent,
            guideline,
            showInApp,
            showInGatekeeper
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

        // Calculate totalAvailableTickets if ticket numbers are provided
        const totalAvailableTickets =
            (allottedTicketsMember !== undefined ? parseInt(allottedTicketsMember) : existingEvent.allottedTicketsMember) +
            (allottedTicketsGuest !== undefined ? parseInt(allottedTicketsGuest) : existingEvent.allottedTicketsGuest);

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

        // Update the event fields only if they are provided in the request
        const updateData = {
            eventTitle: normalizedTitle || existingEvent.eventTitle,
            eventSubtitle: eventSubtitle || existingEvent.eventSubtitle,
            eventStartDate: updatedEventStartDate || existingEvent.eventStartDate,
            eventEndDate: updatedEventEndDate || existingEvent.eventEndDate,
            startTime: startTime || existingEvent.startTime,
            endTime: endTime || existingEvent.endTime,
            ticketPrice: ticketPrice || existingEvent.ticketPrice,
            primaryMemberPrice: primaryMemberPrice || existingEvent.primaryMemberPrice,
            dependentMemberPrice: dependentMemberPrice || existingEvent.dependentMemberPrice,
            guestMemberPrice: guestMemberPrice || existingEvent.guestMemberPrice,
            kidsMemberPrice: kidsMemberPrice || existingEvent.kidsMemberPrice,
            spouseMemberPrice: spouseMemberPrice || existingEvent.spouseMemberPrice,
            seniorDependentMemberPrice: seniorDependentMemberPrice || existingEvent.seniorDependentMemberPrice,
            allottedTicketsMember: allottedTicketsMember || existingEvent.allottedTicketsMember,
            allottedTicketsGuest: allottedTicketsGuest || existingEvent.allottedTicketsGuest,
            totalAvailableTickets: totalAvailableTickets,
            totalAvailableTicketCounts: totalAvailableTickets,
            rsvpStatus: rsvpStatus || existingEvent.rsvpStatus,
            eventImage: eventImage,
            location: location || existingEvent.location,
            aboutEvent: aboutEvent || existingEvent.aboutEvent,
            guideline: guideline || existingEvent.guideline,
            organizer: organizer || existingEvent.organizer,
            status: status || existingEvent.status,
            taxTypes: parsedTaxTypes || existingEvent.taxTypes,
            showBanner: showBanner !== undefined ? showBanner : existingEvent.showBanner,
            bookingPermissionPrimary:
                bookingPermissionPrimary !== undefined ? bookingPermissionPrimary : existingEvent.bookingPermissionPrimary,
            bookingPermissionSpouse:
                bookingPermissionSpouse !== undefined ? bookingPermissionSpouse : existingEvent.bookingPermissionSpouse,
            bookingPermissionChild:
                bookingPermissionChild !== undefined ? bookingPermissionChild : existingEvent.bookingPermissionChild,
            // bookingPermissionSon:
            //     bookingPermissionSon !== undefined ? bookingPermissionSon : existingEvent.bookingPermissionSon,
            // bookingPermissionDaughter:
            //     bookingPermissionDaughter !== undefined ? bookingPermissionDaughter : existingEvent.bookingPermissionDaughter,
            bookingPermissionSeniorDependent:
                bookingPermissionSeniorDependent !== undefined
                    ? bookingPermissionSeniorDependent
                    : existingEvent.bookingPermissionSeniorDependent,
            bookingPermissionDependent:
                bookingPermissionDependent !== undefined
                    ? bookingPermissionDependent
                    : existingEvent.bookingPermissionDependent,
            showInApp:
                showInApp !== undefined
                    ? showInApp
                    : existingEvent.showInApp,
            showInGatekeeper:
                showInGatekeeper !== undefined
                    ? showInGatekeeper
                    : existingEvent.showInGatekeeper,
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


// const getEventById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { operation } = req.query;

//         // Validate event ID
//         if (!id) {
//             return res.status(400).json({ message: 'Please provide the Event ID.' });
//         }

//         // Create a query to find the event by ID
//         const query = Event.findById(id);

//         // If operation is not 'edit', populate the nested taxTypes fields
//         if (operation !== 'edit') {
//             query
//                 .populate('memberPrices.primaryMemberPrice.taxTypes')
//                 .populate('memberPrices.dependentMemberPrice.taxTypes')
//                 .populate('memberPrices.guestMemberPrice.taxTypes')
//                 .populate('memberPrices.kidsMemberPrice.taxTypes')
//                 .populate('memberPrices.spouseMemberPrice.taxTypes')
//                 .populate('memberPrices.seniorDependentMemberPrice.taxTypes');
//         }

//         const event = await query;

//         // Check if event exists and is not deleted
//         if (!event || event.isDeleted) {
//             return res.status(404).json({ message: 'Event not found.' });
//         }

//         // Respond with the event details
//         res.status(200).json({
//             message: 'Event fetched successfully.',
//             event,
//         });
//     } catch (error) {
//         console.error('Error fetching event:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// };



// const updateEvent = async (req, res) => {
//     try {
//         const { id } = req.params;
//         let {
//             eventTitle,
//             eventSubtitle,
//             eventStartDate,
//             eventEndDate,
//             startTime,
//             endTime,
//             ticketPrice,
//             memberPrices,
//             allottedTicketsMember,
//             allottedTicketsGuest,
//             rsvpStatus,
//             location,
//             aboutEvent,
//             organizer,
//             status,
//             showBanner,
//             bookingPermissionPrimary,
//             bookingPermissionSpouse,
//             bookingPermissionSon,
//             bookingPermissionDaughter,
//             bookingPermissionDependent,
//             bookingPermissionSeniorDependent,
//         } = req.body;

//         // Find the existing event
//         const existingEvent = await Event.findById(id);

//         if (!existingEvent) {
//             return res.status(404).json({ message: 'Event not found.' });
//         }

//         let normalizedTitle;
//         if (eventTitle) {
//             normalizedTitle = eventTitle
//                 .toLowerCase()
//                 .split(' ')
//                 .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//                 .join(' ');

//             const duplicateEvent = await Event.findOne({
//                 eventTitle: normalizedTitle,
//                 _id: { $ne: id }, // Exclude the current event by ID
//             });

//             if (duplicateEvent) {
//                 return res.status(400).json({ message: 'An event with this title already exists.' });
//             }
//         }

//         // Get the current date and time
//         const currentDateTime = new Date();

//         // Validate eventStartDate and eventEndDate if provided
//         let updatedEventStartDate = existingEvent.eventStartDate;
//         let updatedEventEndDate = existingEvent.eventEndDate;

//         if (eventStartDate) {
//             updatedEventStartDate = new Date(eventStartDate);

//             // Check if the provided start date is in the past
//             if (updatedEventStartDate < currentDateTime.setHours(0, 0, 0, 0)) {
//                 return res.status(400).json({
//                     message: 'Event start date cannot be in the past.',
//                 });
//             }
//         }

//         if (eventEndDate) {
//             updatedEventEndDate = new Date(eventEndDate);

//             // Check if the end date is before the start date
//             if (updatedEventEndDate < updatedEventStartDate) {
//                 return res.status(400).json({
//                     message: 'Event end date must be after the start date.',
//                 });
//             }
//         }

//         let eventStartTime, eventEndTime;

//         // Validate startTime and endTime if provided
//         if (updatedEventStartDate || startTime || endTime) {
//             const eventStartDateTime = updatedEventStartDate || existingEvent.eventStartDate;
//             const [startHour, startMinute] = (startTime || existingEvent.startTime).split(':').map(Number);
//             const [endHour, endMinute] = (endTime || existingEvent.endTime).split(':').map(Number);

//             // Create Date objects for startTime and endTime
//             eventStartTime = new Date(eventStartDateTime);
//             eventStartTime.setHours(startHour, startMinute);

//             eventEndTime = new Date(updatedEventEndDate || eventStartDateTime);
//             eventEndTime.setHours(endHour, endMinute);

//             // If the event starts today, validate start time against the current time
//             if (eventStartDateTime.toDateString() === currentDateTime.toDateString()) {
//                 if (eventStartTime <= currentDateTime) {
//                     return res.status(400).json({
//                         message: 'Event start time must be later than the current time if the event starts today.',
//                     });
//                 }
//             }

//             // Check if end time is after start time
//             if (eventEndTime <= eventStartTime) {
//                 return res.status(400).json({
//                     message: 'Event end time must be after the start time.',
//                 });
//             }
//         }

//         // Calculate totalAvailableTickets if ticket numbers are provided
//         const totalAvailableTickets =
//             (allottedTicketsMember !== undefined ? parseInt(allottedTicketsMember) : existingEvent.allottedTicketsMember) +
//             (allottedTicketsGuest !== undefined ? parseInt(allottedTicketsGuest) : existingEvent.allottedTicketsGuest);

//         // Parse memberPrices
//         const parsedMemberPrices = {};
//         if (memberPrices) {
//             for (const key in memberPrices) {
//                 parsedMemberPrices[key] = {
//                     price: memberPrices[key]?.price || existingEvent.memberPrices[key]?.price || 0,
//                     taxTypes: Array.isArray(memberPrices[key]?.taxTypes)
//                         ? memberPrices[key].taxTypes
//                         : existingEvent.memberPrices[key]?.taxTypes || [],
//                 };
//             }
//         }

//         // // Handle bookingPermissions individually if provided
//         // const updatedBookingPermissions = {
//         //     primary: bookingPermissions?.primary !== undefined ? bookingPermissions.primary : existingEvent.bookingPermissions?.primary,
//         //     spouse: bookingPermissions?.spouse !== undefined ? bookingPermissions.spouse : existingEvent.bookingPermissions?.spouse,
//         //     son: bookingPermissions?.son !== undefined ? bookingPermissions.son : existingEvent.bookingPermissions?.son,
//         //     daughter: bookingPermissions?.daughter !== undefined ? bookingPermissions.daughter : existingEvent.bookingPermissions?.daughter,
//         //     dependent: bookingPermissions?.dependent !== undefined ? bookingPermissions.dependent : existingEvent.bookingPermissions?.dependent,
//         //     seniorDependent: bookingPermissions?.seniorDependent !== undefined ? bookingPermissions.seniorDependent : existingEvent.bookingPermissions?.seniorDependent,
//         // };

//         // Handle image upload if a new file is provided
//         const eventImage = req.file ? `/uploads/event/${req.file.filename}` : existingEvent.eventImage;

//         // Update the event fields only if they are provided in the request
//         const updateData = {
//             eventTitle: normalizedTitle || existingEvent.eventTitle,
//             eventSubtitle: eventSubtitle || existingEvent.eventSubtitle,
//             eventStartDate: updatedEventStartDate || existingEvent.eventStartDate,
//             eventEndDate: updatedEventEndDate || existingEvent.eventEndDate,
//             startTime: startTime || existingEvent.startTime,
//             endTime: endTime || existingEvent.endTime,
//             ticketPrice: ticketPrice || existingEvent.ticketPrice,
//             memberPrices: Object.keys(parsedMemberPrices).length > 0 ? parsedMemberPrices : existingEvent.memberPrices,
//             allottedTicketsMember: allottedTicketsMember || existingEvent.allottedTicketsMember,
//             allottedTicketsGuest: allottedTicketsGuest || existingEvent.allottedTicketsGuest,
//             totalAvailableTickets: totalAvailableTickets,
//             rsvpStatus: rsvpStatus || existingEvent.rsvpStatus,
//             eventImage: eventImage,
//             location: location || existingEvent.location,
//             aboutEvent: aboutEvent || existingEvent.aboutEvent,
//             organizer: organizer || existingEvent.organizer,
//             status: status || existingEvent.status,
//             showBanner: showBanner !== undefined ? showBanner : existingEvent.showBanner,
//             bookingPermissionPrimary:
//                 bookingPermissionPrimary !== undefined ? bookingPermissionPrimary : existingEvent.bookingPermissionPrimary,
//             bookingPermissionSpouse:
//                 bookingPermissionSpouse !== undefined ? bookingPermissionSpouse : existingEvent.bookingPermissionSpouse,
//             bookingPermissionSon:
//                 bookingPermissionSon !== undefined ? bookingPermissionSon : existingEvent.bookingPermissionSon,
//             bookingPermissionDaughter:
//                 bookingPermissionDaughter !== undefined ? bookingPermissionDaughter : existingEvent.bookingPermissionDaughter,
//             bookingPermissionSeniorDependent:
//                 bookingPermissionSeniorDependent !== undefined
//                     ? bookingPermissionSeniorDependent
//                     : existingEvent.bookingPermissionSeniorDependent,
//             bookingPermissionDependent:
//                 bookingPermissionDependent !== undefined
//                     ? bookingPermissionDependent
//                     : existingEvent.bookingPermissionDependent,
//         };

//         // Update the event using findByIdAndUpdate
//         const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
//             new: true,
//             runValidators: true,
//         });

//         if (!updatedEvent) {
//             return res.status(404).json({ message: 'Event not found.' });
//         }

//         res.status(200).json({
//             message: 'Event updated successfully.',
//             event: updatedEvent,
//         });
//     } catch (error) {
//         console.error('Error updating event:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// };



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

// const bookEvent = async (req, res) => {
//     try {
//         const { eventId, primaryMemberId, dependents, guests, primaryMemberChecked } = req.body;

//         // Validate request data
//         if (!eventId || !primaryMemberId) {
//             return res.status(400).json({ message: 'Event ID and Primary Member ID are required.' });
//         }

//         // Check if the user has already booked this event
//         const existingBooking = await EventBooking.findOne({ eventId, primaryMemberId, bookingStatus: "Confirmed" });
//         // if (existingBooking) {
//         //     return res.status(400).json({ message: 'You have already booked this event.' });
//         // }

//         // Fetch the event details
//         const event = await Event.findById(eventId).populate("taxTypes");
//         if (!event) {
//             return res.status(404).json({ message: 'Event not found.' });
//         }

//         if (event.status !== 'Active') {
//             return res.status(400).json({ message: 'Event is not active or available for booking.' });
//         }

//         // Fetch the primary member's details
//         const member = await User.findById(primaryMemberId).populate("parentUserId");
//         if (!member) {
//             return res.status(404).json({ message: "Primary member not found." });
//         }

//         // Define a mapping for relation types
//         const relationMapping = {
//             "Primary": "Primary",
//             "Spouse": "Spouse",
//             "Son": "Son",
//             "Daughter": "Daughter",
//             "Dependent": "Dependent",
//             "Senior Dependent": "SeniorDependent",
//         };

//         const permissionKey = relationMapping[member.relation];

//         // Validate the booking permission for the relation
//         if (!permissionKey || !event[`bookingPermission${permissionKey}`]) {
//             return res.status(403).json({
//                 message: `Members with the relationship type '${member.relation}' are not eligible for booking this event.`,
//             });
//         }

//         // Calculate ticket requirements
//         const primaryMemberCount = primaryMemberChecked ? 1 : 0;
//         const dependentMemberCount = dependents ? dependents.length : 0;
//         const guestMemberCount = guests ? guests.length : 0;

//         const totalMemberCount = primaryMemberCount + dependentMemberCount + guestMemberCount;

//         // Check ticket availability
//         if (event.totalAvailableTickets < totalMemberCount) {
//             return res.status(400).json({ message: "Not enough tickets available for this event." });
//         }

//         const subtotal =
//             primaryMemberCount * event.primaryMemberPrice +
//             dependentMemberCount * event.dependentMemberPrice +
//             guestMemberCount * event.guestMemberPrice;

//         // Calculate taxes based on taxTypes
//         const taxDetails = event.taxTypes.map(taxType => {
//             const taxAmount = (subtotal * taxType.percentage) / 100;
//             return {
//                 taxType: taxType.name || "N/A",
//                 taxRate: taxType.percentage || 0,
//                 taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimal places
//             };
//         });

//         const totalTaxAmount = taxDetails.reduce((acc, tax) => acc + tax.taxAmount, 0);
//         const totalAmount = subtotal + totalTaxAmount;

//         // Members for QR code generation
//         const members = [
//             ...(primaryMemberChecked ? [{ userId: primaryMemberId, type: "Primary", eventId }] : []),
//             ...(dependents || []).map(dep => ({ userId: dep.userId, type: "Dependent", eventId })),
//             ...(guests || []).map(guest => ({ userId: guest.name, type: "Guest", eventId })), // Guest uses name
//         ];

//         // Generate QR codes for members
//         const qrCodes = await QRCodeHelper.generateMultipleQRCodes(members);

//         // Generate primary member QR code if checked
//         const primaryMemberQRCodeData = primaryMemberChecked
//             ? qrCodes.find(qr => qr.userId.toString() === primaryMemberId.toString())
//             : null;

//         // Generate QR code for all details
//         const uniqueNumber = Math.floor(Math.random() * 10000000000); // Generates a random 10-digit number
//         const uniqueQRCodeId = `QR${uniqueNumber}`; // The unique QR code string
//         const allDetailsQRCodeData = {
//             uniqueQRCodeId,
//             eventId,
//             eventTitle: event.eventTitle,
//             primaryMemberId,
//             dependents,
//             guests,
//             ticketDetails: {
//                 primaryMemberPrice: event.primaryMemberPrice,
//                 dependentPrice: event.dependentMemberPrice,
//                 guestPrice: event.guestMemberPrice,
//                 taxTypes: taxDetails,
//                 subtotal,
//                 taxAmount: totalTaxAmount,
//                 totalAmount,
//             },
//         };
//         const allDetailsQRCode = await QRCodeHelper.generateQRCode(allDetailsQRCodeData);

//         // Prepare dependents and guests with QR codes
//         const preparedDependents = dependents
//             ? dependents.map(dep => ({
//                 userId: dep.userId,
//                 qrCode: qrCodes.find(qr => qr.userId.toString() === dep.userId.toString()).qrCode,
//                 uniqueQRCode: qrCodes.find(qr => qr.userId.toString() === dep.userId.toString()).uniqueQRCodeData,
//             }))
//             : [];
//         const preparedGuests = guests
//             ? guests.map(guest => ({
//                 name: guest.name,
//                 email: guest.email,
//                 phone: guest.phone,
//                 qrCode: qrCodes.find(qr => qr.userId === guest.name).qrCode,
//                 uniqueQRCode: qrCodes.find(qr => qr.userId === guest.name).uniqueQRCodeData,
//             }))
//             : [];

//         // Save the booking
//         const newBooking = new EventBooking({
//             eventId,
//             primaryMemberId,
//             // primaryMemberQRCode: qrCodes.find(qr => qr.userId.toString() === primaryMemberId.toString()).qrCode,
//             // uniqueQRCode: qrCodes.find(qr => qr.userId.toString() === primaryMemberId.toString()).uniqueQRCodeData,
//             primaryMemberQRCode: primaryMemberQRCodeData ? primaryMemberQRCodeData.qrCode : null,
//             uniqueQRCode: primaryMemberQRCodeData ? primaryMemberQRCodeData.uniqueQRCodeData : null,
//             dependents: preparedDependents,
//             guests: preparedGuests,
//             counts: {
//                 primaryMemberCount,
//                 dependentMemberCount,
//                 guestMemberCount,
//             },
//             ticketDetails: {
//                 primaryMemberPrice: event.primaryMemberPrice,
//                 dependentPrice: event.dependentMemberPrice,
//                 guestPrice: event.guestMemberPrice,
//                 taxTypes: taxDetails,
//                 subtotal,
//                 taxAmount: totalTaxAmount,
//                 totalAmount,
//             },
//             allDetailsQRCode,
//             allDetailsUniqueQRCode: uniqueQRCodeId,
//             paymentStatus: 'Pending',
//             bookingStatus: 'Confirmed',
//         });

//         await newBooking.save();

//         // Update the available tickets in the Event schema
//         // Update available tickets in the database
//         event.allottedTicketsMember -= primaryMemberCount + dependentMemberCount;
//         event.allottedTicketsGuest -= guestMemberCount;
//         event.totalAvailableTickets -= totalMemberCount;

//         // Validate updated ticket counts
//         if (event.allottedTicketsMember < 0 || event.allottedTicketsGuest < 0) {
//             return res.status(400).json({
//                 message: "Invalid ticket count update. Ensure the requested tickets are available.",
//             });
//         }

//         await event.save();

//         // Call this function after booking is created
//         await createAttendanceRecords(newBooking);

//         // Send confirmation email
//         const memberData = await EventBooking.findById(newBooking._id)
//             .populate("eventId")
//             .populate("primaryMemberId")
//             .populate("dependents.userId");


//         let primaryName;
//         let primaryEmail;
//         let primaryContact;

//         // Send email to primary member
//         if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
//             primaryName = memberData?.primaryMemberId?.name
//             primaryEmail = memberData?.primaryMemberId?.email
//             primaryContact = memberData?.primaryMemberId?.mobileNumber
//         } else {
//             primaryName = member.parentUserId.name
//             primaryEmail = member.parentUserId.email
//             primaryContact = member.parentUserId.mobileNumber
//         }


//         const templateData = {
//             uniqueQRCode: primaryMemberChecked ? newBooking.uniqueQRCode : newBooking.allDetailsUniqueQRCode,
//             qrCode: allDetailsQRCode, // Base64 string for QR Code
//             eventTitle: event.eventTitle,
//             eventDate: event.eventStartDate.toDateString(),
//             bookedBy: memberData?.primaryMemberId?.name,
//             primaryName: primaryName,
//             primaryEmail: primaryEmail,
//             primaryContact: primaryContact,
//             familyMembers: memberData.dependents.length > 0
//                 ? memberData.dependents.map(dep => ({ name: dep.userId.name, email: dep.userId.email, contact: dep.userId.mobileNumber }))
//                 : [],
//             guests: memberData.guests.length > 0
//                 ? memberData.guests.map(guest => ({
//                     name: guest.name,
//                     email: guest.email,
//                     contact: guest.phone,
//                 }))
//                 : [],
//             taxTypes: newBooking.ticketDetails.taxTypes.length > 0
//                 ? newBooking.ticketDetails.taxTypes.map(taxType => ({
//                     taxType: taxType.taxType || "N/A",
//                     taxRate: taxType.taxRate || 0,
//                     taxAmount: taxType.taxAmount || 0,
//                 }))
//                 : [],
//             subtotal: newBooking.ticketDetails.subtotal.toFixed(2),
//             taxAmount: newBooking.ticketDetails.taxAmount.toFixed(2),
//             totalAmount: newBooking.ticketDetails.totalAmount.toFixed(2),
//         };

//         const emailTemplate = emailTemplates.eventBooking;
//         const htmlBody = eventrenderTemplate(emailTemplate.body, templateData);
//         const subject = eventrenderTemplate(emailTemplate.subject, templateData);

//         const emailDependentTemplate = emailTemplates.eventBookingDependentTemplate;
//         const emailGuestTemplate = emailTemplates.eventBookingGuestTemplate;
//         const subjectDependent = eventrenderTemplate(emailDependentTemplate.subject, templateData);

//         // Send email to primary member
//         let primaryMemberEmail;
//         if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
//             primaryMemberEmail = memberData.primaryMemberId.email;
//         } else {
//             primaryMemberEmail = member.parentUserId.email;
//         }

//         // // Prepare email content
//         // const emailAttachments = primaryMemberChecked
//         //     ? [
//         //         {
//         //             filename: "qrCodeImage .png",
//         //             content: Buffer.from(
//         //                 primaryMemberQRCodeData.qrCode.split(",")[1],
//         //                 "base64"
//         //             ),
//         //             encoding: "base64",
//         //             cid: "qrCodeImage",
//         //         },
//         //     ]
//         //     : [
//         //         {
//         //             filename: "qrCodeImage.png",
//         //             content: Buffer.from(newBooking.allDetailsQRCode.split(",")[1], "base64"),
//         //             encoding: "base64",
//         //             cid: "qrCodeImage",
//         //         },
//         //     ];
//         // Prepare email content
//         const emailAttachments = primaryMemberChecked
//             ? [
//                 {
//                     filename: "qrCodeImage.png", // Corrected filename
//                     content: Buffer.from(
//                         primaryMemberQRCodeData.qrCode.split(",")[1],
//                         "base64"
//                     ), // Convert primary member QR code to Buffer
//                     encoding: "base64",
//                     cid: "qrCodeImage", // Inline CID for embedding in email
//                 },
//             ]
//             : [
//                 {
//                     filename: "qrCodeImage.png", // Corrected filename
//                     content: Buffer.from(
//                         newBooking.allDetailsQRCode.split(",")[1],
//                         "base64"
//                     ), // Convert all details QR code to Buffer
//                     encoding: "base64",
//                     cid: "qrCodeImage", // Inline CID for embedding in email
//                 },
//             ];


//         await sendEmail(
//             primaryMemberEmail,
//             subject,
//             htmlBody,
//             emailAttachments
//         );


//         // const admins = await Admin.find({ role: 'admin', isDeleted: false });
//         const admins = await Department.find({ departmentName: 'Events', isDeleted: false });
//         for (const admin of admins) {
//             await sendEmail(admin.email, subject, htmlBody, [
//                 {
//                     filename: "qrCodeImage.png", // Corrected filename
//                     content: Buffer.from(
//                         newBooking.allDetailsQRCode.split(",")[1],
//                         "base64"
//                     ), // Convert all details QR code to Buffer
//                     encoding: "base64",
//                     cid: "qrCodeImage", // Inline CID for embedding in email
//                 },
//             ]);
//         }

//         // Send emails to dependents
//         for (const dependent of preparedDependents || []) {
//             const user = await User.findById(dependent.userId);
//             if (user) {
//                 // Generate a customized email body for the dependent
//                 const dependentTemplateData = {
//                     ...templateData,
//                     uniqueQRCode: dependent.uniqueQRCode, // Dependent's unique QR Code
//                     dependentName: user.name,
//                     dependentMail: user.email,
//                     dependentContact: user.mobileNumber,
//                     relation: user.relation,
//                 };
//                 const htmlDependentBody = eventrenderDependentTemplate(emailDependentTemplate.body, dependentTemplateData);

//                 // Send email
//                 await sendEmail(
//                     user.email,
//                     subjectDependent,
//                     htmlDependentBody,
//                     [
//                         {
//                             filename: "qrcode.png",
//                             content: Buffer.from(dependent.qrCode.split(",")[1], "base64"), // Convert to Buffer
//                             encoding: "base64",
//                             cid: "qrCodeImage",
//                         },
//                     ]
//                 );
//             }
//         }

//         // Send emails to guests
//         for (const guest of preparedGuests || []) {
//             if (guest.email) {
//                 // Generate a customized email body for the guest
//                 const guestTemplateData = {
//                     ...templateData,
//                     uniqueQRCode: guest.uniqueQRCode, // Guest's unique QR Code
//                     guestName: guest.name,
//                     guestEmail: guest.email,
//                     guestContact: guest.phone
//                 };
//                 const htmlGuestBody = eventrenderDependentTemplate(emailGuestTemplate.body, guestTemplateData);

//                 // Send email
//                 await sendEmail(
//                     guest.email,
//                     subjectDependent,
//                     htmlGuestBody,
//                     [
//                         {
//                             filename: "qrcode.png",
//                             content: Buffer.from(guest.qrCode.split(",")[1], "base64"), // Convert to Buffer
//                             encoding: "base64",
//                             cid: "qrCodeImage",
//                         },
//                     ]
//                 );
//             }
//         }
//         let billingPrimaryMember;
//         if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
//             billingPrimaryMember = newBooking.primaryMemberId;
//         } else {
//             billingPrimaryMember = member.parentUserId._id;
//         }


//         await addBilling(billingPrimaryMember, 'Event', { eventBooking: newBooking._id }, newBooking.ticketDetails.subtotal, 0, newBooking.ticketDetails.taxAmount, newBooking.ticketDetails.totalAmount, newBooking.primaryMemberId)


//         // Call the createNotification function
//         await createNotification({
//             title: `${memberData.eventId.eventTitle} - Event Booking Is ${newBooking.bookingStatus}`,
//             send_to: "User",
//             push_message: "Your Event Booking Is Confirmed.",
//             department: "eventBooking",
//             departmentId: newBooking._id
//         });

//         let primaryMemberDetails = await User.findById(primaryMemberId);
//         // If the member is not primary, fetch the actual primary member
//         if (primaryMemberDetails.relation !== "Primary" && primaryMemberDetails.parentUserId !== null) {
//             primaryMemberDetails = await User.findById(primaryMemberDetails.parentUserId);
//             if (!primaryMemberDetails) {
//                 return res.status(404).json({ message: "Primary member not found for the provided member." });
//             }
//         }

//         primaryMemberDetails.creditLimit = primaryMemberDetails.creditLimit - newBooking.ticketDetails.totalAmount
//         await primaryMemberDetails.save();
//         // Return the response
//         return res.status(201).json({
//             message: 'Booking successful',
//             bookingDetails: newBooking,
//         });
//     } catch (error) {
//         console.error('Error booking event:', error);
//         return res.status(500).json({ message: 'An error occurred while booking the event.', error });
//     }
// };


// const bookingDetails = async (req, res) => {
//     try {
//         const { eventId, primaryMemberId, dependents, guests, primaryMemberChecked } = req.body;

//         // Validate request data
//         if (!eventId || !primaryMemberId) {
//             return res.status(400).json({ message: "Event ID and Primary Member ID are required." });
//         }

//         // Fetch the event details
//         const event = await Event.findById(eventId).populate("taxTypes");
//         if (!event) {
//             return res.status(404).json({ message: "Event not found." });
//         }

//         if (event.status !== "Active") {
//             return res.status(400).json({ message: "Event is not active or available for booking." });
//         }

// // Fetch the primary member's details
// const member = await User.findById(primaryMemberId);
// if (!member) {
//     return res.status(404).json({ message: "Primary member not found." });
// }

//         let primaryMemberDetails = await User.findById(primaryMemberId);
//         // If the member is not primary, fetch the actual primary member
//         if (primaryMemberDetails.relation !== "Primary" && primaryMemberDetails.parentUserId !== null) {
//             primaryMemberDetails = await User.findById(primaryMemberDetails.parentUserId);
//             if (!primaryMemberDetails) {
//                 return res.status(404).json({ message: "Primary member not found for the provided member." });
//             }
//         }

//         // Check credit stop and credit limit
//         if (primaryMemberDetails.creditStop) {
//             return res.status(400).json({
//                 message: "You are currently not eligible for booking. Please contact the club."
//             });
//         }


//         // Define a mapping for relation types
//         const relationMapping = {
//             "Primary": "Primary",
//             "Spouse": "Spouse",
//             "Son": "Son",
//             "Daughter": "Daughter",
//             "Dependent": "Dependent",
//             "Senior Dependent": "SeniorDependent",
//         };

//         // Get the primary member's relation and map it
//         // const { relation } = member;
//         const permissionKey = relationMapping[member.relation];

//         // Validate the booking permission for the relation
//         if (!permissionKey || !event[`bookingPermission${permissionKey}`]) {
//             return res.status(400).json({
//                 message: `Members with the relationship type '${member.relation}' are not eligible for booking this event.`,
//             });
//         }


//         // Calculate ticket requirements
//         const primaryMemberCount = primaryMemberChecked ? 1 : 0;
//         const dependentMemberCount = dependents ? dependents.length : 0;
//         const guestMemberCount = guests ? guests.length : 0;

//         const totalMemberCount = primaryMemberCount + dependentMemberCount + guestMemberCount;

//         // Check ticket availability
//         if (event.totalAvailableTickets < totalMemberCount) {
//             return res.status(400).json({ message: "Not enough tickets available for this event." });
//         }

//         const subtotal =
//             primaryMemberCount * event.primaryMemberPrice +
//             dependentMemberCount * event.dependentMemberPrice +
//             guestMemberCount * event.guestMemberPrice;

//         // Calculate taxes based on taxTypes
//         const taxDetails = event.taxTypes.map(taxType => {
//             const taxAmount = (subtotal * taxType.percentage) / 100;
//             return {
//                 taxType: taxType.name,
//                 taxRate: taxType.percentage,
//                 taxAmount: Math.round(taxAmount * 100) / 100, // Round to 2 decimal places
//             };
//         });

//         const totalTaxAmount = taxDetails.reduce((acc, tax) => acc + tax.taxAmount, 0);
//         const totalAmount = subtotal + totalTaxAmount;

//         // Check credit limit
//         if (primaryMemberDetails.creditLimit < totalAmount) {
//             return res.status(400).json({
//                 message: "Your credit limit is less than the purchase amount. Please contact the club.",
//             });
//         }

//         // Update available tickets in the database
//         event.allottedTicketsMember -= primaryMemberCount + dependentMemberCount;
//         event.allottedTicketsGuest -= guestMemberCount;
//         event.totalAvailableTickets -= totalMemberCount;

//         // Validate updated ticket counts
//         if (event.allottedTicketsMember < 0 || event.allottedTicketsGuest < 0) {
//             return res.status(400).json({
//                 message: "Invalid ticket count update. Ensure the requested tickets are available.",
//             });
//         }

//         // await event.save();

//         // Prepare the response data
//         const bookingDetails = {
//             eventId,
//             primaryMemberId,
//             dependents: dependents || [],
//             guests: guests || [],
//             counts: {
//                 primaryMemberCount,
//                 dependentMemberCount,
//                 guestMemberCount,
//             },
//             ticketDetails: {
//                 primaryMemberPrice: event.primaryMemberPrice,
//                 dependentPrice: event.dependentMemberPrice,
//                 guestPrice: event.guestMemberPrice,
//                 taxTypes: taxDetails,
//                 subtotal,
//                 taxAmount: totalTaxAmount,
//                 totalAmount,
//             },
//             paymentStatus: "Pending", // Default status
//             bookingStatus: "Pending", // Default status
//         };

//         // Return the booking details
//         return res.status(200).json({
//             message: "Booking details calculated successfully.",
//             bookingDetails,
//         });
//     } catch (error) {
//         console.error("Error calculating booking details:", error);
//         return res.status(500).json({
//             message: "An error occurred while calculating the event booking details.",
//             error: error.message,
//         });
//     }
// };


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
        //     return res.status(400).json({ message: 'you have already booked this event.' });
        // }

        // Fetch the event details
        const event = await Event.findById(eventId).populate("taxTypes");
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (event.status !== 'Active') {
            return res.status(400).json({ message: 'Event is not active or available for booking.' });
        }

        // Fetch the primary member's details
        const member = await User.findById(primaryMemberId).populate("parentUserId");
        if (!member) {
            return res.status(404).json({ message: "Primary member not found." });
        }

        // Define a mapping for relation types
        const relationMapping = {
            "Primary": "Primary",
            "Spouse": "Spouse",
            "Dependent Spouse": "Spouse",
            "Senior Dependent Spouse": "Spouse",
            "Child": "Child",
            // "Son": "Son",
            // "Daughter": "Daughter",
            "Dependent": "Dependent",
            "Senior Dependent": "SeniorDependent",
        };

        const permissionKey = relationMapping[member.relation];

        // Validate the booking permission for the relation
        if (!permissionKey || !event[`bookingPermission${permissionKey}`]) {
            return res.status(403).json({
                message: `Members with the relationship type '${member.relation}' are not eligible for booking this event.`,
            });
        }


        // Mapping for relations to price fields
        const relationPriceMapping = {
            "Primary": "primaryMemberPrice",
            "Spouse": "spouseMemberPrice",
            "Dependent Spouse": "spouseMemberPrice",
            "Senior Dependent Spouse": "spouseMemberPrice",
            "Child": "kidsMemberPrice",
            // "Son": "kidsMemberPrice",
            // "Daughter": "kidsMemberPrice",
            "Dependent": "dependentMemberPrice",
            "Senior Dependent": "seniorDependentMemberPrice",
        };

        let totalAmount = 0;
        let subtotal = 0;
        let counts = {
            primaryMemberCount: primaryMemberChecked ? 1 : 0,
            spouseMemberCount: 0,
            kidsMemberCount: 0,
            dependentMemberCount: 0,
            seniorDependentMemberCount: 0,
            guestMemberCount: guests ? guests.length : 0,
        };

        let ticketDetails = {
            primaryMemberPrice: primaryMemberChecked ? event.primaryMemberPrice : 0,
            spouseMemberPrice: 0,
            kidsMemberPrice: 0,
            dependentMemberPrice: 0,
            seniorDependentMemberPrice: 0,
            guestPrice: counts.guestMemberCount * event.guestMemberPrice,
        };

        // Calculate primary member price
        subtotal += ticketDetails.primaryMemberPrice;

        // Calculate dependents' price
        if (dependents && dependents.length) {
            for (const dependent of dependents) {
                const dependentUser = await User.findById(dependent.userId);
                if (!dependentUser) {
                    return res.status(404).json({ message: `Dependent with ID ${dependent.userId} not found.` });
                }
                const priceField = relationPriceMapping[dependentUser.relation] || "dependentMemberPrice";
                ticketDetails[priceField] += event[priceField];
                // counts[`${dependentUser.relation.replace(" ", "").toLowerCase()}MemberCount`]++;
                // if (dependentUser.relation === "Son" || dependentUser.relation === "Daughter") {
                //     counts.kidsMemberCount++;
                // } 
                if (dependentUser.relation === "Child") {
                    counts.kidsMemberCount++;
                } else if (dependentUser.relation === "Senior Dependent") {
                    counts.seniorDependentMemberCount++;
                } else if (dependentUser.relation === "Spouse" || dependentUser.relation === "Dependent Spouse" || dependentUser.relation === "Senior Dependent Spouse") {
                    counts.spouseMemberCount++;
                }
                else {
                    counts[`${dependentUser.relation.replace(" ", "").toLowerCase()}MemberCount`]++;
                }
                subtotal += event[priceField];
            }
        }

        subtotal += ticketDetails.guestPrice;
        let totalMemberCount = Object.values(counts).reduce((acc, val) => acc + val, 0);

        if (event.totalAvailableTickets < totalMemberCount) {
            return res.status(400).json({ message: "Not enough tickets available for this event." });
        }

        // Calculate tax amounts
        const taxDetails = event.taxTypes.map(taxType => {
            const taxAmount = (subtotal * taxType.percentage) / 100;
            return {
                taxType: taxType.name,
                taxRate: taxType.percentage,
                taxAmount: Math.round(taxAmount * 100) / 100,
            };
        });

        const totalTaxAmount = taxDetails.reduce((acc, tax) => acc + tax.taxAmount, 0);
        totalAmount = subtotal + totalTaxAmount;

        // Members for QR code generation
        const members = [
            ...(primaryMemberChecked ? [{ userId: primaryMemberId, type: "Primary", eventId }] : []),
            ...(dependents || []).map(dep => ({ userId: dep.userId, type: "Dependent", eventId })),
            ...(guests || []).map(guest => ({ userId: guest.name, type: "Guest", eventId })), // Guest uses name
        ];

        // Generate QR codes for members
        const qrCodes = await QRCodeHelper.generateMultipleQRCodes(members);

        // Generate primary member QR code if checked
        const primaryMemberQRCodeData = primaryMemberChecked
            ? qrCodes.find(qr => qr.userId.toString() === primaryMemberId.toString())
            : null;

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
                ...ticketDetails,
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
            // primaryMemberQRCode: qrCodes.find(qr => qr.userId.toString() === primaryMemberId.toString()).qrCode,
            // uniqueQRCode: qrCodes.find(qr => qr.userId.toString() === primaryMemberId.toString()).uniqueQRCodeData,
            primaryMemberQRCode: primaryMemberQRCodeData ? primaryMemberQRCodeData.qrCode : null,
            uniqueQRCode: primaryMemberQRCodeData ? primaryMemberQRCodeData.uniqueQRCodeData : null,
            dependents: preparedDependents,
            guests: preparedGuests,
            counts,
            ticketDetails: {
                ...ticketDetails,
                taxTypes: taxDetails,
                subtotal: Math.round(subtotal),
                taxAmount: Math.round(totalTaxAmount),
                totalAmount: Math.round(totalAmount),
            },
            allDetailsQRCode,
            allDetailsUniqueQRCode: uniqueQRCodeId,
            paymentStatus: 'Pending',
            bookingStatus: 'Confirmed',
        });

        await newBooking.save();

        // Update the available tickets in the Event schema
        // Update available tickets in the database
        event.allottedTicketsMember -= counts.primaryMemberCount + counts.dependentMemberCount + counts.kidsMemberCount + counts.seniorDependentMemberCount + counts.spouseMemberCount;
        event.allottedTicketsGuest -= counts.guestMemberCount;
        event.totalAvailableTickets -= totalMemberCount;

        // Validate updated ticket counts
        if (event.allottedTicketsMember < 0 || event.allottedTicketsGuest < 0) {
            return res.status(400).json({
                message: "Invalid ticket count update. Ensure the requested tickets are available.",
            });
        }

        await event.save();

        // Call this function after booking is created
        await createAttendanceRecords(newBooking);

        // Send confirmation email
        const memberData = await EventBooking.findById(newBooking._id)
            .populate("eventId")
            .populate("primaryMemberId")
            .populate("dependents.userId");


        let primaryName;
        let primaryEmail;
        let primaryContact;

        // Send email to primary member
        if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
            primaryName = memberData?.primaryMemberId?.name
            primaryEmail = memberData?.primaryMemberId?.email
            primaryContact = memberData?.primaryMemberId?.mobileNumber
        } else {
            primaryName = member.parentUserId.name
            primaryEmail = member.parentUserId.email
            primaryContact = member.parentUserId.mobileNumber
        }


        const templateData = {
            uniqueQRCode: primaryMemberChecked ? newBooking.uniqueQRCode : newBooking.allDetailsUniqueQRCode,
            qrCode: allDetailsQRCode, // Base64 string for QR Code
            eventTitle: event.eventTitle,
            eventDate: event.eventStartDate.toDateString(),
            bookedBy: memberData?.primaryMemberId?.name,
            memberShipId: memberData?.primaryMemberId?.memberId,
            memberContact: memberData?.primaryMemberId?.mobileNumber,
            primaryName: primaryName,
            primaryEmail: primaryEmail,
            primaryContact: primaryContact,
            familyMembers: memberData.dependents.length > 0
                ? memberData.dependents.map(dep => ({ name: dep.userId.name, email: dep.userId.email, contact: dep.userId.mobileNumber, relation: dep.userId.relation }))
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
        const emailGuestTemplate = emailTemplates.eventBookingGuestTemplate;
        const subjectDependent = eventrenderTemplate(emailDependentTemplate.subject, templateData);

        // Send email to primary member
        let primaryMemberEmail;
        if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
            primaryMemberEmail = memberData.primaryMemberId.email;
        } else {
            primaryMemberEmail = member.parentUserId.email;
        }

        // Prepare email content
        const emailAttachments = primaryMemberChecked
            ? [
                {
                    filename: "qrCodeImage.png", // Corrected filename
                    content: Buffer.from(
                        primaryMemberQRCodeData.qrCode.split(",")[1],
                        "base64"
                    ), // Convert primary member QR code to Buffer
                    encoding: "base64",
                    cid: "qrCodeImage", // Inline CID for embedding in email
                },
            ]
            : [
                {
                    filename: "qrCodeImage.png", // Corrected filename
                    content: Buffer.from(
                        newBooking.allDetailsQRCode.split(",")[1],
                        "base64"
                    ), // Convert all details QR code to Buffer
                    encoding: "base64",
                    cid: "qrCodeImage", // Inline CID for embedding in email
                },
            ];


        await sendEmail(
            primaryMemberEmail,
            subject,
            htmlBody,
            emailAttachments, cc = null
        );

        // const message = `Dear ${primaryName}, Your event booking for ${event.eventTitle} on ${templateData.eventDate} at ${QRCodeHelper.formatTimeTo12Hour(event.startTime)} to ${QRCodeHelper.formatTimeTo12Hour(event.endTime)} has been successfully confirmed. Event Details:- Event Name: ${event.eventTitle} - Number of Guests: ${totalMemberCount} - Total Amount: ${templateData.totalAmount} BCLUB`
        const message = `Dear ${primaryName}, Your event booking for ${event.eventTitle} on ${templateData.eventDate} at ${QRCodeHelper.formatTimeTo12Hour(event.startTime)} to ${QRCodeHelper.formatTimeTo12Hour(event.endTime)} has been successfully confirmed. Event Details: - Event Name: ${event.eventTitle} - Number of Guests: ${totalMemberCount} - Total Amount: ${templateData.totalAmount} BCLUB`
        await sendSMSViaPOST(primaryContact, message)


        // const admins = await Admin.find({ role: 'admin', isDeleted: false });
        const admins = await Department.find({ departmentName: 'Events', isDeleted: false });
        for (const admin of admins) {
            await sendEmail(admin.email, subject, htmlBody, [
                {
                    filename: "qrCodeImage.png", // Corrected filename
                    content: Buffer.from(
                        newBooking.allDetailsQRCode.split(",")[1],
                        "base64"
                    ), // Convert all details QR code to Buffer
                    encoding: "base64",
                    cid: "qrCodeImage", // Inline CID for embedding in email
                },
            ]);
        }

        // Send emails to dependents
        for (const dependent of preparedDependents || []) {
            const user = await User.findById(dependent.userId);
            if (user) {
                // Generate a customized email body for the dependent
                const dependentTemplateData = {
                    ...templateData,
                    uniqueQRCode: dependent.uniqueQRCode, // Dependent's unique QR Code
                    dependentName: user.name,
                    dependentMail: user.email,
                    dependentContact: user.mobileNumber,
                    dependentrelation: user.relation,
                };
                const htmlDependentBody = eventrenderDependentTemplate(emailDependentTemplate.body, dependentTemplateData);

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
                    guestName: guest.name,
                    guestEmail: guest.email,
                    guestContact: guest.phone
                };
                const htmlGuestBody = eventrenderDependentTemplate(emailGuestTemplate.body, guestTemplateData);

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
        let billingPrimaryMember;
        if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
            billingPrimaryMember = newBooking.primaryMemberId;
        } else {
            billingPrimaryMember = member.parentUserId._id;
        }


        await addBilling(billingPrimaryMember, 'Event', { eventBooking: newBooking._id }, newBooking.ticketDetails.subtotal, 0, newBooking.ticketDetails.taxAmount, newBooking.ticketDetails.totalAmount, newBooking.primaryMemberId)


        // Call the createNotification function
        await createNotification({
            title: `${memberData.eventId.eventTitle} - Event Booking Is ${newBooking.bookingStatus}`,
            send_to: "User",
            push_message: "Your Event Booking Is Confirmed.",
            department: "eventBooking",
            departmentId: newBooking._id
        });

        let primaryMemberDetails = await User.findById(primaryMemberId);
        // If the member is not primary, fetch the actual primary member
        if (primaryMemberDetails.relation !== "Primary" && primaryMemberDetails.parentUserId !== null) {
            primaryMemberDetails = await User.findById(primaryMemberDetails.parentUserId);
            if (!primaryMemberDetails) {
                return res.status(404).json({ message: "Primary member not found for the provided member." });
            }
        }

        primaryMemberDetails.creditLimit = primaryMemberDetails.creditLimit - newBooking.ticketDetails.totalAmount
        await primaryMemberDetails.save();
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

// --------------------current code
// const bookingDetails = async (req, res) => {
//     try {
//         const { eventId, primaryMemberId, dependents, guests, primaryMemberChecked } = req.body;

//         // Validate request data
//         if (!eventId || !primaryMemberId) {
//             return res.status(400).json({ message: "Event ID and Primary Member ID are required." });
//         }

//         // Fetch the event details
//         const event = await Event.findById(eventId).populate("taxTypes");
//         if (!event) {
//             return res.status(404).json({ message: "Event not found." });
//         }

//         if (event.status !== "Active") {
//             return res.status(400).json({ message: "Event is not active or available for booking." });
//         }


//         // // Check if the user has already booked this event
//         // const existingBooking = await EventBooking.findOne({ eventId, primaryMemberId, bookingStatus: "Confirmed" });
//         // if (existingBooking) {
//         //     return res.status(400).json({ message: 'you have already booked this event.' });
//         // }

//         // Fetch previous confirmed bookings for this member
//         const existingBookings = await EventBooking.find({
//             eventId,
//             primaryMemberId,
//             bookingStatus: "Confirmed",
//         });

// let totalPreviousGuests = 0;
// let alreadyBookedMembers = false;

// if (existingBookings.length > 0) {
//     existingBookings.forEach((booking) => {
//         totalPreviousGuests += booking.counts.guestMemberCount; // Summing previous guests
//         if (booking.counts.primaryMemberCount > 0 || booking.counts.spouseMemberCount > 0 || booking.counts.kidsMemberCount > 0 || booking.counts.dependentMemberCount > 0 || booking.counts.seniorDependentMemberCount > 0) {
//             alreadyBookedMembers = true;
//         }
//     });

//     // If user is trying to book members again, prevent it
//     if (alreadyBookedMembers && (primaryMemberChecked || (dependents && dependents.length > 0))) {
//         return res.status(400).json({
//             message: "You have already booked this event for members. You can only book for guests.",
//         });
//     }
// }

//         // Calculate the remaining guests that can be booked
//         const maxGuestLimit = 6;
//         const newGuestCount = guests ? guests.length : 0;
//         const remainingGuestsAllowed = maxGuestLimit - totalPreviousGuests;

//         if (newGuestCount > remainingGuestsAllowed) {
//             return res.status(400).json({
//                 message: `You have already booked ${totalPreviousGuests} guests. You can only add ${remainingGuestsAllowed} more guests.`,
//             });
//         }


//         // Fetch the primary member's details
//         const member = await User.findById(primaryMemberId);
//         if (!member) {
//             return res.status(404).json({ message: "Primary member not found." });
//         }

// // Fetch the primary member's details
// let primaryMemberDetails = await User.findById(primaryMemberId);
// if (primaryMemberDetails.relation !== "Primary" && primaryMemberDetails.parentUserId !== null) {
//     primaryMemberDetails = await User.findById(primaryMemberDetails.parentUserId);
//     if (!primaryMemberDetails) {
//         return res.status(404).json({ message: "Primary member not found for the provided member." });
//     }
// }

// if (primaryMemberDetails.creditStop) {
//     return res.status(400).json({ message: "You are currently not eligible for booking. Please contact the club." });
// }

// // Define a mapping for relation types
// const relationMapping = {
//     "Primary": "Primary",
//     "Spouse": "Spouse",
//     "Dependent Spouse": "Spouse",
//     "Senior Dependent Spouse": "Spouse",
//     "Child": "Child",
//     // "Son": "Son",
//     // "Daughter": "Daughter",
//     "Dependent": "Dependent",
//     "Senior Dependent": "SeniorDependent",
// };

// // Get the primary member's relation and map it
// // const { relation } = member;
// const permissionKey = relationMapping[member.relation];

// // Validate the booking permission for the relation
// if (!permissionKey || !event[`bookingPermission${permissionKey}`]) {
//     return res.status(400).json({
//         message: `Members with the relationship type '${member.relation}' are not eligible for booking this event.`,
//     });
// }


//         // Mapping for relations to price fields
//         const relationPriceMapping = {
//             "Primary": "primaryMemberPrice",
//             "Spouse": "spouseMemberPrice",
//             "Dependent Spouse": "spouseMemberPrice",
//             "Senior Dependent Spouse": "spouseMemberPrice",
//             "Child": "kidsMemberPrice",
//             // "Son": "kidsMemberPrice",
//             // "Daughter": "kidsMemberPrice",
//             "Dependent": "dependentMemberPrice",
//             "Senior Dependent": "seniorDependentMemberPrice",
//         };

//         let totalAmount = 0;
//         let subtotal = 0;
//         let counts = {
//             primaryMemberCount: primaryMemberChecked ? 1 : 0,
//             spouseMemberCount: 0,
//             kidsMemberCount: 0,
//             dependentMemberCount: 0,
//             seniorDependentMemberCount: 0,
//             guestMemberCount: guests ? guests.length : 0,
//         };

//         let ticketDetails = {
//             primaryMemberPrice: primaryMemberChecked ? event.primaryMemberPrice : 0,
//             spouseMemberPrice: 0,
//             kidsMemberPrice: 0,
//             dependentMemberPrice: 0,
//             seniorDependentMemberPrice: 0,
//             guestPrice: counts.guestMemberCount * event.guestMemberPrice,
//         };

//         // Calculate primary member price
//         subtotal += ticketDetails.primaryMemberPrice;

//         // Calculate dependents' price
// if (dependents && dependents.length) {
//     for (const dependent of dependents) {
//         const dependentUser = await User.findById(dependent.userId);
//         if (!dependentUser) {
//             return res.status(404).json({ message: `Dependent with ID ${dependent.userId} not found.` });
//         }
//         const priceField = relationPriceMapping[dependentUser.relation] || "dependentMemberPrice";
//         ticketDetails[priceField] += event[priceField];
//         // counts[`${dependentUser.relation.replace(" ", "").toLowerCase()}MemberCount`]++;
//         // if (dependentUser.relation === "Son" || dependentUser.relation === "Daughter") {
//         //     counts.kidsMemberCount++;
//         // } 
//         if (dependentUser.relation === "Child") {
//             counts.kidsMemberCount++;
//         } else if (dependentUser.relation === "Senior Dependent") {
//             counts.seniorDependentMemberCount++;
//         }
//         else if (dependentUser.relation === "Spouse" || dependentUser.relation === "Dependent Spouse" || dependentUser.relation === "Senior Dependent Spouse") {
//             counts.spouseMemberCount++;
//         } else {
//             counts[`${dependentUser.relation.replace(" ", "").toLowerCase()}MemberCount`]++;
//         }
//         subtotal += event[priceField];
//     }
// }

//         subtotal += ticketDetails.guestPrice;
//         let totalMemberCount = Object.values(counts).reduce((acc, val) => acc + val, 0);

//         if (event.totalAvailableTickets < totalMemberCount) {
//             return res.status(400).json({ message: "Not enough tickets available for this event." });
//         }

//         // Calculate tax amounts
//         const taxDetails = event.taxTypes.map(taxType => {
//             const taxAmount = (subtotal * taxType.percentage) / 100;
//             return {
//                 taxType: taxType.name,
//                 taxRate: taxType.percentage,
//                 taxAmount: Math.round(taxAmount * 100) / 100,
//             };
//         });

//         const totalTaxAmount = taxDetails.reduce((acc, tax) => acc + tax.taxAmount, 0);
//         totalAmount = subtotal + totalTaxAmount;

// if (primaryMemberDetails.creditLimit > 0 && primaryMemberDetails.creditLimit < totalAmount) {
//     return res.status(400).json({ message: "Your credit limit is less than the purchase amount. Please contact the club." });
// }


//         // Prepare the response data
//         const bookingDetails = {
//             eventId,
//             primaryMemberId,
//             dependents: dependents || [],
//             guests: guests || [],
//             counts,
//             ticketDetails: {
//                 ...ticketDetails,
//                 taxTypes: taxDetails,
//                 subtotal,
//                 taxAmount: totalTaxAmount,
//                 totalAmount,
//             },
//             paymentStatus: "Pending",
//             bookingStatus: "Pending",
//         };

//         return res.status(200).json({
//             message: "Booking details calculated successfully.",
//             bookingDetails,
//         });
//     } catch (error) {
//         console.error("Error calculating booking details:", error);
//         return res.status(500).json({ message: "An error occurred while calculating the event booking details.", error: error.message });
//     }
// };

// working current code

const bookingDetails = async (req, res) => {
    try {
        const { eventId, primaryMemberId, dependents, guests, primaryMemberChecked } = req.body;

        // Validate guests array
        if (guests && guests.length > 0) {
            for (let i = 0; i < guests.length; i++) {
                const guest = guests[i];

                // Check if each guest has name, email, and phone
                if (!guest.name || !guest.email || !guest.phone) {
                    return res.status(400).json({
                        message: `Guest-${i + 1} is missing required fields (name, email, or phone).`
                    });
                }

                // Validate email format (simple email regex check)
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(guest.email)) {
                    return res.status(400).json({
                        message: `Guest-${i + 1} has an invalid email format.`
                    });
                }

                // Validate phone number (simple numeric check for 10 digits)
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(guest.phone)) {
                    return res.status(400).json({
                        message: `Guest-${i + 1} has an invalid phone number format.`
                    });
                }
            }
        }

        // Validate request data
        if (!eventId || !primaryMemberId) {
            return res.status(400).json({ message: "Event ID and Primary Member ID are required." });
        }

        // Fetch the event details
        const event = await Event.findById(eventId).populate("taxTypes");
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        if (event.status !== "Active") {
            return res.status(400).json({ message: "Event is not active or available for booking." });
        }


        // Fetch the primary member's details
        let primaryMemberDetails = await User.findById(primaryMemberId);
        if (primaryMemberDetails.relation !== "Primary" && primaryMemberDetails.parentUserId !== null) {
            primaryMemberDetails = await User.findById(primaryMemberDetails.parentUserId);
            if (!primaryMemberDetails) {
                return res.status(404).json({ message: "Primary member not found for the provided member." });
            }
        }

        if (primaryMemberDetails.creditStop) {
            return res.status(400).json({ message: "You are currently not eligible for booking. Please contact the club." });
        }


        // Define a mapping for relation types
        const relationMapping = {
            "Primary": "Primary",
            "Spouse": "Spouse",
            "Dependent Spouse": "Spouse",
            "Senior Dependent Spouse": "Spouse",
            "Child": "Child",
            "Dependent": "Dependent",
            "Senior Dependent": "SeniorDependent",
        };

        // Get the primary member's relation and map it
        // const { relation } = member;
        const permissionKey = relationMapping[primaryMemberDetails.relation];

        // Validate the booking permission for the relation
        if (!permissionKey || !event[`bookingPermission${permissionKey}`]) {
            return res.status(400).json({
                message: `Members with the relationship type '${primaryMemberDetails.relation}' are not eligible for booking this event.`,
            });
        }

        // Fetch existing confirmed bookings for this member
        const existingBookings = await EventBooking.find({
            eventId,
            primaryMemberId,
            bookingStatus: "Confirmed",
        });

        let totalPreviousGuests = 0;
        let alreadyBookedMembers = false;
        let alreadyBookedDependentUserIds = new Set(); // Track userIds of already booked dependents
        let alreadyBookedPrimaryMember = false;

        // Check if the primary member or any dependents are already booked
        if (existingBookings.length > 0) {
            existingBookings.forEach((booking) => {
                totalPreviousGuests += booking.counts.guestMemberCount; // Summing previous guests
                if (booking.counts.primaryMemberCount > 0) {
                    alreadyBookedPrimaryMember = true; // Primary member is already booked
                }

                // Track booked dependents' userId
                booking.dependents.forEach((dep) => {
                    alreadyBookedDependentUserIds.add(dep.userId.toString()); // Add userId of booked dependents
                });
            });

            // If primary member is already booked, prevent them from booking again
            if (alreadyBookedPrimaryMember && primaryMemberChecked) {
                return res.status(400).json({
                    message: "You have already booked this event for the Primary Member. You can book for other members and guests.",
                });
            }
        }

        // If primary member is already booked, they can't be booked again
        if (primaryMemberChecked && alreadyBookedPrimaryMember) {
            return res.status(400).json({
                message: "You have already booked this event for Primary Member. You can only book for other members and guests.",
            });
        }

        // Check if any dependents are already booked for this event
        if (dependents && dependents.length > 0) {
            for (const dependent of dependents) {
                const dependentUserId = dependent.userId;

                // Check if the dependent has already been booked for this event
                if (alreadyBookedDependentUserIds.has(dependentUserId.toString())) {
                    const dependentUser = await User.findById(dependentUserId);
                    if (dependentUser) {
                        return res.status(400).json({
                            message: `You have already booked the ticket for this dependent member (${dependentUser.relation})`,
                        });
                    }
                }
            }
        }

        let guestCount = guests ? guests.length : 0;
        const maxGuestLimit = 6;
        const remainingGuestsAllowed = maxGuestLimit - totalPreviousGuests;

        // Check if the remaining guest count exceeds the available limit
        if (guestCount > remainingGuestsAllowed) {
            return res.status(400).json({
                message: `You have already booked ${totalPreviousGuests} guests. You can only add ${remainingGuestsAllowed} more guests.`,
            });
        }

        // ✅ MANDATORY GUEST BOOKING VALIDATION
        const isAnyMemberAttending = primaryMemberChecked || (dependents && dependents.length > 0) || alreadyBookedPrimaryMember || alreadyBookedDependentUserIds.size > 0;

        if (!isAnyMemberAttending && guestCount > 0) {
            return res.status(400).json({
                message: "At least a Primary Member, Spouse, Dependent, or Senior Dependent must be attending the event to book guest tickets.",
            });
        }

        // Calculate ticket prices and subtotals
        const relationPriceMapping = {
            "Primary": "primaryMemberPrice",
            "Spouse": "spouseMemberPrice",
            "Dependent Spouse": "spouseMemberPrice",
            "Senior Dependent Spouse": "spouseMemberPrice",
            "Child": "kidsMemberPrice",
            "Dependent": "dependentMemberPrice",
            "Senior Dependent": "seniorDependentMemberPrice",
        };

        let subtotal = 0;
        let counts = {
            primaryMemberCount: primaryMemberChecked ? 1 : 0,
            spouseMemberCount: 0,
            kidsMemberCount: 0,
            dependentMemberCount: 0,
            seniorDependentMemberCount: 0,
            guestMemberCount: guestCount,
        };

        let ticketDetails = {
            primaryMemberPrice: primaryMemberChecked ? event.primaryMemberPrice : 0,
            spouseMemberPrice: 0,
            kidsMemberPrice: 0,
            dependentMemberPrice: 0,
            seniorDependentMemberPrice: 0,
            guestPrice: counts.guestMemberCount * event.guestMemberPrice,
        };

        subtotal += ticketDetails.primaryMemberPrice;

        // Process dependents and calculate their price
        if (dependents && dependents.length) {
            for (const dependent of dependents) {
                const dependentUser = await User.findById(dependent.userId);
                if (!dependentUser) {
                    return res.status(404).json({ message: `Dependent with ID ${dependent.userId} not found.` });
                }

                const priceField = relationPriceMapping[dependentUser.relation] || "dependentMemberPrice";
                ticketDetails[priceField] += event[priceField];

                // Update counts based on relation type
                if (dependentUser.relation === "Child") {
                    counts.kidsMemberCount++;
                } else if (dependentUser.relation === "Senior Dependent") {
                    counts.seniorDependentMemberCount++;
                } else if (["Spouse", "Dependent Spouse", "Senior Dependent Spouse"].includes(dependentUser.relation)) {
                    counts.spouseMemberCount++;
                } else {
                    counts[`${dependentUser.relation.replace(" ", "").toLowerCase()}MemberCount`] = (counts[`${dependentUser.relation.replace(" ", "").toLowerCase()}MemberCount`] || 0) + 1;
                }

                subtotal += event[priceField];
            }
        }

        // Calculate the total amount
        subtotal += ticketDetails.guestPrice;
        let totalMemberCount = Object.values(counts).reduce((acc, val) => acc + val, 0);

        // Ensure there are enough tickets for the event
        if (event.totalAvailableTickets < totalMemberCount) {
            return res.status(400).json({ message: "Not enough tickets available for this event." });
        }

        // Calculate tax amounts
        const taxDetails = event.taxTypes.map(taxType => {
            const taxAmount = (subtotal * taxType.percentage) / 100;
            return {
                taxType: taxType.name,
                taxRate: taxType.percentage,
                taxAmount: Math.round(taxAmount * 100) / 100,
            };
        });

        const totalTaxAmount = taxDetails.reduce((acc, tax) => acc + tax.taxAmount, 0);
        const totalAmount = subtotal + totalTaxAmount;


        if (primaryMemberDetails.creditLimit > 0 && primaryMemberDetails.creditLimit < totalAmount) {
            return res.status(400).json({ message: "Your credit limit is less than the purchase amount. Please contact the club." });
        }

        const eventMemberPrice = {
            primaryMemberPrice: event ? event.primaryMemberPrice : 0,
            dependentMemberPrice: event ? event.dependentMemberPrice : 0,
            guestMemberPrice: event ? event.guestMemberPrice : 0,
            kidsMemberPrice: event ? event.kidsMemberPrice : 0,
            spouseMemberPrice: event ? event.spouseMemberPrice : 0,
            seniorDependentMemberPrice: event ? event.seniorDependentMemberPrice : 0
        }

        // Prepare the response data
        const bookingDetails = {
            eventId,
            primaryMemberId,
            dependents: dependents || [],
            guests: guests || [],
            counts,
            eventMemberPrice,
            ticketDetails: {
                ...ticketDetails,
                taxTypes: taxDetails,
                subtotal: Math.round(subtotal),
                taxAmount: Math.round(totalTaxAmount),
                totalAmount: Math.round(totalAmount),
            },
            paymentStatus: "Pending",
            bookingStatus: "Pending",
        };

        return res.status(200).json({
            message: "Booking details calculated successfully.",
            bookingDetails,
        });

    } catch (error) {
        console.error("Error calculating booking details:", error);
        return res.status(500).json({ message: "An error occurred while calculating the event booking details.", error: error.message });
    }
};

// const getAllBookings = async (req, res) => {
//     try {
//         let { filterType, customStartDate, customEndDate, bookingStatus, userId, eventId, page, limit } = req.query;

//         // Convert pagination parameters
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         const skip = (page - 1) * limit;

//         let filter = { isDeleted: false, deletedAt: null };

//         // Add filters
//         if (bookingStatus) {
//             filter.bookingStatus = bookingStatus;
//         }
//         if (userId) {
//             filter.primaryMemberId = userId;
//         }
//         if (eventId) {
//             filter.eventId = eventId;
//         }

//         // Handle date filters
//         if (filterType) {
//             const today = moment().startOf("day");

//             switch (filterType) {
//                 case "today":
//                     filter.createdAt = { $gte: today.toDate(), $lt: moment(today).endOf("day").toDate() };
//                     break;
//                 case "last7days":
//                     filter.createdAt = { $gte: moment(today).subtract(7, "days").toDate(), $lt: today.toDate() };
//                     break;
//                 case "last30days":
//                     filter.createdAt = { $gte: moment(today).subtract(30, "days").toDate(), $lt: today.toDate() };
//                     break;
//                 case "last3months":
//                     filter.createdAt = { $gte: moment(today).subtract(3, "months").toDate(), $lt: today.toDate() };
//                     break;
//                 case "last6months":
//                     filter.createdAt = { $gte: moment(today).subtract(6, "months").toDate(), $lt: today.toDate() };
//                     break;
//                 case "last1year":
//                     filter.createdAt = { $gte: moment(today).subtract(1, "year").toDate(), $lt: today.toDate() };
//                     break;
//                 case "currentMonth":
//                     filter.createdAt = {
//                         $gte: moment().startOf("month").hour(0).minute(1).second(0).toDate(),
//                         $lt: moment().endOf("month").hour(23).minute(59).second(59).toDate(),
//                     };
//                     break;
//                 case "custom":
//                     if (!customStartDate || !customEndDate) {
//                         return res.status(400).json({ message: "Custom date range requires both start and end dates." });
//                     }
//                     filter.createdAt = {
//                         $gte: moment(customStartDate, "YYYY-MM-DD").startOf("day").toDate(),
//                         $lt: moment(customEndDate, "YYYY-MM-DD").endOf("day").toDate(),
//                     };
//                     break;
//                 default:
//                     break;
//             }
//         }

//         // Get total count of matching bookings
//         const totalBookings = await EventBooking.countDocuments(filter);
//         const totalPages = Math.ceil(totalBookings / limit);

//         // Fetch paginated bookings
//         const bookings = await EventBooking.find(filter)
//             .select("-allDetailsQRCode -primaryMemberQRCode -dependents.qrCode -dependents.uniqueQRCode -guests.qrCode -guests.uniqueQRCode")
//             .populate("eventId", "eventTitle eventStartDate eventEndDate primaryMemberPrice dependentMemberPrice guestMemberPrice kidsMemberPrice spouseMemberPrice seniorDependentMemberPrice ")
//             .populate("primaryMemberId", "memberId name relation")
//             .populate("dependents.userId", "memberId name relation")
//             .sort({ createdAt: -1 })  // Sorting in MongoDB instead of using `.reverse()`
//             .skip(skip)
//             .limit(limit)
//             .lean(); // Convert to plain JavaScript object

//         return res.status(200).json({
//             message: "Bookings fetched successfully",
//             bookings,
//             pagination: {
//                 currentPage: page,
//                 totalPages,
//                 totalBookings,
//                 pageSize: limit,
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching bookings:", error);
//         return res.status(500).json({ message: "An error occurred while fetching bookings", error: error.message });
//     }
// };

const getAllBookings = async (req, res) => {
    try {
        let { filterType, customStartDate, customEndDate, bookingStatus, userId, eventId, page, limit, exportData } = req.query;

        // Convert pagination parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let filter = { isDeleted: false, deletedAt: null };

        // Add filters
        if (bookingStatus) filter.bookingStatus = bookingStatus;
        if (userId) filter.primaryMemberId = userId;
        if (eventId) filter.eventId = eventId;

        // Handle date filters
        if (filterType) {
            const today = moment().startOf("day");

            switch (filterType) {
                case "today":
                    filter.createdAt = { $gte: today.toDate(), $lt: moment(today).endOf("day").toDate() };
                    break;
                case "last7days":
                    filter.createdAt = { $gte: moment(today).subtract(7, "days").toDate(), $lt: today.toDate() };
                    break;
                case "last30days":
                    filter.createdAt = { $gte: moment(today).subtract(30, "days").toDate(), $lt: today.toDate() };
                    break;
                case "last3months":
                    filter.createdAt = { $gte: moment(today).subtract(3, "months").toDate(), $lt: today.toDate() };
                    break;
                case "last6months":
                    filter.createdAt = { $gte: moment(today).subtract(6, "months").toDate(), $lt: today.toDate() };
                    break;
                case "last1year":
                    filter.createdAt = { $gte: moment(today).subtract(1, "year").toDate(), $lt: today.toDate() };
                    break;
                case "currentMonth":
                    filter.createdAt = {
                        $gte: moment().startOf("month").hour(0).minute(1).second(0).toDate(),
                        $lt: moment().endOf("month").hour(23).minute(59).second(59).toDate(),
                    };
                    break;
                case "custom":
                    if (!customStartDate || !customEndDate) {
                        return res.status(400).json({ message: "Custom date range requires both start and end dates." });
                    }
                    filter.createdAt = {
                        $gte: moment(customStartDate, "YYYY-MM-DD").startOf("day").toDate(),
                        $lt: moment(customEndDate, "YYYY-MM-DD").endOf("day").toDate(),
                    };
                    break;
                default:
                    break;
            }
        }

        // **📌 Aggregate Total Bookings Count**
        const totalBookings = await EventBooking.countDocuments(filter);
        const totalPages = Math.ceil(totalBookings / limit);

        // **📌 Export All Data if Requested (No Pagination)**
        if (exportData === "true") {
            console.log("📥 Exporting all event bookings...");

            const allBookings = await EventBooking.find(filter)
                .select("-allDetailsQRCode -primaryMemberQRCode -dependents.qrCode -dependents.uniqueQRCode -guests.qrCode -guests.uniqueQRCode")
                .populate("eventId", "eventTitle eventStartDate eventEndDate primaryMemberPrice dependentMemberPrice guestMemberPrice kidsMemberPrice spouseMemberPrice seniorDependentMemberPrice")
                .populate("primaryMemberId", "memberId name relation")
                .populate("dependents.userId", "memberId name relation")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                message: "All event bookings fetched successfully for export.",
                totalBookings,
                bookings: allBookings,
            });
        }

        // **📌 Paginated Query**
        const bookings = await EventBooking.find(filter)
            .select("-allDetailsQRCode -primaryMemberQRCode -dependents.qrCode -dependents.uniqueQRCode -guests.qrCode -guests.uniqueQRCode")
            .populate("eventId", "eventTitle eventStartDate eventEndDate primaryMemberPrice dependentMemberPrice guestMemberPrice kidsMemberPrice spouseMemberPrice seniorDependentMemberPrice")
            .populate("primaryMemberId", "memberId name relation")
            .populate("dependents.userId", "memberId name relation")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // **📌 Return Paginated Response**
        return res.status(200).json({
            message: "Bookings fetched successfully",
            totalBookings,
            bookings,
            pagination: {
                currentPage: page,
                totalPages,
                totalBookings,
                pageSize: limit,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching event bookings:", error);
        return res.status(500).json({ message: "❌ Internal server error", error: error.message });
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
        if (booking.counts.primaryMemberCount > 0) {
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
        }


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

        // if (updateData.paymentStatus && !validPaymentStatuses.includes(updateData.paymentStatus)) {
        //     return res.status(400).json({ message: 'Invalid paymentStatus value.' });
        // }

        // Find the event booking by bookingId
        const booking = await EventBooking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        const event = await Event.findById(booking.eventId).populate("taxTypes");
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // Update the booking with only the fields provided in the request body
        const updatedBooking = await EventBooking.findByIdAndUpdate(
            bookingId,
            { $set: updateData },  // Only update the fields present in updateData
            { new: true } // Return the updated document
        );

        // Find the billing record by ID and update it to mark as deleted

        // Find and update the associated Billing document for this event booking
        await Billing.findOneAndUpdate(
            { 'serviceDetails.eventBooking': bookingId }, // Find by eventBooking reference
            {
                deletedAt: updateData.bookingStatus === 'Cancelled' ? new Date() : null,
                isDeleted: updateData.bookingStatus === 'Cancelled',
                // paymentStatus: updateData.paymentStatus || 'Due', // Update payment status if provided
                // status: updateData.bookingStatus === 'Cancelled' ? 'Cancelled' : 'Active'
            },
            { new: true } // Return the updated document
        );

        // Send confirmation email
        const memberData = await EventBooking.findById(updatedBooking._id)
            .populate("eventId")
            .populate("primaryMemberId")
            .populate("dependents.userId");


        let primaryName;
        let primaryEmail;
        let primaryContact;

        // Send email to primary member
        if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
            primaryName = memberData?.primaryMemberId?.name
            primaryEmail = memberData?.primaryMemberId?.email
            primaryContact = memberData?.primaryMemberId?.mobileNumber
        } else {
            primaryName = member.parentUserId.name
            primaryEmail = member.parentUserId.email
            primaryContact = member.parentUserId.mobileNumber
        }


        const templateData = {
            uniqueQRCode: memberData.counts.primaryMemberCount > 0 ? memberData.uniqueQRCode : memberData.allDetailsUniqueQRCode,
            qrCode: memberData.allDetailsQRCode, // Base64 string for QR Code
            eventTitle: memberData.eventId ? memberData.eventId.eventTitle : "",
            eventDate: memberData.eventId ? memberData.eventId.eventStartDate.toDateString() : "",
            bookedBy: memberData?.primaryMemberId?.name,
            memberShipId: memberData?.primaryMemberId?.memberId,
            memberContact: memberData?.primaryMemberId?.mobileNumber,
            primaryName: primaryName,
            primaryEmail: primaryEmail,
            primaryContact: primaryContact,
            familyMembers: memberData.dependents.length > 0
                ? memberData.dependents.map(dep => ({ name: dep.userId.name, email: dep.userId.email, contact: dep.userId.mobileNumber, relation: dep.userId.relation }))
                : [],
            guests: memberData.guests.length > 0
                ? memberData.guests.map(guest => ({
                    name: guest.name,
                    email: guest.email,
                    contact: guest.phone,
                }))
                : [],
            taxTypes: booking.ticketDetails.taxTypes.length > 0
                ? booking.ticketDetails.taxTypes.map(taxType => ({
                    taxType: taxType.taxType || "N/A",
                    taxRate: taxType.taxRate || 0,
                    taxAmount: taxType.taxAmount || 0,
                }))
                : [],
            subtotal: booking.ticketDetails.subtotal.toFixed(2),
            taxAmount: booking.ticketDetails.taxAmount.toFixed(2),
            totalAmount: booking.ticketDetails.totalAmount.toFixed(2),
        };

        const emailTemplate = emailTemplates.eventBookingCanclled;
        const htmlBody = eventrenderTemplate(emailTemplate.body, templateData);
        const subject = eventrenderTemplate(emailTemplate.subject, templateData);

        const emailDependentTemplate = emailTemplates.eventDependentCanclled;
        const emailGuestTemplate = emailTemplates.eventGuestCanclled;
        const subjectDependent = eventrenderTemplate(emailDependentTemplate.subject, templateData);


        // Send email to primary member
        let primaryMemberEmail;
        if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
            primaryMemberEmail = memberData.primaryMemberId.email;
        } else {
            const member = await User.findById(memberData.primaryMemberId).populate("parentUserId");
            primaryMemberEmail = member.parentUserId.email;
        }

        // Prepare email content
        const emailAttachments = memberData.counts.primaryMemberCount > 0
            ? [
                {
                    filename: "qrCodeImage.png", // Corrected filename
                    content: Buffer.from(
                        memberData.primaryMemberQRCode.split(",")[1],
                        "base64"
                    ), // Convert primary member QR code to Buffer
                    encoding: "base64",
                    cid: "qrCodeImage", // Inline CID for embedding in email
                },
            ]
            : [
                {
                    filename: "qrCodeImage.png", // Corrected filename
                    content: Buffer.from(
                        memberData.allDetailsQRCode.split(",")[1],
                        "base64"
                    ), // Convert all details QR code to Buffer
                    encoding: "base64",
                    cid: "qrCodeImage", // Inline CID for embedding in email
                },
            ];


        await sendEmail(
            primaryMemberEmail,
            subject,
            htmlBody,
            emailAttachments
        );


        // Prepare dependents and guests with QR codes
        const preparedDependents = memberData.dependents
            ? memberData.dependents.map(dep => ({
                userId: dep.userId,
                qrCode: dep.qrCode,
                uniqueQRCode: dep.uniqueQRCode,
            }))
            : [];
        const preparedGuests = memberData.guests
            ? memberData.guests.map(guest => ({
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                qrCode: guest.qrCode,
                uniqueQRCode: guest.uniqueQRCode,
            }))
            : [];

        // const admins = await Admin.find({ role: 'admin', isDeleted: false });
        const admins = await Department.find({ departmentName: 'Events', isDeleted: false });
        for (const admin of admins) {
            await sendEmail(admin.email, subject, htmlBody, [
                {
                    filename: "qrCodeImage.png", // Corrected filename
                    content: Buffer.from(
                        booking.allDetailsQRCode.split(",")[1],
                        "base64"
                    ), // Convert all details QR code to Buffer
                    encoding: "base64",
                    cid: "qrCodeImage", // Inline CID for embedding in email
                },
            ]);
        }

        // Send emails to dependents
        for (const dependent of preparedDependents || []) {
            const user = await User.findById(dependent.userId);
            if (user) {
                // Generate a customized email body for the dependent
                const dependentTemplateData = {
                    ...templateData,
                    uniqueQRCode: dependent.uniqueQRCode, // Dependent's unique QR Code
                    dependentName: user.name,
                    dependentMail: user.email,
                    dependentContact: user.mobileNumber,
                    dependentrelation: user.relation,
                };
                const htmlDependentBody = eventrenderDependentTemplate(emailDependentTemplate.body, dependentTemplateData);

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
                    guestName: guest.name,
                    guestEmail: guest.email,
                    guestContact: guest.phone
                };
                const htmlGuestBody = eventrenderDependentTemplate(emailGuestTemplate.body, guestTemplateData);

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

        // Call the createNotification function
        await createNotification({
            title: `${memberData.eventId.eventTitle} - Event Booking Is ${memberData.bookingStatus}`,
            send_to: "User",
            push_message: "Your Event Booking Is Cancelled.",
            department: "eventBooking",
            departmentId: memberData._id
        });

        let primaryMemberDetails = await User.findById(memberData.primaryMemberId);
        // If the member is not primary, fetch the actual primary member
        if (primaryMemberDetails.relation !== "Primary" && primaryMemberDetails.parentUserId !== null) {
            primaryMemberDetails = await User.findById(primaryMemberDetails.parentUserId);
            if (!primaryMemberDetails) {
                return res.status(404).json({ message: "Primary member not found for the provided member." });
            }
        }

        if (primaryMemberDetails.creditLimit > 0) {
            primaryMemberDetails.creditLimit = primaryMemberDetails.creditLimit + memberData.ticketDetails.totalAmount
            await primaryMemberDetails.save();
        }

        let totalMemberCount = Object.values(memberData.counts).reduce((acc, val) => acc + val, 0);

        // Update the available tickets in the Event schema
        // Update available tickets in the database
        event.allottedTicketsMember += memberData.counts.primaryMemberCount + memberData.counts.dependentMemberCount + memberData.counts.kidsMemberCount + memberData.counts.seniorDependentMemberCount + memberData.counts.spouseMemberCount;
        event.allottedTicketsGuest += memberData.counts.guestMemberCount;
        event.totalAvailableTickets += totalMemberCount;

        await event.save();


        return res.status(200).json({
            message: 'Booking updated successfully.',
            updatedBooking
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({ message: 'An error occurred while updating the booking.', error });
    }
};


// const getBookingDetails = async (req, res) => {
//     try {
//         const { userId } = req.user;
//         // Find all bookings for the member, ensuring they are not deleted, and sorted by createdAt in descending order
//         const bookings = await EventBooking.find({ primaryMemberId: userId, isDeleted: false, deletedAt: null })
//             .populate("eventId")
//             .populate("primaryMemberId")
//             .populate("dependents.userId") // Populate dependents
//             .sort({ createdAt: -1 }); // Sort by createdAt in descending order

//         if (bookings.length === 0) {
//             return res.status(404).json({ message: 'No bookings found or all bookings have been deleted' });
//         }

//         // Format the booking details for each booking
//         const formattedBookings = bookings.map(booking => {
//             const formattedBooking = {
//                 _id: booking._id,
//                 eventImage: booking.eventId ? booking.eventId.eventImage : "",
//                 ticketDetails: booking.ticketDetails,
//                 memberDetails: [], // Array to hold all members (primary, dependents, and guests)
//                 allDetailsUniqueQRCode: booking.allDetailsUniqueQRCode, // QR code for all details
//                 allDetailsQRCode: booking.allDetailsQRCode, // QR code for all details
//                 paymentStatus: booking.paymentStatus,
//                 bookingStatus: booking.bookingStatus,
//                 isDeleted: booking.isDeleted,
//                 createdAt: booking.createdAt,
//                 updatedAt: booking.updatedAt,
//             };

//             // Add primary member to memberDetails array
//             formattedBooking.memberDetails.push({
//                 _id: booking.primaryMemberId._id,
//                 name: booking.primaryMemberId.name,
//                 email: booking.primaryMemberId.email,
//                 mobileNumber: booking.primaryMemberId.mobileNumber,
//                 memberId: booking.primaryMemberId.memberId,
//                 relation: booking.primaryMemberId.relation,
//                 profilePicture: booking.primaryMemberId.profilePicture,
//                 type: booking.primaryMemberId.relation,
//                 uniqueQRCode: booking.uniqueQRCode, // Primary member QR code
//                 qrCode: booking.primaryMemberQRCode, // Primary member QR code
//             });

//             // Add dependents to memberDetails array
//             booking.dependents.forEach(dep => {
//                 formattedBooking.memberDetails.push({
//                     _id: dep.userId._id,
//                     name: dep.userId.name,
//                     email: dep.userId.email,
//                     mobileNumber: dep.userId.mobileNumber,
//                     memberId: dep.userId.memberId,
//                     relation: dep.userId.relation,
//                     profilePicture: dep.userId.profilePicture,
//                     type: dep.type,
//                     uniqueQRCode: dep.uniqueQRCode, // Dependent QR code
//                     qrCode: dep.qrCode, // Dependent QR code
//                 });
//             });

//             // Add guests to memberDetails array
//             booking.guests.forEach(guest => {
//                 formattedBooking.memberDetails.push({
//                     _id: guest._id,
//                     name: guest.name,
//                     email: guest.email,
//                     phone: guest.phone,
//                     type: guest.type,
//                     uniqueQRCode: guest.uniqueQRCode, // Guest QR code
//                     qrCode: guest.qrCode, // Guest QR code
//                 });
//             });

//             return formattedBooking;
//         });

//         // Return the response with formatted bookings
//         return res.status(200).json({
//             message: 'Bookings fetched successfully',
//             bookings: formattedBookings,
//         });

//     } catch (error) {
//         console.error('Error Getting bookings:', error);
//         return res.status(500).json({ message: 'An error occurred while getting the bookings.', error });
//     }
// };


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
        const formattedBookings = await Promise.all(
            bookings.map(async (booking) => {
                const formattedBooking = {
                    _id: booking._id,
                    eventName: booking.eventId ? booking.eventId.eventTitle : "",
                    eventImage: booking.eventId ? booking.eventId.eventImage : "",
                    eventDate: booking.eventId ? booking.eventId.eventStartDate : "",
                    eventStartTime: booking.eventId ? booking.eventId.startTime : "",
                    eventEndTime: booking.eventId ? booking.eventId.endTime : "",
                    bookedBy: booking.primaryMemberId ? booking.primaryMemberId.name : "",
                    rsvpStatus: booking.eventId && booking.bookingStatus === "Confirmed" ? "Attending" : "N/A",
                    eventMemberPrice: {
                        primaryMemberPrice: booking.eventId ? booking.eventId.primaryMemberPrice : 0,
                        dependentMemberPrice: booking.eventId ? booking.eventId.dependentMemberPrice : 0,
                        guestMemberPrice: booking.eventId ? booking.eventId.guestMemberPrice : 0,
                        kidsMemberPrice: booking.eventId ? booking.eventId.kidsMemberPrice : 0,
                        spouseMemberPrice: booking.eventId ? booking.eventId.spouseMemberPrice : 0,
                        seniorDependentMemberPrice: booking.eventId ? booking.eventId.seniorDependentMemberPrice : 0
                    },
                    ticketDetails: booking.ticketDetails,
                    memberDetails: [], // Array to hold all members (primary, dependents, and guests)
                    allDetailsUniqueQRCode: booking.allDetailsUniqueQRCode,
                    allDetailsQRCode: booking.allDetailsQRCode,
                    paymentStatus: booking.paymentStatus,
                    bookingStatus: booking.bookingStatus,
                    isDeleted: booking.isDeleted,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt,
                };

                // Function to check attendance status based on QR Code
                const checkAttendanceStatus = async (eventId, qrCode) => {
                    const attendanceRecord = await EventAttendance.findOne({ eventId, qrCode });
                    return attendanceRecord && attendanceRecord.attendanceStatus === "Present"
                        ? "Authenticated"
                        : "Not Authenticated";
                };

                // Add primary member to memberDetails array
                if (booking.counts.primaryMemberCount > 0) {

                    formattedBooking.memberDetails.push({
                        _id: booking.primaryMemberId._id,
                        name: booking.primaryMemberId.name,
                        email: booking.primaryMemberId.email,
                        mobileNumber: booking.primaryMemberId.mobileNumber,
                        memberId: booking.primaryMemberId.memberId,
                        relation: booking.primaryMemberId.relation,
                        profilePicture: booking.primaryMemberId.profilePicture,
                        type: booking.primaryMemberId.relation,
                        uniqueQRCode: booking.uniqueQRCode,
                        attendanceStatus: await checkAttendanceStatus(booking.eventId._id, booking.uniqueQRCode),
                        qrCode: booking.primaryMemberQRCode,
                    });
                }

                // Add dependents to memberDetails array
                for (const dep of booking.dependents) {
                    formattedBooking.memberDetails.push({
                        _id: dep.userId._id,
                        name: dep.userId.name,
                        email: dep.userId.email,
                        mobileNumber: dep.userId.mobileNumber,
                        memberId: dep.userId.memberId,
                        relation: dep.userId.relation,
                        profilePicture: dep.userId.profilePicture,
                        type: dep.type,
                        uniqueQRCode: dep.uniqueQRCode,
                        attendanceStatus: await checkAttendanceStatus(booking.eventId._id, dep.uniqueQRCode),
                        qrCode: dep.qrCode,
                    });
                }

                // Add guests to memberDetails array
                for (const guest of booking.guests) {
                    formattedBooking.memberDetails.push({
                        _id: guest._id,
                        name: guest.name,
                        email: guest.email,
                        phone: guest.phone,
                        type: guest.type,
                        uniqueQRCode: guest.uniqueQRCode,
                        attendanceStatus: await checkAttendanceStatus(booking.eventId._id, guest.uniqueQRCode),
                        qrCode: guest.qrCode,
                    });
                }

                return formattedBooking;
            })
        );

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
    getBookingDetails,
    getAllEventsList
}