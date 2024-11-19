const {
  createAdmin,
  getAdmins,
  adminLogin,
  getUserDetailsById,
  getAllUsers,
  deleteMember,
} = require("../controllers/adminController");

module.exports = (router) => {
  router.post("/admin/create", createAdmin);
  router.get("/admins", getAdmins);
  router.post("/admin/login", adminLogin); // Public route for admin login
  router.get("/admin/member/:userId", getUserDetailsById);
  router.get("/admin/all-users", getAllUsers);
  router.delete("/admin/delete-member/:userId", deleteMember);
};
