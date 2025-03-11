const crypto = require("crypto");
const SmtpSecret = require("../../models/SmtpSecret");
const { encrypt, decrypt } = require("../../utils/helper");

// // Define a secret key for encryption (store this in your environment variables)
// // const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
// const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32); // 32-byte key
// const IV_LENGTH = 16; // Initialization vector length

// // Utility function to encrypt text
// const encrypt = (text) => {
//     const iv = crypto.randomBytes(IV_LENGTH);
//     const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
//     let encrypted = cipher.update(text);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
// };

// // Utility function to decrypt text
// const decrypt = (text) => {
//     const [iv, encryptedText] = text.split(":");
//     const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, "hex"));
//     let decrypted = decipher.update(Buffer.from(encryptedText, "hex"));
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
//     return decrypted.toString();
// };

// Create or Update SMTP Secrets
const configureSmtp = async (req, res) => {
    try {
        const { host, port, username, password, encryption, smtpFrom } = req.body;

        const { role } = req.user;

        if (role !== "admin") {
            return res.status(400).json({ message: "You Are Not Authenticate Admin" });
        }

        if (!host || !port || !username || !password || !smtpFrom) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Encrypt the password before saving
        const encryptedPassword = encrypt(password);

        // Check if an SMTP configuration already exists
        const existingConfig = await SmtpSecret.findOne();
        if (existingConfig) {
            // Update existing configuration
            existingConfig.host = host;
            existingConfig.port = port;
            existingConfig.username = username;
            existingConfig.password = encryptedPassword; // Save the encrypted password
            existingConfig.encryption = encryption || existingConfig.encryption;
            existingConfig.smtpFrom = smtpFrom;

            await existingConfig.save();

            return res.status(200).json({ message: "SMTP configuration updated successfully", smtp: existingConfig });
        }

        // Create a new configuration
        const newConfig = new SmtpSecret({
            host,
            port,
            username,
            password: encryptedPassword, // Save the encrypted password
            encryption,
            smtpFrom,
            createdBy: req.user.userId, // Assuming `req.user` contains the authenticated admin's details
        });

        await newConfig.save();
        return res.status(201).json({ message: "SMTP configuration created successfully", smtp: newConfig });
    } catch (error) {
        console.error("Error configuring SMTP:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Fetch SMTP Configuration
const getSmtpConfig = async (req, res) => {
    try {

        const { role } = req.user;

        // if (role !== "admin") {
        //     return res.status(400).json({ message: "You Are Not Authenticate Admin" });
        // }

        const config = await SmtpSecret.findOne();
        if (!config) {
            return res.status(404).json({ message: "No SMTP configuration found" });
        }

        // Decrypt the password before sending it in the response
        const decryptedPassword = decrypt(config.password);

        return res.status(200).json({
            smtp: {
                host: config.host,
                port: config.port,
                username: config.username,
                password: decryptedPassword, // Send decrypted password
                encryption: config.encryption,
                smtpFrom: config.smtpFrom,
            },
        });
    } catch (error) {
        console.error("Error fetching SMTP configuration:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {
    configureSmtp,
    getSmtpConfig,
};
