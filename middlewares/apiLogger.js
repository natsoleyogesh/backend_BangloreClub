const Admin = require("../models/Admin");
const ApiLog = require("../models/ApiLog");
const User = require("../models/user");


// List of routes to exclude from logging
const excludedRoutes = [
  "/api/requests",
  "/api/admin/login",
  "/api/admin-resend-otp",
  "/api/admin-verify-otp",
  "/api/member/login",
  "/api/member/verify-otp",
  // "/api/notification"
];

// List of routes to exclude from logging
const excludedMethod = [
  "GET",
  // "/api/admin/login",
];

const apiLogger = async (req, res, next) => {

  // Extract only the base path (removes query parameters)
  const cleanUrl = req.originalUrl.split("?")[0];

  // Check if the request is for an excluded route
  if (excludedRoutes.includes(cleanUrl)) {
    return next(); // Skip logging for public routes
  }

  if (excludedMethod.includes(req.method)) {
    return next(); // Skip logging for public routes
  }
  //  // Check if the request is for an excluded route
  //  if (excludedRoutes.includes(req.originalUrl)) {
  //   return next(); // Skip logging for public routes
  // }

  // res.on("finish", async () => {
  //   try {
  //     // Extract user from authentication (JWT or session)
  //     let userId = null;

  //     if (req.user) { // If authentication middleware sets req.user
  //       userId = req.user.userId; // Assuming Mongoose ObjectId
  //     }
  //     let user = await User.findById(userId);
  //     let role = "User";

  //     if (!user) {
  //       user = await Admin.findById(userId);
  //       if (!user) {
  //         return;
  //       }
  //       role = "Admin";
  //     }

  //     await ApiLog.create({
  //       method: req.method,
  //       endpoint: cleanUrl, // Stores only base URL without query params
  //       status: res.statusCode,
  //       ip: req.userIp, // req.ip,
  //       requestBody: req.method !== "GET" ? req.body : null, // Log body only for non-GET requests
  //       userId,
  //       userRole: role
  //     });
  //   } catch (error) {
  //     console.error("Log Error:", error);
  //   }
  // });

  res.on("finish", async () => {
    try {
      let userId = null;

      if (req.user) {
        userId = req.user.userId; // Get from JWT decoded user
      }

      // If no userId, skip logging
      if (!userId) {
        return;
      }

      // First, try to find in User collection
      let user = await User.findById(userId);
      let role = "User";

      // If not found in User, try Admin collection
      if (!user) {
        user = await Admin.findById(userId);

        // If still no user found, skip logging
        if (!user) {
          return;
        }

        role = "Admin";
      }

      // If user exists, log the API action
      await ApiLog.create({
        method: req.method,
        endpoint: req.originalUrl.split('?')[0], // Logs endpoint without query params
        status: res.statusCode,
        ip: req.userIp || req.ip, // Use parsed IP if you have middleware for this
        requestBody: req.method !== "GET" ? req.body : null,
        userId: user._id,
        userRole: role,
      });
    } catch (error) {
      console.error("API Logger Error:", error.message);
    }
  });

  next();
};

module.exports = apiLogger;
