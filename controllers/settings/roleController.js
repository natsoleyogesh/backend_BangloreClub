const Role = require("../../models/role");
const { toTitleCase, toLowerCase } = require("../../utils/common");


const addRole = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const { userId } = req.user;
        const normalizedName = toLowerCase(name);

        // Check if the role already exists
        const existingRole = await Role.findOne({ name: normalizedName, isDeleted: false });
        if (existingRole) {
            return res.status(400).json({ message: "Role with this name already exists Or Disabled" });
        }

        // Create a new role
        const newRole = new Role({ name: normalizedName, description, status, createdBy: userId });
        await newRole.save();

        return res.status(201).json({ message: "Role created successfully", role: newRole });
    } catch (error) {
        return res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find({ isDeleted: false });
        return res.status(200).json({ roles });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch roles", error: error.message });
    }
};

const getRoleById = async (req, res) => {
    try {
        const { roleId } = req.params;
        const role = await Role.findById(roleId);

        if (!role) return res.status(404).json({ message: "Role not found" });

        return res.status(200).json({ role });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch role", error: error.message });
    }
};

const updateRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { name, description, status } = req.body;

        // Build the update object dynamically
        const updateData = {};
        if (name) updateData.name = toLowerCase(name);
        if (description) updateData.description = description;
        if (typeof status !== "undefined") updateData.status = status;

        // Update the role
        const updatedRole = await Role.findByIdAndUpdate(roleId, updateData, { new: true });

        if (!updatedRole) return res.status(404).json({ message: "Role not found" });

        return res.status(200).json({ message: "Role updated successfully", role: updatedRole });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update role", error: error.message });
    }
};

// Soft delete a role
const deleteRole = async (req, res) => {
    try {
        const { roleId } = req.params;

        const updatedRole = await Role.findByIdAndUpdate(roleId, {
            status: false,
            isDeleted: true,
        }, { new: true });

        if (!updatedRole) return res.status(404).json({ message: "Role not found" });

        return res.status(200).json({ message: "Role status updated successfully", role: updatedRole });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update role status", error: error.message });
    }
};

const getActiveRoles = async (req, res) => {
    try {
        const roles = await Role.find({ isDeleted: false, status: true });
        return res.status(200).json({ roles });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Failed to fetch roles", error: error.message });
    }
};


module.exports = {
    addRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    getActiveRoles
}