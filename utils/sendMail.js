require("dotenv").config();
const nodemailer = require("nodemailer");
const SmtpSecret = require("../models/SmtpSecret"); // Import the SMTP Secrets model
const { decrypt } = require("./helper");

const sendEmail = async (to, subject, htmlBody, attachments = [], cc = null) => {
    try {
        // Fetch SMTP secrets from the database
        const smtpDetails = await SmtpSecret.findOne();
        if (!smtpDetails) {
            throw new Error("SMTP configuration not found. Please configure it in the admin panel.");
        }

        // Decrypt the password
        const decryptedPassword = decrypt(smtpDetails.password);

        // Prepare SMTP configuration
        const smtpConfig = {
            host: smtpDetails.host,
            port: smtpDetails.port,
            username: smtpDetails.username,
            password: decryptedPassword,
            encryption: smtpDetails.encryption,
            smtpFrom: smtpDetails.smtpFrom,
        };

        // Create a reusable transporter using the fetched SMTP settings
        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.port === 465, // Use secure connection for port 465 (SSL)
            auth: {
                user: smtpConfig.username,
                pass: smtpConfig.password,
            },
            debug: true,
            logger: true,
        });

        // Verify SMTP connection
        transporter.verify((error, success) => {
            if (error) {
                console.error("SMTP Connection Error:", error);
            } else {
                console.log("SMTP Server is ready to take messages:", success);
            }
        });

        // Prepare email options
        const mailOptions = {
            // from: smtpConfig.smtpFrom,
            from: `"Bangalore Club" <${smtpConfig.smtpFrom}>`,
            to,
            subject,
            html: htmlBody,
            attachments,
            ...(cc ? { cc } : {}), // Add CC only if it's provided
        };

        // Check attachment sizes
        attachments.forEach((attachment, index) => {
            const sizeInBytes = Buffer.byteLength(attachment.content);
            const sizeInKB = (sizeInBytes / 1024).toFixed(2); // Convert to KB
            console.log(`Attachment ${index + 1} Size: ${sizeInBytes} bytes (${sizeInKB} KB)`);
        });

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);

        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        // throw error; // Re-throw the error for higher-level handling
    }
};

module.exports = sendEmail;