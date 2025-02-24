const { assignPermissions, getPermissionsByRole, updatePermissions, deletePermissions, getPermissionsForAdmin } = require("../../controllers/settings/permissionController");
const { addRole, getAllRoles, getRoleById, updateRole, deleteRole, getActiveRoles } = require("../../controllers/settings/roleController");

const { verifyToken } = require("../../utils/common");

module.exports = (router) => {
    // Role APIs
    router.post("/roles", verifyToken, addRole);
    router.get("/roles", getAllRoles);
    router.get("/roles/:roleId", getRoleById);
    router.put("/roles/:roleId", updateRole);
    router.delete("/roles/:roleId", deleteRole);

    router.get("/roles_active", getActiveRoles);

    // Permission APIs
    router.post("/permissions", assignPermissions);
    router.get("/permissions/:roleId", getPermissionsByRole);
    router.put("/permissions", updatePermissions);
    router.delete("/permissions/:roleId", deletePermissions);

    router.get("/get-permissions", verifyToken, getPermissionsForAdmin);

};
