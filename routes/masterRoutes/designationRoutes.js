const { createDesignation, getAllDesignations, getDesignationById, updateDesignation, deleteDesignation, getActiveDesignation } = require("../../controllers/masterController/designationController");

module.exports = (router) => {
    router.post("/designation", createDesignation);
    router.get("/designations", getAllDesignations);
    router.get("/designation/:id", getDesignationById);
    router.put("/designation/:id", updateDesignation);
    router.delete("/designation/:id", deleteDesignation);
    router.get("/active-designations", getActiveDesignation);
};
