const { getActions, deleteActionLog, logUpdateQrCode, getQrCodeUpdateLogs } = require("../../controllers/commonController");
const { verifyToken } = require("../../utils/common");

module.exports = (router) => {
    // Route to configure SMTP settings
    router.get("/actions", getActions);

    router.delete("/delete-action/:id", deleteActionLog);

    router.get("/qrUpdate-log", verifyToken, logUpdateQrCode);

    router.get("/get-qr-logs", verifyToken, getQrCodeUpdateLogs)

};
