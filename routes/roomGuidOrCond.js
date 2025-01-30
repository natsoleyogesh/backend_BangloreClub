const { configureRoomGuideline, getRoomGuideline } = require("../controllers/roomGuidOrCondition");
const { verifyToken } = require("../utils/common");


module.exports = (router) => {
    // Route to configure SMTP settings
    router.post("/room-guidline", verifyToken, configureRoomGuideline);

    // Route to fetch SMTP settings
    router.get("/room-guidlineOrCondition", verifyToken, getRoomGuideline);
};
