const { addWaiting, getAllApplications, getApplicationById, updateProfilePicture, updateApplicationById, deleteApplicationById, getActiveApplications, updateApplicationStatus } = require("../controllers/membershipWaitingListController");
const { verifyToken } = require("../utils/common");
const { upload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/membershipwaiting/create", upload.single("profilePicture"), addWaiting);
    router.get("/membershipwaitings", getAllApplications)
    router.get("/membershipwaiting/details/:id", getApplicationById);
    router.put("/membershipwaiting/update-profile-picture/:id", upload.single("profilePicture"), updateProfilePicture);
    router.put("/membershipwaiting/update-membershipwaiting/:id", updateApplicationById);
    router.delete("/membershipwaiting/delete/:id", deleteApplicationById);
    router.get("/membershipwaiting/active-membershipwaitings", verifyToken, getActiveApplications)

    router.post("/membershipwaiting/update-applicationstatus", updateApplicationStatus)
}