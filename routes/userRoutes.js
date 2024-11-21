const { createUser, loginRequest, verifyOtp, getUserDetails, updateProfilePicture, userLogout } = require("../controllers/userController");
const { verifyToken } = require("../utils/common");
const { upload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/member/create", upload.single("profilePicture"), createUser);
    router.post("/member/login", loginRequest);
    router.post("/member/verify-otp", verifyOtp);
    router.get("/member/details", verifyToken, getUserDetails);
    router.put("/member/update-profile-picture/:userId", upload.single("profilePicture"), updateProfilePicture)
    router.post("/member/logout", verifyToken, userLogout)
}