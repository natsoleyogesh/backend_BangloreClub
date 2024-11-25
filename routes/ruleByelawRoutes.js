const { addRuleBylaw, getAllRulesBylaws, getRuleBylawById, updateRuleBylaw, deleteRuleBylaw, getActiveRulesBylaws } = require("../controllers/ruleByelawController");
const { verifyToken } = require("../utils/common");

module.exports = (router) => {
    router.post("/rulebyelaw/create", addRuleBylaw);
    router.get("/rulebyelaws", getAllRulesBylaws);
    router.get("/rulebyelaw/details/:id", getRuleBylawById)
    router.put("/rulebyelaw/update-rulebyelaw/:id", updateRuleBylaw)
    router.delete("/rulebyelaw/delete/:id", deleteRuleBylaw);
    router.get("/rulebyelaw/active-rulebyelaws", verifyToken, getActiveRulesBylaws);
}