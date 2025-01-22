const Notification = require("../models/notification");
const User = require("../models/user");
const { createNotification } = require("../utils/pushNotification");

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



const getNotification = async (req, res) => {
    try {
        const { filterType, customStartDate, customEndDate } = req.query;

        let filter = { isDeleted: false };

        // Apply time range filters based on `filterType`
        if (filterType) {
            const currentTime = Date.now();

            switch (filterType) {
                case "60seconds":
                    filter.createdAt = { $gte: new Date(currentTime - 60000) }; // Last 60 seconds
                    break;
                case "10minutes":
                    filter.createdAt = { $gte: new Date(currentTime - 10 * 60000) }; // Last 10 minutes
                    break;
                case "30minutes":
                    filter.createdAt = { $gte: new Date(currentTime - 30 * 60000) }; // Last 30 minutes
                    break;
                case "1hour":
                    filter.createdAt = { $gte: new Date(currentTime - 3600000) }; // Last 1 hour
                    break;
                case "custom":
                    if (!customStartDate || !customEndDate) {
                        return res.status(400).json({
                            message: "Custom date range requires both start and end dates in YYYY-MM-DD format.",
                        });
                    }

                    // Parse custom start and end dates
                    const startOfDay = new Date(`${customStartDate}T00:00:00.000Z`);
                    const endOfDay = new Date(`${customEndDate}T23:59:59.999Z`);

                    filter.createdAt = {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    };
                    break;
                default:
                    break; // No filter applied if no valid filterType
            }
        }

        // Query notifications based on filter
        const result = await Notification.find(filter).exec();

        if (result && result.length > 0) {
            const details = result.map((data) => {
                const currentTime = Date.now();
                const createdAt = new Date(data.createdAt).getTime();
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

            const doc = {
                message: "All Notifications Fetched Successfully!",
                data: details.reverse(),
            };
            return res.status(200).json(doc);
        }

        return res.status(404).json({
            message: "No notifications available.",
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({
            message: "Error fetching notifications.",
            error: error.message,
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


const getUserNotification = async (req, res) => {
    try {
        const { filterType, customStartDate, customEndDate } = req.query;

        let filter = { isDeleted: false };

        // Apply time range filters based on `filterType`
        if (filterType) {
            const currentTime = Date.now();

            switch (filterType) {
                case "60seconds":
                    filter.createdAt = { $gte: new Date(currentTime - 60000) }; // Last 60 seconds
                    break;
                case "10minutes":
                    filter.createdAt = { $gte: new Date(currentTime - 10 * 60000) }; // Last 10 minutes
                    break;
                case "30minutes":
                    filter.createdAt = { $gte: new Date(currentTime - 30 * 60000) }; // Last 30 minutes
                    break;
                case "1hour":
                    filter.createdAt = { $gte: new Date(currentTime - 3600000) }; // Last 1 hour
                    break;
                case "custom":
                    if (!customStartDate || !customEndDate) {
                        return res.status(400).json({
                            message: "Custom date range requires both start and end dates in YYYY-MM-DD format.",
                        });
                    }

                    // Parse custom start and end dates
                    const startOfDay = new Date(`${customStartDate}T00:00:00.000Z`);
                    const endOfDay = new Date(`${customEndDate}T23:59:59.999Z`);

                    filter.createdAt = {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    };
                    break;
                default:
                    break; // No filter applied if no valid filterType
            }
        }

        // Query notifications based on filter
        const result = await Notification.find(filter)
            .populate({
                path: "departmentId",
                match: { primaryMemberId: req.user.userId },
                select: "_id", // Only return the departmentId field
            })
            .exec();

        if (result && result.length > 0) {
            const details = result
                .filter((data) => {
                    // Filter based on the user and department matching criteria
                    if (!data.departmentId && data.send_to === "All") {
                        return true; // Notifications with no department and send_to "All"
                    }

                    // Notifications with a departmentId populated and matched to userId
                    return data.departmentId !== null;
                })
                .map((data) => {
                    const currentTime = Date.now();
                    const createdAt = new Date(data.createdAt).getTime();
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

            const doc = {
                message: "All Notifications Fetched Successfully!",
                data: details.reverse(),
            };
            return res.status(200).json(doc);
        }

        return res.status(404).json({
            message: "No notifications available.",
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({
            message: "Error fetching notifications.",
            error: error.message,
        });
    }
};


module.exports = {
    sendNotification,
    getNotification,
    deleteNotification,
    getUserNotification
}