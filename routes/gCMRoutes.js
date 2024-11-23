const { addGCM, getAllGCM, getGCMDetails, updateGCM, deleteGCM, getActiveGCM } = require("../controllers/gCMController");
const { verifyToken } = require("../utils/common");
const { upload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/gcm/create", upload.single("profileImage"), addGCM);
    router.get("/gcms", getAllGCM);
    router.get("/gcm/details/:id", getGCMDetails)
    router.put("/gcm/update-gcm/:id", upload.single("profileImage"), updateGCM)
    router.delete("/gcm/delete/:id", deleteGCM);
    router.get("/gcm/active-gcms", verifyToken, getActiveGCM);
}