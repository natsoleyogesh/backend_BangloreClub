
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
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error);
    }
};

// sendOTPViaPOST(7440308229, 123456);
