
const axios = require("axios");

export const sendOTPViaPOST = async (mobileNumber, message) => {

    console.log(mobileNumber, message, "otptp")
    const apiURL = process.env.WAY2MINT_API_URL;
    const payload = {
        username: process.env.WAY2MINT_USERNAME, // Replace with your username
        password: process.env.WAY2MINT_PASSWORD, // Replace with your password
        to: `${mobileNumber}`, // Replace with recipient's mobile number
        from: process.env.WAY2MINT_SENDER_ID, // Replace with your sender ID
        text: message, // `Dear Member, your OTP for verification code is ${otp} Please do not share this OTP with anyone. BCLUB`, // Replace with the generated OTP
        data4: `${process.env.WAY2MINT_ENTITY_ID},${process.env.WAY2MINT_TELEMARKETER_ID}` // Entity ID and Telemarketer ID
    };

    console.log(payload, "payload")

    try {
        const response = await axios.post(apiURL, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        // const response = await axios.get("https://apibulksms.way2mint.com/pushsms?username=blrclb&password=bxOZ-59-&to=7354719774&from=BLRCLB&text=Dear Member, your OTP for verification code is 123456 Please do not share this OTP with anyone. BCLUB&data4=1007997957921340017,1702173216915572636")
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error);
    }
};

// sendOTPViaPOST(7440308229, 123456);


// // https://apibulksms.way2mint.com/pushsms?username=blrclb&password=bxOZ-59-&to=919340614804&from=BLRCLB&text=As Bangalore continues to battle the Novel Coronavirus, COVID-19, we request all members to take every precaution to safeguard their own health and that of their fellow club members. To this end, we continue to require members to wear masks while in the club. We also request that members avoid congregating or smoking in the Snooker / Billiards corridor&data4=
//  1001123290854935269,1702173216915572636


// const twilio = require('twilio');

// const sid = 'ACaa85101cd19233181aaa661509a84f54'; // Your Twilio Account SID
// const token = '392bf6e75fab1307356f249effeb936f'; // Your Twilio Auth Token

// const client = twilio(sid, token);

// // Send WhatsApp message
// const sendWhatsAppMessage = async () => {
//     try {
//         const message = await client.messages.create({
//             body: 'Hello! This is a test message from Twilio WhatsApp API.',
//             from: 'whatsapp:+15557048730', // Twilio's Sandbox WhatsApp number
//             to: 'whatsapp:+918109784437' // Replace with the recipient's WhatsApp number
//         });

//         console.log('Message sent successfully:', message);
//     } catch (error) {
//         console.error('Failed to send message:', error);
//     }
// };

// // Call the function to send the message
// sendWhatsAppMessage();
