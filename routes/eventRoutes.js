const { markAttendance, getEventAttendance, getMemberDetailsFromQR } = require("../controllers/eventAttendanceController");
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, bookEvent, bookingDetails, getAllBookings, getBookingById, deleteBooking, getBookingDetailsById, updateBookingStatusAndPaymentStatus, getBookingDetails } = require("../controllers/eventController");
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
    router.get("/event/event-booking-details/:bookingId", getBookingById);
    router.delete("/event/booking-delete/:bookingId", deleteBooking);
    router.get("/event/booking-details/:bookingId", verifyToken, getBookingDetailsById);

    router.put("/event/booking-status/:bookingId", updateBookingStatusAndPaymentStatus);

    router.get("/event/allbookings", verifyToken, getBookingDetails);



    router.post("/mark-attendance", verifyToken, markAttendance);
    router.get("/get-attendance/:eventId", getEventAttendance);

    router.post("/getmember-details", getMemberDetailsFromQR);

    // router.post("/getmember-details-qrCode", getMemberDetailsFromQRCode);

}