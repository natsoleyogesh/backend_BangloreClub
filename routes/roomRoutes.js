const { addRoom, getAllRooms, getRoomById, updateRoom, deleteRoom, uploadRoomImage, deleteRoomImage, getAllAvailableRooms } = require("../controllers/roomController");
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
}