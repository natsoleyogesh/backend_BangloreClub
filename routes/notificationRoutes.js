const { sendNotification, getNotification, deleteNotification } = require("../controllers/notificationController");
const { verifyToken } = require("../utils/common");
const { notificationUpload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/notification/send", notificationUpload.single("image"), sendNotification);
    router.get("/notifications", getNotification);
    router.delete("/notification/:id", deleteNotification);
}