
const QRCode = require('qrcode');
const crypto = require("crypto");
// Helper function to generate a standard QR code from any data
const generateQRCode = async (data) => {
    try {
        // Convert the data object to a JSON string and generate the QR code
        const qrCode = await QRCode.toDataURL(JSON.stringify(data)); // Generate QR from JSON string
        return qrCode;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

// Helper function to generate unique QR codes for multiple members (primary, dependents, and guests)
const generateMultipleQRCodes = async (members) => {
    const qrCodes = [];

    // Loop through each member and generate a unique QR code
    for (const member of members) {
        // Generate a unique number (e.g., random 10-digit number)
        const uniqueNumber = Math.floor(Math.random() * 10000000000); // Generates a random 10-digit number
        const uniqueQRCodeData = `QR${uniqueNumber}`; // The unique QR code string (QR + 10-digit number)

        // Generate the QR code for the unique data
        const qrCode = await generateQRCode({ ...member, uniqueQRCodeData });

        // Push the member object with the generated QR code to the array
        qrCodes.push({
            ...member,
            uniqueQRCodeData, // Store the unique QR code data (QR+Number)
            qrCode,           // Store the actual QR code image data (base64 string)
        });
    }

    return qrCodes;
};


// const formatTimeTo12Hour = (time24) => {
//     // Split the 24-hour time into hours and minutes
//     const [hour, minute] = time24.split(':').map(Number);

//     // Determine AM or PM
//     const period = hour >= 12 ? 'PM' : 'AM';

//     // Convert to 12-hour format
//     const hour12 = hour % 12 || 12;

//     // Return the formatted time
//     return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
// };

const formatTimeTo12Hour = (time24) => {
    // Split the 24-hour time into hours and minutes
    const [hour, minute] = time24.split(':').map(Number);

    // Determine AM or PM
    const period = hour >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    const hour12 = hour % 12 || 12;  // Converts hour 0 to 12 for 12 AM

    // Return the formatted time
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};



// Define a secret key for encryption (store this in your environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32); // 32-byte key
const IV_LENGTH = 16; // Initialization vector length

// Utility function to encrypt text
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

// Utility function to decrypt text
const decrypt = (text) => {
    const [iv, encryptedText] = text.split(":");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, "hex"));
    let decrypted = decipher.update(Buffer.from(encryptedText, "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};


module.exports = { generateQRCode, generateMultipleQRCodes, formatTimeTo12Hour, encrypt, decrypt };
