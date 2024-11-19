const QRCode = require('qrcode');

const generateQRCode = async (data) => {
    try {
        // Convert the data object to a JSON string and generate the QR code
        const qrCode = await QRCode.toDataURL(JSON.stringify(data));
        return qrCode;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};


const generateMultipleQRCodes = async (members) => {
    const qrCodes = [];
    for (const member of members) {
        const qrCode = await generateQRCode(member);
        qrCodes.push({
            ...member,
            qrCode, // Add the generated QR code to the member object
        });
    }
    return qrCodes;
};

module.exports = { generateQRCode, generateMultipleQRCodes };