const {
  createAdmin,
  getAdmins,
  adminLogin,
  getUserDetailsById,
  getAllUsers,
  deleteMember,
  adminLogout,
  qrScanDetails,
  getAllActiveUsers,
  getAdminDetails,
  getUsers,
  getAdminById,
  getAllAdmins,
  updateAdmin,
  getAdminsSearch,
  verifyOtp,
  resendOtp,
} = require("../controllers/adminController");
const { verifyToken } = require("../utils/common");

module.exports = (router) => {
  router.post("/admin/create", createAdmin);
  router.get("/admins", getAdmins);
  router.post("/admin/login", adminLogin); // Public route for admin login
  router.get("/admin/member/:userId", getUserDetailsById);
  router.get("/admin/all-users", getAllUsers);
  router.get("/admin/get-users", getUsers);

  router.delete("/admin/delete-member/:userId", deleteMember);
  router.post("/admin/logout", verifyToken, adminLogout);
  router.post("/getkeeper/scanqr", verifyToken, qrScanDetails);
  router.get("/admin/active-members", getAllActiveUsers);

  router.get("/admin-deails", verifyToken, getAdminDetails);

  router.get("/admin/:id", getAdminById);
  router.get("/all-admins", verifyToken, getAllAdmins);
  router.put("/admin/update/:id", updateAdmin);

  router.get("/get-admin-search", getAdminsSearch);

  router.post("/admin-verify-otp", verifyOtp);
  router.post("/admin-resend-otp", resendOtp);

};
