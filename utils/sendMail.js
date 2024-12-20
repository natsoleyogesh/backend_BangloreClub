const nodemailer = require("nodemailer");
const emailTemplates = require("./emailTemplates");

// Create a reusable transporter
const transporter = nodemailer.createTransport({
    service: "gmail", // or use your email service (SMTP settings)
    auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password", // Use environment variables for security
    },
});

// Function to send email with a template
const sendEmail = async (to, templateId, templateData = {}) => {
    try {
        // Get the email template
        const template = emailTemplates[templateId];

        if (!template) {
            throw new Error(`Template ID '${templateId}' not found.`);
        }

        // Replace placeholders in subject and body
        const subject = template.subject.replace(/{{(.*?)}}/g, (_, key) => templateData[key] || "");
        const body = template.body.replace(/{{(.*?)}}/g, (_, key) => templateData[key] || "");

        // Send the email
        const mailOptions = {
            from: '"Your App Name" <your-email@gmail.com>',
            to,
            subject,
            html: body,
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
