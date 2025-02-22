const { createDesignation, getAllDesignations, getDesignationById, updateDesignation, deleteDesignation, getActiveDesignation, uploadDesignation } = require("../../controllers/masterController/designationController");
const { xslUpload } = require("../../utils/upload");

module.exports = (router) => {
    router.post("/designation", createDesignation);
    router.get("/designations", getAllDesignations);
    router.get("/designation/:id", getDesignationById);
    router.put("/designation/:id", updateDesignation);
    router.delete("/designation/:id", deleteDesignation);
    router.get("/active-designations", getActiveDesignation);
    router.post("/upload-designation", xslUpload.single('file'), uploadDesignation);

};
