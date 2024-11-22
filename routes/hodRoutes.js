const { addHOD, getAllHODs, getHODById, updateHOD, deleteHOD, getActiveHODs } = require("../controllers/hodsController");
const { verifyToken } = require("../utils/common");
const { hodupload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/hod/create", hodupload.single("image"), addHOD);
    router.get("/hods", getAllHODs);
    router.get("/hod/details/:id", getHODById)
    router.put("/hod/update-hod/:id", hodupload.single("image"), updateHOD)
    router.delete("/hod/delete/:id", deleteHOD);
    router.get("/hod/active-hods", verifyToken, getActiveHODs);
}