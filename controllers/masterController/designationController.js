const Designation = require("../../models/designation");
const { toTitleCase } = require("../../utils/common");

// Create a new designation
const createDesignation = async (req, res) => {
    try {
        const { designationName, status } = req.body;
        const normalizedName = toTitleCase(designationName);

        // Check if designation already exists
        const existingDesignation = await Designation.findOne({ designationName: normalizedName, isDeleted: false });
        if (existingDesignation) {
            return res.status(400).json({ message: "Designation already exists." });
        }

        // Create and save the new designation
        const designation = new Designation({ designationName: normalizedName, status });
        await designation.save();

        return res.status(201).json({ message: "Designation added successfully.", designation });
    } catch (err) {
        console.error("Error creating designation:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
};

// Get all designations, excluding soft-deleted ones, ordered by latest first
const getAllDesignations = async (req, res) => {
    try {
        const designations = await Designation.find({ isDeleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({ message: "All Designations", designations });
    } catch (err) {
        console.error("Error fetching designations:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
};

// Get designation by ID
const getDesignationById = async (req, res) => {
    try {
        const { id } = req.params;
        const designation = await Designation.findById(id);

        if (!designation) {
            return res.status(404).json({ message: "Designation not found." });
        }

        return res.status(200).json({ message: "Designation details", designation });
    } catch (err) {
        console.error("Error fetching designation by ID:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
};

// Update designation by ID
const updateDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        let { designationName, status } = req.body;

        const updateData = {};
        if (designationName) {
            designationName = toTitleCase(designationName);

            // Check if a designation with the same name already exists (excluding current designation)
            const existingDesignation = await Designation.findOne({
                designationName,
                _id: { $ne: id },
                isDeleted: false
            });

            if (existingDesignation) {
                return res.status(400).json({ message: "Designation with this name already exists." });
            }

            updateData.designationName = designationName;
        }
        if (status) {
            updateData.status = status;
        }

        const updatedDesignation = await Designation.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedDesignation) {
            return res.status(404).json({ message: "Designation not found." });
        }

        return res.status(200).json({ message: "Designation updated successfully.", updatedDesignation });
    } catch (err) {
        console.error("Error updating designation:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
};

// Soft delete designation by ID
const deleteDesignation = async (req, res) => {
    try {
        const { id } = req.params;

        const designation = await Designation.findById(id);

        if (!designation) {
            return res.status(404).json({ message: "Designation not found." });
        }

        // Mark the designation as deleted (soft delete)
        designation.isDeleted = true;
        await designation.save();

        return res.status(200).json({ message: "Designation deleted successfully." });
    } catch (err) {
        console.error("Error deleting designation:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
};

// Get all active designations, ordered alphabetically (A to Z)
const getActiveDesignation = async (req, res) => {
    try {
        const activeDesignations = await Designation.find({ status: "active", isDeleted: false })
            .sort({ designationName: 1 }); // Sort by name in ascending order

        return res.status(200).json({ message: "Active Designations", activeDesignations });
    } catch (err) {
        console.error("Error fetching active designations:", err);
        return res.status(500).json({ message: "Server error", error: err });
    }
};

module.exports = {
    createDesignation,
    getAllDesignations,
    getDesignationById,
    updateDesignation,
    deleteDesignation,
    getActiveDesignation
};
