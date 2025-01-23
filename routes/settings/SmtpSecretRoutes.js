const { configureSmtp, getSmtpConfig } = require("../../controllers/settings/SmtpSecretController");
const { verifyToken } = require("../../utils/common");

module.exports = (router) => {
    // Route to configure SMTP settings
    router.post("/smtp/configure", verifyToken, configureSmtp);

    // Route to fetch SMTP settings
    router.get("/smtp/config", verifyToken, getSmtpConfig);
};
