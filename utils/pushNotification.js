const firebase = require('firebase-admin');
const serviceAccount = require('./clubbangaloreapp-firebase-adminsdk-fbsvc-0bce626d82.json');


const Notification = require('../models/notification');
const User = require('../models/user'); // Assuming User model exists for fetching FCM tokens
const BanquetBooking = require('../models/banquetBooking');
const RoomBooking = require('../models/roomBooking');
const EventBooking = require('../models/eventBooking');


firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    debug: true,
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


// const createNotification = async ({ title, send_to, push_message, department, departmentId = null, image = '' }) => {
//     try {
//         // Validate departmentId if department is not 'All', 'Event', or 'Offer'
//         if (!['All', 'Event', 'Offer', 'Notice'].includes(department) && !departmentId) {
//             throw new Error('Department ID is required for the specified department.');
//         }
//         // Save notification in database
//         const notification = new Notification({
//             send_to,
//             push_message,
//             department,
//             departmentId,
//             image,
//         });

//         await notification.save();

//         // Fetch user tokens based on recipient type
//         let allDeviceTokens = [];
//         if (send_to === 'All') {
//             const userTokens = await User.find({}, 'fcmToken').exec();
//             allDeviceTokens = userTokens.map((user) => user.fcmToken);
//         } else if (send_to === 'User') {
//             // Dynamically fetch the user based on department and departmentId
//             let userId = null;

//             // Determine the booking model based on department
//             const bookingModelMap = {
//                 RoomBooking: RoomBooking,
//                 EventBooking: EventBooking,
//                 BanquetBooking: BanquetBooking,
//                 // Add more models here as needed
//             };

//             const BookingModel = bookingModelMap[department];
//             if (!BookingModel) {
//                 throw new Error(`Invalid department specified: ${department}`);
//             }

//             // Fetch the booking document to get the userId
//             const booking = await BookingModel.findById(departmentId, 'primaryMemberId').exec();
//             if (!booking) {
//                 throw new Error(`No booking found with ID: ${departmentId}`);
//             }

//             userId = booking.primaryMemberId;

//             // Fetch the user's FCM token
//             const user = await User.findById(userId, 'fcmToken').exec();
//             if (user && user.fcmToken) {
//                 allDeviceTokens.push(user.fcmToken);
//             }
//         } else if (send_to === 'Admin') {
//             const adminTokens = await User.find({ role: 'Admin' }, 'fcmToken').exec();
//             allDeviceTokens = adminTokens.map((admin) => admin.fcmToken);
//         } else {
//             throw new Error('Invalid recipient type specified.');
//         }

//         // Prepare the notification payload
//         const payload = {
//             notification: {
//                 title: title,
//                 body: push_message,
//             },
//             data: {
//                 push_message,
//                 image,
//                 isAdd: 'true',
//             },
//         };

//         // Send push notification
//         const response = await pushNotification(allDeviceTokens, payload);

//         // Update notification with success and failure counts
//         notification.successCount = response.successCount || 0;
//         notification.failureCount = response.failureCount || 0;
//         await notification.save();

//         return {
//             message: 'Notification sent successfully.',
//             totalSuccess: response.successCount,
//             totalFailure: response.failureCount,
//         };
//     } catch (error) {
//         console.error('Error in createNotification:', error.message);
//         throw error;
//     }
// };

const createNotification = async ({ title, send_to, push_message, department, departmentId = null, image = '' }) => {
    try {
        if (!['All', 'Event', 'Offer', 'Notice'].includes(department) && !departmentId) {
            throw new Error('Department ID is required for the specified department.');
        }

        let scheduledTime = null;
        let isDelayed = false;

        // Delay notification by 30 minutes only for booking-related departments
        if (['eventBooking', 'RoomBooking', 'BanquetBooking'].includes(department)) {
            scheduledTime = new Date();
            scheduledTime.setMinutes(scheduledTime.getMinutes() + 2); // 30
            isDelayed = true;
        }

        const notification = new Notification({
            title,
            send_to,
            push_message,
            department,
            departmentId,
            image,
            scheduledTime,
        });

        await notification.save();

        // Fetch user tokens based on recipient type
        let allDeviceTokens = [];
        if (send_to === 'All') {
            const userTokens = await User.find({}, 'fcmToken').exec();
            allDeviceTokens = userTokens.map((user) => user.fcmToken);
        } else if (send_to === 'User') {
            let userId = null;

            const bookingModelMap = {
                RoomBooking: RoomBooking,
                eventBooking: EventBooking,
                BanquetBooking: BanquetBooking,
            };

            const BookingModel = bookingModelMap[department];
            if (!BookingModel) {
                throw new Error(`Invalid department specified: ${department}`);
            }

            const booking = await BookingModel.findById(departmentId, 'primaryMemberId').exec();
            if (!booking) {
                throw new Error(`No booking found with ID: ${departmentId}`);
            }

            userId = booking.primaryMemberId;

            const user = await User.findById(userId, 'fcmToken').exec();
            if (user && user.fcmToken) {
                allDeviceTokens.push(user.fcmToken);
            }
        } else if (send_to === 'Admin') {
            const adminTokens = await User.find({ role: 'Admin' }, 'fcmToken').exec();
            allDeviceTokens = adminTokens.map((admin) => admin.fcmToken);
        }

        const payload = {
            notification: {
                title: title,
                body: push_message,
            },
            data: {
                push_message,
                image,
                isAdd: 'true',
            },
        };

        // If it's not a delayed notification, send it immediately
        if (!isDelayed) {
            const response = await pushNotification(allDeviceTokens, payload);

            notification.successCount = response.successCount || 0;
            notification.failureCount = response.failureCount || 0;
            notification.isShow = true;
            notification.isSent = true;
            await notification.save();

            return {
                message: 'Notification sent successfully.',
                totalSuccess: response.successCount,
                totalFailure: response.failureCount,
            };
        }
    } catch (error) {
        console.error('Error in createNotification:', error.message);
        throw error;
    }
};

module.exports = {
    pushNotification,
    createNotification
};

