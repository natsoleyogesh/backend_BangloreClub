const { addRuleBylaw, getAllRulesBylaws, getRuleBylawById, updateRuleBylaw, deleteRuleBylaw, getActiveRulesBylaws } = require("../controllers/ruleByelawController");
const { verifyToken } = require("../utils/common");
const { downloadUpload } = require("../utils/upload");

module.exports = (router) => {
    router.post("/rulebyelaw/create", downloadUpload.single("fileUrl"), addRuleBylaw);
    router.get("/rulebyelaws", getAllRulesBylaws);
    router.get("/rulebyelaw/details/:id", getRuleBylawById)
    router.put("/rulebyelaw/update-rulebyelaw/:id", downloadUpload.single("fileUrl"), updateRuleBylaw)
    router.delete("/rulebyelaw/delete/:id", deleteRuleBylaw);
    router.get("/rulebyelaw/active-rulebyelaws", verifyToken, getActiveRulesBylaws);
}