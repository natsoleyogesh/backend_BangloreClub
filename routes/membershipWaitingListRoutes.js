const { addWaiting, getAllApplications,

    // getApplicationById, updateProfilePicture, updateApplicationById, deleteApplicationById, getActiveApplications, updateApplicationStatus
} = require("../controllers/membershipWaitingListController");
const { verifyToken } = require("../utils/common");
const { upload, xslUpload } = require("../utils/upload");


module.exports = (router) => {
    // router.post("/membershipwaiting/create", upload.single("profilePicture"), addWaiting);
    router.post("/membershipwaiting/create", xslUpload.single('file'), addWaiting);

    router.get("/membershipwaitings", getAllApplications)
}