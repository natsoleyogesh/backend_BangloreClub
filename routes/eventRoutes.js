const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, bookEvent } = require("../controllers/eventController");
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
}