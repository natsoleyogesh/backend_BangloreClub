
require("dotenv").config(); // Use dotenv for secure environment variable management
const nodemailer = require("nodemailer");

// Create a reusable transporter using SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_NAME || "pro.turbo-smtp.com",
    port: parseInt(process.env.SMTP_PORT, 10) || 587, // Port 25 //587
    secure: false, // For port 25, secure should be false
    auth: {
        user: process.env.SMTP_USERNAME || "kiran@mindworks.co.in",
        pass: process.env.SMTP_PASSWORD || "3JpZ8n42v*y", // Default password, replace with environment variable
    },
    debug: true,
    logger: true,
});

// // Create a reusable transporter using SMTP settings
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com", // Replace with your SMTP server (e.g., Gmail SMTP server)
//     port: 587, // Normal SMTP port for STARTTLS
//     secure: false, // Set false for STARTTLS
//     auth: {
//         user: "natsolyogesh@gmail.com", // Your email address
//         pass: "psdwfxussqwvasop", // Your email password
//     },
//     debug: true, // Enable debug output for troubleshooting
//     logger: true, // Enable logger for detailed logs
// });

// Example usage (optional)
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Connection Error:", error);
    } else {
        console.log("SMTP Server is ready to take messages:", success);
    }
});

const sendEmail = async (to, subject, htmlBody, attachments = []) => {
    try {
        const mailOptions = {
            from: `"Bangalore Club" <${process.env.SMTP_FROM || "secretary@bangaloreclub.com"}>`,
            to,
            subject,
            html: htmlBody,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};


module.exports = sendEmail;
