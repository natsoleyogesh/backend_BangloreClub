const { default: mongoose } = require("mongoose");
const ActionLog = require("../models/actionLog");
const ActivityLog = require("../models/activityLog");
const logAction = async ({ userId, userType, action, ipAddress, userAgent, role }) => {
    try {
        await ActionLog.create({
            userId,
            userType,
            action,
            ipAddress,
            userAgent,
            role
        });
        console.log(`Action logged: ${userType} - ${action}`);
    } catch (error) {
        console.error("Error logging action:", error);
    }
};

const logActivity = async ({ memberId, gatekeeperId, activity, ipAddress, details, userAgent }) => {
    try {
        await ActivityLog.create({
            memberId,
            gatekeeperId,
            activity,
            details,
            ipAddress,
            userAgent,
        });
        console.log(`Activity logged: - ${activity}`);
    } catch (error) {
        console.error("Error logging action:", error);
    }
}


// const getActions = async (req, res) => {
//     try {
//         const {
//             userType, // "User" or "Admin"
//             role, // "member", "gatekeeper", or "admin"
//             action, // "login", "logout"
//             filter, // "today", "last7days", "lastMonth", "lastYear"
//             startDate, // Custom start date
//             endDate, // Custom end date
//         } = req.query;

//         const filters = {};

//         // Add userType to the filter if provided
//         if (userType) {
//             filters.userType = userType;
//         }

//         // Add role to the filter if provided
//         if (role) {
//             filters.role = role;
//         }

// // Add action to the filter if provided
// if (action) {
//     filters.action = action;
// }


//         // Handle date filters
//         const today = new Date();
//         if (filter) {
//             switch (filter) {
//                 case "today":
//                     filters.timestamp = {
//                         $gte: new Date(today.setHours(0, 0, 0, 0)),
//                         $lte: new Date(today.setHours(23, 59, 59, 999)),
//                     };
//                     break;
//                 case "last7days":
//                     filters.timestamp = {
//                         $gte: new Date(today.setDate(today.getDate() - 7)),
//                         $lte: new Date(),
//                     };
//                     break;
//                 case "lastMonth":
//                     const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//                     const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
//                     filters.timestamp = {
//                         $gte: firstDayOfLastMonth,
//                         $lte: lastDayOfLastMonth,
//                     };
//                     break;
//                 case "lastYear":
//                     const firstDayOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
//                     const lastDayOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
//                     filters.timestamp = {
//                         $gte: firstDayOfLastYear,
//                         $lte: lastDayOfLastYear,
//                     };
//                     break;
//                 default:
//                     break;
//             }
//         }

//         // Handle custom date range
//         if (startDate && endDate) {
//             filters.timestamp = {
//                 $gte: new Date(startDate),
//                 $lte: new Date(endDate),
//             };
//         }

//         // Fetch the action logs based on the filters
//         const actionLogs = await ActionLog.find(filters)
//             .sort({ timestamp: -1 }) // Sort by most recent
//             .exec();

//         res.status(200).json({
//             success: true,
//             message: "Login actions fetched successfully",
//             data: actionLogs,
//         });
//     } catch (error) {
//         console.error("Error fetching login actions:", error);
//         res.status(500).json({
//             success: false,
//             message: "Error fetching login actions",
//             error: error.message,
//         });
//     }
// };

const getActions = async (req, res) => {
    try {
        const {
            userId,
            userType, // "User" or "Admin"
            role, // "member", "gatekeeper", or "admin"
            action, // "login", "logout"
            filter, // "today", "last7days", "lastMonth", "lastYear"
            startDate, // Custom start date
            endDate, // Custom end date
        } = req.query;

        const filters = {};

        // Add userType to the filter if provided
        if (userType) {
            filters.userType = userType;
        }

        // Add userId to the filter if provided
        if (userId) {
            filters.userId = userId;
        }

        // Add role to the filter if provided
        if (role) {
            filters.role = role;
        }

        // Add action to the filter if provided
        if (action) {
            filters.action = action;
        }

        // Handle date filters
        const today = new Date();
        if (filter) {
            switch (filter) {
                case "today":
                    filters.timestamp = {
                        $gte: new Date(today.setHours(0, 0, 0, 0)),
                        $lte: new Date(today.setHours(23, 59, 59, 999)),
                    };
                    break;
                // case "last7days":
                //     filters.timestamp = {
                //         $gte: new Date(today.setDate(today.getDate() - 7)),
                //         $lte: new Date(),
                //     };
                //     break;
                // case "lastMonth":
                //     const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                //     const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                //     filters.timestamp = {
                //         $gte: firstDayOfLastMonth,
                //         $lte: lastDayOfLastMonth,
                //     };
                //     break;
                // case "lastYear":
                //     const firstDayOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
                //     const lastDayOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
                //     filters.timestamp = {
                //         $gte: firstDayOfLastYear,
                //         $lte: lastDayOfLastYear,
                //     };
                //     break;
                case "last7days":
                    filters.timestamp = {
                        $gte: new Date(today.setDate(today.getDate() - 7)),
                        $lte: new Date(),
                    };
                    break;
                case "lastMonth":
                    filters.timestamp = {
                        $gte: new Date(today.setDate(today.getDate() - 30)),
                        $lte: new Date(),
                    };
                    break;
                case "lastYear":
                    filters.timestamp = {
                        $gte: new Date(today.setFullYear(today.getFullYear() - 1)),
                        $lte: new Date(),
                    };
                    break;
                default:
                    break;
            }
        }

        // Handle custom date range
        if (startDate && endDate) {
            filters.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // Fetch the action logs based on the filters
        const actionLogs = await ActionLog.find(filters)
            .sort({ timestamp: -1 }) // Sort by most recent
            .lean(); // Use .lean() for better performance

        // Populate user data
        const populatedLogs = await Promise.all(
            actionLogs.map(async (log) => {
                if (log.userType === "User") {
                    const user = await mongoose.model("User").findById(log.userId).lean();
                    if (user) {
                        log.user = user;
                    } else {
                        return null; // Skip this entry if User is not found
                    }
                } else if (log.userType === "Admin") {
                    const admin = await mongoose.model("Admin").findById(log.userId).lean().select('-password');
                    if (admin) {
                        log.user = admin;
                    } else {
                        return null; // Skip this entry if Admin is not found
                    }
                }
                return log;
            })
        );

        // Filter out null entries (skipped logs)
        const filteredLogs = populatedLogs.filter((log) => log !== null);

        res.status(200).json({
            success: true,
            message: "Login actions fetched successfully",
            data: filteredLogs,
        });
    } catch (error) {
        console.error("Error fetching login actions:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching login actions",
            error: error.message,
        });
    }
};


const deleteActionLog = async (req, res) => {
    try {
        const { id } = req.params; // Action log ID to delete

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action log ID",
            });
        }

        const deletedLog = await ActionLog.findByIdAndDelete(id);

        if (!deletedLog) {
            return res.status(404).json({
                success: false,
                message: "Action log not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Action log deleted successfully",
            data: deletedLog,
        });
    } catch (error) {
        console.error("Error deleting action log:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting action log",
            error: error.message,
        });
    }
};


module.exports = {
    logAction,
    logActivity,
    getActions,
    deleteActionLog
}