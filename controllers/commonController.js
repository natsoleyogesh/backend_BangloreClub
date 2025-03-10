const { default: mongoose } = require("mongoose");
const ActionLog = require("../models/actionLog");
const ActivityLog = require("../models/activityLog");
const UpdateQrLog = require("../models/updateQRLog");
const ApiLog = require("../models/ApiLog");
const User = require("../models/user");
const Admin = require("../models/Admin");
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

const logUpdateQrCode = async ({ memberId, adminId, activity, ipAddress, details, userAgent }) => {
    try {
        await UpdateQrLog.create({
            memberId,
            adminId,
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

// const getActions = async (req, res) => {
//     try {
//         const {
//             userId,
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

//         // Add userId to the filter if provided
//         if (userId) {
//             filters.userId = userId;
//         }

//         // Add role to the filter if provided
//         if (role) {
//             filters.role = role;
//         }

//         // Add action to the filter if provided
//         if (action) {
//             filters.action = action;
//         }

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
//                 // case "last7days":
//                 //     filters.timestamp = {
//                 //         $gte: new Date(today.setDate(today.getDate() - 7)),
//                 //         $lte: new Date(),
//                 //     };
//                 //     break;
//                 // case "lastMonth":
//                 //     const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//                 //     const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
//                 //     filters.timestamp = {
//                 //         $gte: firstDayOfLastMonth,
//                 //         $lte: lastDayOfLastMonth,
//                 //     };
//                 //     break;
//                 // case "lastYear":
//                 //     const firstDayOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
//                 //     const lastDayOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
//                 //     filters.timestamp = {
//                 //         $gte: firstDayOfLastYear,
//                 //         $lte: lastDayOfLastYear,
//                 //     };
//                 //     break;
//                 case "last7days":
//                     filters.timestamp = {
//                         $gte: new Date(today.setDate(today.getDate() - 7)),
//                         $lte: new Date(),
//                     };
//                     break;
//                 case "lastMonth":
//                     filters.timestamp = {
//                         $gte: new Date(today.setDate(today.getDate() - 30)),
//                         $lte: new Date(),
//                     };
//                     break;
//                 case "lastYear":
//                     filters.timestamp = {
//                         $gte: new Date(today.setFullYear(today.getFullYear() - 1)),
//                         $lte: new Date(),
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
//             .lean(); // Use .lean() for better performance

//         // Populate user data
//         const populatedLogs = await Promise.all(
//             actionLogs.map(async (log) => {
//                 if (log.userType === "User") {
//                     const user = await mongoose.model("User").findById(log.userId).lean();
//                     if (user) {
//                         log.user = user;
//                     } else {
//                         return null; // Skip this entry if User is not found
//                     }
//                 } else if (log.userType === "Admin") {
//                     const admin = await mongoose.model("Admin").findById(log.userId).lean().select('-password');
//                     if (admin) {
//                         log.user = admin;
//                     } else {
//                         return null; // Skip this entry if Admin is not found
//                     }
//                 }
//                 return log;
//             })
//         );

//         // Filter out null entries (skipped logs)
//         const filteredLogs = populatedLogs.filter((log) => log !== null);

//         res.status(200).json({
//             success: true,
//             message: "Login actions fetched successfully",
//             data: filteredLogs,
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
            page,
            limit,
        } = req.query;

        // Convert pagination parameters
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

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

        // Get total count of action logs
        const totalActions = await ActionLog.countDocuments(filters);

        // Fetch paginated action logs
        const actionLogs = await ActionLog.find(filters)
            .sort({ timestamp: -1 }) // Sort by most recent
            .skip(skip)
            .limit(limitNumber)
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
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalActions / limitNumber),
                totalActions,
                pageSize: limitNumber,
            },
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

// Function to get QR code update logs
const getQrCodeUpdateLogs = async (req, res) => {
    try {
        const { userId } = req.user; // Get the userId from the request (authenticated user)

        // Query to find all update logs for the user, populate member and admin fields
        const logs = await UpdateQrLog.find({ adminId: userId })
            .populate("memberId", "name email mobileNumber") // Populate member data (choose fields to include)
            .populate("adminId", "name email") // Populate admin data (choose fields to include)
            .sort({ timestamp: -1 }); // Sort by timestamp in descending order (most recent first)

        // If no logs found
        if (!logs || logs.length === 0) {
            return res.status(404).json({ message: "No QR code update logs found." });
        }

        // Return the logs with populated member and admin data
        return res.status(200).json({
            message: "QR Code update logs fetched successfully",
            logs,
        });
    } catch (error) {
        console.error("Error fetching QR code update logs:", error);
        return res.status(500).json({
            message: "Error fetching QR code update logs",
            error: error.message,
        });
    }
};


const getApiLogs = async (req, res) => {
    try {
        const {
            userId,
            userRole, // "User" or "Admin"
            method, // "GET", "POST", "PUT", "DELETE"
            endpoint, // Specific API endpoint
            status, // HTTP Status Code (e.g., 200, 400, 500)
            startDate, // Custom start date
            endDate, // Custom end date
            filter, // "today", "last7days", "lastMonth", "lastYear"
            page,
            ipAddress,
            limit
        } = req.query;

        // Convert pagination parameters
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        const filters = {};

        // Add filters based on query params
        if (userRole) {
            filters.userRole = userRole;
        }
        if (userId) {
            filters.userId = userId;
        }
        if (method) {
            filters.method = method;
        }
        if (endpoint) {
            filters.endpoint = endpoint;
        }
        if (status) {
            filters.status = parseInt(status);
        }
        if (ipAddress) {
            filters.ip = ipAddress
        }

        // Handle date filters
        const today = new Date();
        if (filter) {
            switch (filter) {
                case "today":
                    filters.createdAt = {
                        $gte: new Date(today.setHours(0, 0, 0, 0)),  // Start of today
                        $lte: new Date(today.setHours(23, 59, 59, 999)) // End of today
                    };
                    break;
                case "last7days":
                    filters.createdAt = {
                        $gte: new Date(today.setDate(today.getDate() - 7)),
                        $lte: new Date(),
                    };
                    break;
                case "lastMonth":
                    filters.createdAt = {
                        $gte: new Date(today.setMonth(today.getMonth() - 1)),
                        $lte: new Date(),
                    };
                    break;
                case "currentMonth":
                    filters.createdAt = {
                        $gte: new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0), // 1st day of current month at 00:00:00
                        $lte: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999) // Last day of current month at 23:59:59
                    };
                    break;
                case "lastYear":
                    filters.createdAt = {
                        $gte: new Date(today.setFullYear(today.getFullYear() - 1)),
                        $lte: new Date(),
                    };
                    break;
                case "currentYear":
                    filters.createdAt = {
                        $gte: new Date(today.getFullYear(), 0, 1, 0, 0, 0), // January 1st current year at 00:00:00
                        $lte: new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999) // December 31st current year at 23:59:59
                    };
                    break;
            }
        }
        if (startDate && endDate) {
            // const start = new Date(startDate.split("-").reverse().join("-")); // Convert DD-MM-YYYY to YYYY-MM-DD
            // const end = new Date(endDate.split("-").reverse().join("-"));
            const start = new Date(startDate); // Convert DD-MM-YYYY to YYYY-MM-DD
            const end = new Date(endDate);

            filters.createdAt = {
                $gte: new Date(start.setHours(0, 0, 0, 0)),  // Start from midnight 00:00:00
                $lte: new Date(end.setHours(23, 59, 59, 999)) // End at 11:59:59 PM
            };
        }

        // Get total count of logs
        const totalActions = await ApiLog.countDocuments(filters);

        // Fetch paginated logs
        const actionLogs = await ApiLog.find(filters)
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip(skip)
            .limit(limitNumber)
            .lean(); // Use .lean() for better performance

        // Populate user data
        const populatedLogs = await Promise.all(
            actionLogs.map(async (log) => {
                let user = null;

                if (log.userRole === "User") {
                    user = await User.findById(log.userId).lean().select("name memberId email");
                } else if (log.userRole === "Admin") {
                    user = await Admin.findById(log.userId).lean().select("-password");
                }

                return {
                    ...log,
                    user: user || null, // Attach user/admin data
                };
            })
        );

        res.status(200).json({
            success: true,
            message: "API logs fetched successfully",
            data: populatedLogs,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalActions / limitNumber),
                totalActions,
                pageSize: limitNumber,
            },
        });
    } catch (error) {
        console.error("Error fetching API logs:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching API logs",
            error: error.message,
        });
    }
};


const deleteApiLog = async (req, res) => {
    try {
        const { id } = req.params; // Action log ID to delete

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action log ID",
            });
        }

        const deletedLog = await ApiLog.findByIdAndDelete(id);

        if (!deletedLog) {
            return res.status(404).json({
                success: false,
                message: "API log not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "API log deleted successfully",
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


const getClientIp = (req) => {
    // 1. Check X-Forwarded-For Header first (may have multiple IPs)
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress;

    // 2. If multiple IPs (comma separated), get the first one
    if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    // 3. Remove IPv6-mapped IPv4 prefix if present
    if (ip && ip.includes('::ffff:')) {
        ip = ip.split('::ffff:')[1];
    }

    return ip;
};


module.exports = {
    logAction,
    logActivity,
    getActions,
    deleteActionLog,
    logUpdateQrCode,
    getQrCodeUpdateLogs,
    getApiLogs,
    deleteApiLog,
    getClientIp,
}