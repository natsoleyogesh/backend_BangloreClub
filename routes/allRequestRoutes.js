const { saveRequest, getAllRequests, deleteRequest, getRequestById } = require("../controllers/allRequestController");
const { verifyToken } = require("../utils/common");

module.exports = (router) => {
    router.post("/request/create", saveRequest);
    router.get("/requests", getAllRequests);
    // router.post("/admin/login", adminLogin); // Public route for admin login
    router.get("/request/:requestId", getRequestById);
    // router.get("/admin/all-users", getAllUsers);
    router.delete("/request/:requestId", deleteRequest);
    // router.post("/admin/logout", verifyToken, adminLogout);
    // router.post("/getkeeper/scanqr", verifyToken, qrScanDetails);
    // router.get("/admin/active-members", getAllActiveUsers)
};
