const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, bookEvent, bookingDetails, getAllBookings, getBookingById, deleteBooking } = require("../controllers/eventController");
const { verifyToken } = require("../utils/common");
const { eventupload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/event/create", eventupload.single("eventImage"), createEvent);
    router.get("/event/all-events", getAllEvents);
    router.get("/event/get-event/:id", getEventById);
    router.put("/event/update-event/:id", eventupload.single("eventImage"), updateEvent);
    router.delete("/event/delete-event/:id", deleteEvent);

    // event bookings routes
    router.post("/event/book-event", bookEvent);
    router.post("/event/booking-details", bookingDetails);
    router.get("/event/all-bookings", getAllBookings);
    router.get("/event/booking-details/:bookingId", getBookingById);
    router.delete("/event/booking-delete/:bookingId", deleteBooking);

}