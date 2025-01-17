const { saveRequest, getAllRequests, deleteRequest, getRequestById, getAllUserRequest } = require("../controllers/allRequestController");
const { verifyToken } = require("../utils/common");

module.exports = (router) => {
    router.post("/request/create", saveRequest);
    router.get("/requests", getAllRequests);
    router.get("/request/:requestId", getRequestById);
    router.delete("/request/:requestId", deleteRequest);
    router.get("/user-requests", verifyToken, getAllUserRequest);
};
