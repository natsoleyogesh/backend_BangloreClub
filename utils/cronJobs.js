const cron = require("node-cron");
const Notification = require("../models/notification");
const User = require("../models/user");
const BanquetBooking = require("../models/banquetBooking");
const RoomBooking = require("../models/roomBooking");
const EventBooking = require("../models/eventBooking");
const { pushNotification } = require("./pushNotification");

cron.schedule("* * * * *", async () => {
    console.log("🔍 Checking for delayed notifications...");

    try {
        const now = new Date();
        const notifications = await Notification.find({
            isSent: false,
            scheduledTime: { $lte: now }
        });

        if (notifications.length === 0) {
            console.log("✅ No pending delayed notifications.");
            return;
        }

        console.log(`⏳ Processing ${notifications.length} delayed notifications...`);

        for (const notification of notifications) {
            try {
                let allDeviceTokens = [];
                let successCount = 0;
                let failureCount = 0;

                console.log(`📢 Processing Notification: ${notification.title} | Department: ${notification.department}`);

                // Determine recipient tokens based on `send_to` type
                if (notification.send_to === 'All') {
                    const userTokens = await User.find({}, 'fcmToken').exec();
                    allDeviceTokens = userTokens.map((user) => user.fcmToken).filter(Boolean);
                } else if (notification.send_to === 'User') {
                    const bookingModelMap = {
                        RoomBooking: RoomBooking,
                        eventBooking: EventBooking,
                        BanquetBooking: BanquetBooking,
                    };

                    const BookingModel = bookingModelMap[notification.department];
                    if (!BookingModel) {
                        console.warn(`⚠️ Invalid department: ${notification.department}. Skipping.`);
                        continue;
                    }

                    // Fetch booking details and primary user's FCM token in one call
                    const booking = await BookingModel.findById(notification.departmentId)
                        .populate("primaryMemberId", "fcmToken")
                        .exec();

                    if (!booking || !booking.primaryMemberId || !booking.primaryMemberId.fcmToken) {
                        console.warn(`⚠️ No FCM token found for booking ID: ${notification.departmentId}. Skipping.`);
                        continue;
                    }

                    allDeviceTokens.push(booking.primaryMemberId.fcmToken);
                } else if (notification.send_to === 'Admin') {
                    const adminTokens = await User.find({ role: 'Admin' }, 'fcmToken').exec();
                    allDeviceTokens = adminTokens.map((admin) => admin.fcmToken).filter(Boolean);
                }

                if (allDeviceTokens.length === 0) {
                    console.warn(`⚠️ No valid device tokens found for notification: ${notification.title}. Skipping.`);
                    continue;
                }

                const payload = {
                    notification: {
                        title: notification.title,
                        body: notification.push_message,
                    },
                    data: {
                        push_message: notification.push_message,
                        image: notification.image || "",
                        isAdd: 'true',
                    },
                };

                console.log(`📤 Sending notification to ${allDeviceTokens.length} device(s)...`);

                // Send push notification
                const response = await pushNotification(allDeviceTokens, payload);

                // Update success and failure counts
                successCount = response.successCount || 0;
                failureCount = response.failureCount || 0;

                // Mark notification as sent only if there were successful deliveries
                notification.isSent = true;
                notification.successCount = successCount;
                notification.failureCount = failureCount;
                notification.isShow = true;
                await notification.save();

                console.log(`✅ Notification Sent: ${notification.title}`);
                console.log(`📊 Success: ${successCount}, ❌ Failure: ${failureCount}`);
            } catch (notifError) {
                console.error(`❌ Error processing notification "${notification.title}":`, notifError.message);
            }
        }
    } catch (error) {
        console.error("❌ Error processing delayed notifications:", error);
    }
});

console.log("🚀 Delayed notification scheduler is running...");

module.exports = cron;
