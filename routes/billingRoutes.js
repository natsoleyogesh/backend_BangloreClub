const { createBilling, getAllBillings, getBillingById, deleteBilling, getActiveBill, updateBilling, getBillingByIdAdmin, getMemberBill } = require("../controllers/billingController");
const { verifyToken } = require("../utils/common");

module.exports = (router) => {
    router.post("/billing/create", createBilling);
    router.get("/billings", getAllBillings);
    router.get("/billing/:id", getBillingById);
    router.delete("/billing/:id", deleteBilling);
    router.put("/billing/:id", updateBilling);
    router.get("/active-billings", verifyToken, getActiveBill);
    router.get("/billing-details/:id", getBillingByIdAdmin);
    router.get("/biiling/member/:userId", getMemberBill);


};
