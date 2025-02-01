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

  router.get("/admin-deails", verifyToken, getAdminDetails)
};
