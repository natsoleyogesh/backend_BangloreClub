const mongoose = require("mongoose");

const apiLogSchema = new mongoose.Schema({
    method: String, // GET, POST, PUT, DELETE
    endpoint: String, // /api/user/create
    status: Number, // 200, 400, 500
    ip: String, // User IP Address
    requestBody: mongoose.Schema.Types.Mixed, // Request Data
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: "userRole", default: null }, // Dynamic reference
    userRole: { type: String, enum: ["Admin", "User"], default: "User" }, // Role type (Admin/User)
}, { timestamps: true });

const ApiLog = mongoose.model("ApiLog", apiLogSchema);

module.exports = ApiLog;
