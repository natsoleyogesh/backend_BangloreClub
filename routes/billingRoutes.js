const { createBilling, getAllBillings, getBillingById, deleteBilling, getActiveBill, updateBilling, getBillingByIdAdmin, getMemberBill, uploadConsolidatedBill, getAllBillingsWithFilters, getOfflineBillingById, deleteOfflineBilling, updateOfflineBilling, getOfflineActiveBill, getMemberActiveBills, getOfflineMemberActiveBills } = require("../controllers/billingController");
const { verifyToken } = require("../utils/common");
const { xslUpload } = require("../utils/upload");

module.exports = (router) => {
    router.post("/billing/create", createBilling);
    router.get("/billings", getAllBillings);
    router.get("/billing/:id", getBillingById);
    router.delete("/billing/:id", deleteBilling);
    router.put("/billing/:id", updateBilling);
    router.get("/active-billings", verifyToken, getActiveBill);
    router.get("/billing-details/:id", getBillingByIdAdmin);
    router.get("/biiling/member/:userId", getMemberBill);
    router.get("/member-all-billings", verifyToken, getMemberActiveBills);



    //  OFFFLINE BILLING ROUTES
    router.post("/upload-offline-bill", xslUpload.single('file'), uploadConsolidatedBill);
    router.get("/offline-billings", getAllBillingsWithFilters);
    router.get("/offline-billing/:id", getOfflineBillingById);
    router.delete("/offline-billing/:id", deleteOfflineBilling);
    router.put("/offline-billing/:id", updateOfflineBilling);
    router.get("/offline-active-billings", verifyToken, getOfflineActiveBill);

    router.get("/member-offline-all-billings", verifyToken, getOfflineMemberActiveBills);


};
