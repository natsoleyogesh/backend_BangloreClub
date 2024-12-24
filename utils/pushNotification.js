const firebase = require('firebase-admin');
const serviceAccount = require('./bangaloreclub-599ec-firebase-adminsdk-ojfrm-c3ae343b62.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
});
const pushNotification = async (deviceTokens, payload) => {
    try {
        const validDeviceTokens = deviceTokens.filter(
            (token) => token && token.trim() !== ''
        );

        if (validDeviceTokens.length === 0) {
            console.log('No valid device tokens found. Skipping notification.');
            return {
                successCount: 0,
                failureCount: 0,
                responses: [],
            };
        }

        console.log('Firebase Admin SDK Version:', firebase.SDK_VERSION);
        console.log('Available messaging methods:', Object.keys(firebase.messaging()));

        let successCount = 0;
        let failureCount = 0;
        const responses = [];

        for (const token of validDeviceTokens) {
            const message = {
                token, // Single device token
                notification: payload.notification,
                data: payload.data || {}, // Optional custom data
            };

            try {
                const response = await firebase.messaging().send(message);
                console.log(`Push notification sent successfully to ${token}`);
                successCount++;
                responses.push({ token, success: true, response });
            } catch (error) {
                console.error(`Error sending to token ${token}: ${error.message}`);
                failureCount++;
                responses.push({ token, success: false, error });
            }
        }

        return {
            successCount,
            failureCount,
            responses,
        };
    } catch (error) {
        console.error('Error sending FCM notification:', error);
        throw new Error('Failed to send push notification.');
    }
};


module.exports = {
    pushNotification,
};

