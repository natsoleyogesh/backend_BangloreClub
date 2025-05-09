const Admin = require("../../models/Admin");
const Permission = require("../../models/permission");



const assignPermissions = async (req, res) => {
    try {
        const { roleId, permissions } = req.body;

        // Check for duplicate menuNames in the request body
        const uniquePermissions = [];
        const menuNamesSet = new Set();

        permissions.forEach(permission => {
            if (!menuNamesSet.has(permission.menuName)) {
                menuNamesSet.add(permission.menuName);
                uniquePermissions.push(permission);
            }
        });

        // Remove existing permissions for the role
        await Permission.deleteMany({ role: roleId });

        // Create new permissions
        const newPermissions = uniquePermissions.map(permission => ({
            role: roleId,
            menuName: permission.menuName,
            subMenus: permission.subMenus,
        }));

        await Permission.insertMany(newPermissions);

        return res.status(200).json({ message: "Permissions assigned successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to assign permissions", error: error.message });
    }
};


const getPermissionsByRole = async (req, res) => {
    try {
        const { roleId } = req.params;

        const permissions = await Permission.find({ role: roleId });

        res.status(200).json({ permissions });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch permissions", error: error.message });
    }
};




// const updatePermissions = async (req, res) => {
//     try {
//         const { roleId, permissions } = req.body;

//         // Remove existing permissions
//         await Permission.deleteMany({ role: roleId });

//         // Add new permissions
//         const updatedPermissions = permissions.map(permission => ({
//             role: roleId,
//             menuName: permission.menuName,
//             subMenus: permission.subMenus,
//         }));

//         await Permission.insertMany(updatedPermissions);

//         res.status(200).json({ message: "Permissions updated successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Failed to update permissions", error: error.message });
//     }
// };


const updatePermissions = async (req, res) => {
    try {
        const { roleId, permissions } = req.body;

        // Check for duplicate menuNames in the request body
        const uniquePermissions = [];
        const menuNamesSet = new Set();

        permissions.forEach(permission => {
            if (!menuNamesSet.has(permission.menuName)) {
                menuNamesSet.add(permission.menuName);
                uniquePermissions.push(permission);
            }
        });

        // Remove existing permissions
        await Permission.deleteMany({ role: roleId });

        // Add new permissions
        const updatedPermissions = uniquePermissions.map(permission => ({
            role: roleId,
            menuName: permission.menuName,
            subMenus: permission.subMenus,
        }));

        await Permission.insertMany(updatedPermissions);

        res.status(200).json({ message: "Permissions updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update permissions", error: error.message });
    }
};


const deletePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;

        await Permission.deleteMany({ role: roleId });

        res.status(200).json({ message: "Permissions deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete permissions", error: error.message });
    }
};


const getPermissionsForAdmin = async (req, res) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Find the admin and their role
        const admin = await Admin.findById(userId).populate("role");
        if (!admin || admin.isDeleted) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Fetch permissions for the role
        const permissions = await Permission.find({ role: admin.role._id });
        if (!permissions || permissions.length === 0) {
            return res.status(404).json({ message: "No permissions found for this role" });
        }

        res.status(200).json({
            message: "Permissions fetched successfully",
            role: admin.role.name,
            permissions,
        });
    } catch (error) {
        console.error("Error fetching permissions:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


module.exports = {
    assignPermissions,
    getPermissionsByRole,
    updatePermissions,
    deletePermissions,
    getPermissionsForAdmin
}