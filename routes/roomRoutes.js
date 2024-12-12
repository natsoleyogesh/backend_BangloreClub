const { addRoom, getAllRooms, getRoomById, updateRoom, deleteRoom, uploadRoomImage, deleteRoomImage, getAllAvailableRooms, createRoomBooking, getAllBookings, getBookingById, deleteBooking, getMyBookings, updateRoomAllocation, createRoomBookingDetails } = require("../controllers/roomController");
const { verifyToken } = require("../utils/common");
const { roomUpload } = require("../utils/upload");

module.exports = (router) => {
    router.post("/room/create", roomUpload.array('images', 5), addRoom);
    router.get("/room/all-rooms", getAllRooms);
    router.get("/room/:id", getRoomById);
    router.put("/room/update-room/:id", updateRoom);
    router.delete("/room/delete-room/:id", deleteRoom);
    router.put("/room/upload-images/:roomId", roomUpload.array('images', 5), uploadRoomImage);
    router.delete("/room/delete-image/:roomId/:index", deleteRoomImage);
    router.get("/room", getAllAvailableRooms);

    // CREATE ROOM BOOKING ROUTES

    router.post("/room-booking/create", createRoomBooking);
    router.get("/room-bookings", getAllBookings);
    router.get("/room-booking/:bookingId", getBookingById);
    router.delete("/room-booking/:bookingId", deleteBooking);
    router.get("/roombooking/myBookings", verifyToken, getMyBookings);

    router.put("/room-booking/allocate-room/:bookingId", updateRoomAllocation);
    router.post("/room-booking/create-details", createRoomBookingDetails);

}