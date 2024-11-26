const { addCOM, getAllCOMs, COMDetails, updateCOM, deletedCOM, getActiveComs } = require("../controllers/comController");
const { verifyToken } = require("../utils/common");
const { downloadUpload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/com/create", downloadUpload.single("fileUrl"), addCOM);
    router.get("/coms", getAllCOMs);
    router.get("/com/details/:id", COMDetails)
    router.put("/com/update-com/:id", downloadUpload.single("fileUrl"), updateCOM)
    router.delete("/com/delete/:id", deletedCOM);
    router.get("/com/active-coms", verifyToken, getActiveComs);
}