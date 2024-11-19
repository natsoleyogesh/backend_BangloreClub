const { sendProfileRequest, getProfileRequests, rejectProfileRequest, createFamilyMember, updateUserDetailsByAdmin } = require("../controllers/profileRequestController");
const { verifyToken } = require("../utils/common");
const { upload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/member/send-request", verifyToken, sendProfileRequest);
    router.get("/admin/get-requests", verifyToken, getProfileRequests);
    router.post("/admin/reject-request/:requestId", verifyToken, rejectProfileRequest);
    router.put("/admin/update-details/:userId", verifyToken, updateUserDetailsByAdmin);
    router.post("/admin/create-member", upload.single("profilePicture"), createFamilyMember);
}