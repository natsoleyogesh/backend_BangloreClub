
const Department = require("../../models/department");
const { toTitleCase } = require("../../utils/common");

// Create a new department
const createDepartment = async (req, res) => {
    try {
        const { departmentName, email, status } = req.body;

        const normalizedName = toTitleCase(departmentName);

        // Check if department already exists
        const existingDepartment = await Department.findOne({ departmentName: normalizedName, isDeleted: false });
        if (existingDepartment) {
            return res.status(400).json({ message: 'Department already exists.' });
        }

        // Create and save the new department
        const department = new Department({ departmentName, email, status });
        await department.save();

        return res.status(201).json({ message: "Department Add Successfully", department });
    } catch (err) {
        console.log(err, "rery")
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get all departments, excluding soft deleted ones, and ordered by latest first
const getAllDepartments = async (req, res) => {
    try {
        // Fetch all departments that are not marked as deleted, sorted by `createdAt` in descending order
        const departments = await Department.find({ isDeleted: false }).sort({ createdAt: -1 });

        return res.status(200).json({ message: "All Departments", departments });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        return res.status(200).json({ message: "Department Details", department });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Update department by ID
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        let { departmentName, email, status } = req.body;

        const updateData = {};
        if (departmentName) {
            departmentName = toTitleCase(departmentName);

            // Check if a category with the same departmentName (case-insensitive) already exists (excluding current category)
            const existingAmenities = await Department.findOne({
                departmentName,
                _id: { $ne: id }, // Exclude the current category
                isDeleted: false // Check only non-deleted categories
            });

            if (existingAmenities) {
                return res.status(400).json({ message: 'Department with this departmentName already exists.' });
            }

            // Add normalized departmentName to updates
            updateData.departmentName = departmentName;
        }
        if (status) {
            updateData.status = status
        }
        if (email) {
            updateData.email = email
        }

        const updatedDepartment = await Department.findByIdAndUpdate(
            id,
            updateData,
            { new: true }  // Return the updated document
        );

        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        return res.status(200).json({ message: "Department Update Successfully!", updatedDepartment });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Soft delete department by ID
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        // Mark the department as deleted (soft delete)
        department.isDeleted = true;
        await department.save();

        return res.status(200).json({ message: 'Department deleted successfully.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get all active departments, excluding soft deleted ones, and ordered by latest first
const getActiveDepartments = async (req, res) => {
    try {
        const activeDepartments = await Department.find({ status: 'active', isDeleted: false })
            .sort({ createdAt: -1 }); // Sort by creation date in descending order
        return res.status(200).json({ message: "Active Departments", activeDepartments });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    getActiveDepartments
};
