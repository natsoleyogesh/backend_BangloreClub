const { addGCM, getAllGCM, getGCMDetails, updateGCM, deleteGCM, getActiveGCM, getGCMDetailsById } = require("../controllers/gCMController");
const { verifyToken } = require("../utils/common");
const { upload, gcmupload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/gcm/create", gcmupload.single("image"), addGCM);
    router.get("/gcms", getAllGCM);
    router.get("/gcm/details/:id", getGCMDetails)
    router.put("/gcm/update-gcm/:id", gcmupload.single("image"), updateGCM)
    router.delete("/gcm/delete/:id", deleteGCM);
    router.get("/gcm/active-gcms", verifyToken, getActiveGCM);

    router.get("/gcm/edit-details/:id", getGCMDetailsById)

}