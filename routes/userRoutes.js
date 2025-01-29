const { createUser, loginRequest, verifyOtp, getUserDetails, updateProfilePicture, userLogout, uploadProofs, deleteProofs, updateProfilePictureByUser, uploadMemberData, uploadMemberAddress } = require("../controllers/userController");
const { verifyToken } = require("../utils/common");
const { upload, handleMulterError, xslUpload } = require("../utils/upload");


module.exports = (router) => {
    router.post(
        "/member/create",
        upload.fields([
            { name: "profilePicture", maxCount: 1 }, // Single profile picture
            { name: "proofs", maxCount: 10 }, // Maximum 3 proof files
        ]),
        handleMulterError, // Middleware to handle errors
        createUser
    );

    // Route to upload proofs
    router.put("/user/:userId/proofs", upload.array("proofs", 3), // Allow up to 3 files
        handleMulterError, uploadProofs
    );

    // Route to delete a proof by index
    router.delete("/user/:userId/proofs/:index", deleteProofs);

    router.post("/member/login", loginRequest);
    router.post("/member/verify-otp", verifyOtp);
    router.get("/member/details", verifyToken, getUserDetails);
    router.put("/member/update-profile-picture/:userId", upload.single("profilePicture"), updateProfilePicture)
    router.post("/update-profile-picture", upload.single("profilePicture"), verifyToken, updateProfilePictureByUser)

    router.post("/member/logout", verifyToken, userLogout);

    router.post("/upload-members", xslUpload.single('file'), uploadMemberData);
    router.post("/upload-members-address", xslUpload.single('file'), uploadMemberAddress);


}