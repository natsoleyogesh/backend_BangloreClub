const { getActions, deleteActionLog, logUpdateQrCode, getQrCodeUpdateLogs, getApiLogs, deleteApiLog, addBookingDate, getBookingDate } = require("../../controllers/commonController");
const { verifyToken } = require("../../utils/common");

module.exports = (router) => {
    // Route to configure SMTP settings
    router.get("/actions", getActions);

    router.delete("/delete-action/:id", deleteActionLog);

    router.get("/qrUpdate-log", verifyToken, logUpdateQrCode);

    router.get("/get-qr-logs", verifyToken, getQrCodeUpdateLogs);

    router.get("/api-logs", getApiLogs);

    router.delete("/delete-api-log/:id", deleteApiLog);

    router.post("/add-or-update-booking-date", addBookingDate);

    router.get("/get-booking-date", getBookingDate);


};
