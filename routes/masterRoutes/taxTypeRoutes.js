const {
    createTaxType,
    getAllTaxTypes,
    getTaxTypeById,
    updateTaxType,
    deleteTaxType,
    getActiveTaxTypes
} = require("../../controllers/masterController/taxTypeController");

module.exports = (router) => {
    router.post("/taxType", createTaxType);
    router.get("/taxTypes", getAllTaxTypes);
    router.get("/taxType/:id", getTaxTypeById);
    router.put("/taxType/:id", updateTaxType);
    router.delete("/taxType/:id", deleteTaxType);
    router.get("/active-taxTypes", getActiveTaxTypes)
};
