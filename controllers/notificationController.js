const Notification = require("../models/notification");
const User = require("../models/user");
const { createNotification } = require("../utils/pushNotification");


// // Send Notification API Handler
// const sendNotification = async (req, res) => {
//     try {
//         const { title, send_to, push_message, department } = req.body;

//         if (!send_to || !push_message) {
//             return res.status(400).json({
//                 message: 'Both "send_to" and "push_message" are required.',
//             });
//         }

//         // Handle file path if an image is uploaded
//         const filepath = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : '';

//         // Save notification in database
//         const savenotification = new Notification({
//             send_to,
//             push_message,
//             image: filepath,
//             department
//         });

//         await savenotification.save();

//         // Fetch user tokens based on recipient type
//         let allDeviceTokens = [];
//         if (send_to === 'All') {
//             const userTokens = await User.find({}, 'fcmToken').exec();
//             allDeviceTokens = userTokens.map((user) => user.fcmToken);
//         } else {
//             return res.status(400).json({
//                 message: 'Invalid recipient type specified.',
//             });
//         }

//         // Prepare the notification payload
//         const payload = {
//             notification: {
//                 title: title,
//                 body: push_message,
//             },
//             data: {
//                 push_message: push_message,
//                 image: filepath,
//                 isAdd: 'true',
//             },
//         };

//         // Send push notification
//         const response = await pushNotification(allDeviceTokens, payload);

//         // Update notification with success and failure counts
//         savenotification.successCount = response.successCount || 0;
//         savenotification.failureCount = response.failureCount || 0;
//         await savenotification.save();

//         // Response to client
//         return res.status(201).json({
//             message: 'Notification sent successfully.',
//             totalSuccess: response.successCount,
//             totalFailure: response.failureCount,
//         });
//     } catch (error) {
//         console.error('Error in sendNotification:', error.message);
//         return res.status(500).json({
//             message: 'Failed to send notification.',
//             error: error.message,
//         });
//     }
// };


const sendNotification = async (req, res) => {
    try {
        const { title, send_to, push_message, department, departmentId } = req.body;

        if (!send_to || !push_message) {
            return res.status(400).json({
                message: 'Both "send_to" and "push_message" are required.',
            });
        }

        // Handle file path if an image is uploaded
        const filepath = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : '';

        // Call the createNotification function
        const response = await createNotification({
            title,
            send_to,
            push_message,
            department,
            departmentId, // Include if department-specific notifications require a reference
            image: filepath,
        });

        // Respond to the client with the result
        return res.status(201).json(response);
    } catch (error) {
        console.error('Error in sendNotification:', error.message);
        return res.status(500).json({
            message: 'Failed to send notification.',
            error: error.message,
        });
    }
};

// const sendNotification = async (req, res) => {
//     try {
//         const { send_to, push_message } = req.body;
//         let filepath;

//         if (req.file) {
//             filepath = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : [];
//         } else {
//             filepath = "";
//         }

//         const savenotification = new Notification({
//             send_to,
//             push_message,
//             image: filepath
//         });

//         await savenotification.save();

//         const userTokens = await User.find(
//             {},
//             "fcmToken"
//         ).exec();
//         // const driverTokens = await DriverBasicDetailsModel.find(
//         //     {},
//         //     "deviceToken"
//         // ).exec();
//         const isAdd = true;
//         const message = {
//             notification: {
//                 title: "Bangalore Club",
//                 body: push_message,
//             },
//             data: {
//                 push_message: savenotification.push_message.toString(),
//                 image: savenotification.image.toString(),
//                 isAdd: isAdd.toString(),
//             },
//         };

//         let allDeviceTokens;

//         if (send_to === "All") {
//             const userDeviceTokens = userTokens.map(
//                 (user) => user.fcmToken
//             );
//             // const driverDeviceTokens = driverTokens.map(
//             //     (driver) => driver.deviceToken
//             // );

//             // allDeviceTokens = [...customerDeviceTokens, ...driverDeviceTokens];
//             allDeviceTokens = [...userDeviceTokens];

//         }
//         //  else if (send_to === "Riders") {
//         //     allDeviceTokens = customerTokens.map((customer) => customer.fcmToken);
//         // } else if (send_to === "Drivers") {
//         //     allDeviceTokens = driverTokens.map((driver) => driver.deviceToken);
//         // }
//         else {
//             return res.status(400).json({
//                 message: "Invalid recipient specified.",
//             })
//         }

//         const succ = await pushNotification(allDeviceTokens, message);
//         console.log(succ, "success")
//         if (succ) {
//             savenotification.successCount = succ.successCount;
//             savenotification.failureCount = succ.failureCount;

//             await savenotification.save();

//             doc = {
//                 message: "Notification sent successfully.",
//                 totalSuccess: succ.successCount,
//                 totalError: succ.failureCount,
//             };

//             return res.status(201).json(doc);
//         }

//     } catch (error) {
//         console.error("Error sending notification:", error);
//         return res.status(500).json({
//             message: "Error sending notification.",
//             error: error,
//         });
//     }
// };

const getNotification = async (req, res) => {
    try {
        const result = await Notification.find({ isDeleted: false }).exec();

        if (result) {
            const details = result.map((data) => {
                const currentTime = Date.now();
                const createdAt = data.createdAt;
                const timeDiff = Math.abs(currentTime - createdAt); // Time difference in milliseconds

                let timeAgo;

                if (timeDiff < 1000) {
                    timeAgo = "just now";
                } else if (timeDiff < 60000) {
                    const seconds = Math.floor(timeDiff / 1000);

                    timeAgo = `${seconds} Second${seconds === 1 ? "" : "s"} ago`;
                } else if (timeDiff < 3600000) {
                    const minutes = Math.floor(timeDiff / 60000);

                    timeAgo = `${minutes} Minute${minutes === 1 ? "" : "s"} ago`;
                } else if (timeDiff < 86400000) {
                    const hours = Math.floor(timeDiff / 3600000);

                    timeAgo = `${hours} Hour${hours === 1 ? "" : "s"} ago`;
                } else if (timeDiff < 2592000000) {
                    const days = Math.floor(timeDiff / 86400000);

                    timeAgo = `${days} Day${days === 1 ? "" : "s"} ago`;
                } else if (timeDiff < 31104000000) {
                    const months = Math.floor(timeDiff / 2592000000);

                    timeAgo = `${months} Month${months === 1 ? "" : "s"} ago`;
                } else {
                    const years = Math.floor(timeDiff / 31104000000);

                    timeAgo = `${years} Year${years === 1 ? "" : "s"} ago`;
                }

                return {
                    _id: data._id,
                    send_to: data.send_to,
                    push_message: data.push_message,
                    image: data.image,
                    department: data.department,
                    departmentId: data.departmentId,
                    createdAt: data.createdAt,
                    timeAgo,
                };
            });

            doc = {
                message: "All Notification Fetch Successfully!",
                data: details.reverse(),
            };
            return res.status(200).json(doc)
        }

        return res.status(404).json({
            message: "no available any notification",
        })
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({
            message: "Error sending notification.",
            error: error,
        });
    }
};


const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const dltnotification = await Notification.findByIdAndUpdate(
            { _id: id },
            { isDeleted: true, updatedAt: new Date() },
            { new: true }
        );

        if (dltnotification) {
            return res.status(200).json({
                message: "Notification Delete Successfully",

            })
        }

        return res.status(400).json({
            message: "Failed To Delete Notification",

        })
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({
            message: "Error sending notification.",
            error: error,
        });
    }
};


module.exports = {
    sendNotification,
    getNotification,
    deleteNotification
}