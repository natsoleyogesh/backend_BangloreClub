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



module.exports = {
    logAction,
    logActivity
}