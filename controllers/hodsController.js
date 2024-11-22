const HOD = require("../models/clubHods");


const addHOD = async (req, res) => {
    try {
        const { name, designation, department, contactNumber, status } = req.body;

        // Check if file was uploaded
        const image = req.file ? `/uploads/hods/${req.file.filename}` : "";

        // Create a new HOD entry
        const newHOD = new HOD({
            name,
            designation,
            department,
            contactNumber,
            image,
            status,
        });

        // Save the HOD to the database
        await newHOD.save();

        return res.status(201).json({ message: "HOD added successfully", hod: newHOD });
    } catch (error) {
        console.error("Error adding HOD:", error);
        return res.status(500).json({ message: "Error adding HOD", error: error.message });
    }
};

const updateHOD = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, designation, department, contactNumber, status } = req.body;

        // Check if file was uploaded
        const image = req.file ? `/uploads/hods/${req.file.filename}` : "";

        // Prepare the update object dynamically
        const updates = {};
        if (name) updates.name = name;
        if (designation) updates.designation = designation;
        if (department) updates.department = department;
        if (contactNumber) updates.contactNumber = contactNumber;
        if (status) updates.status = status;
        if (image) updates.image = image; // Update profile image only if uploaded

        // Find and update the HOD
        const updatedHOD = await HOD.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedHOD) {
            return res.status(404).json({ message: "HOD not found" });
        }

        return res.status(200).json({ message: "HOD updated successfully", hod: updatedHOD });
    } catch (error) {
        console.error("Error updating HOD:", error);
        return res.status(500).json({ message: "Error updating HOD", error: error.message });
    }
};

const getAllHODs = async (req, res) => {
    try {
        const data = await HOD.find();
        const hods = await data.reverse()
        return res.status(200).json({ message: "HODs fetched successfully", hods });
    } catch (error) {
        console.error("Error fetching HODs:", error);
        return res.status(500).json({ message: "Error fetching HODs", error: error.message });
    }
};

const getHODById = async (req, res) => {
    try {
        const { id } = req.params;
        const hod = await HOD.findById(id);

        if (!hod) {
            return res.status(404).json({ message: "HOD not found" });
        }

        return res.status(200).json({ message: "HOD fetched successfully", hod });
    } catch (error) {
        console.error("Error fetching HOD by ID:", error);
        return res.status(500).json({ message: "Error fetching HOD by ID", error: error.message });
    }
};


const deleteHOD = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedHOD = await HOD.findByIdAndDelete(id);

        if (!deletedHOD) {
            return res.status(404).json({ message: "HOD not found" });
        }

        return res.status(200).json({ message: "HOD deleted successfully" });
    } catch (error) {
        console.error("Error deleting HOD:", error);
        return res.status(500).json({ message: "Error deleting HOD", error: error.message });
    }
};

const getActiveHODs = async (req, res) => {
    try {
        // Find all HODs with status "Active"
        const activeHODs = await HOD.find({ status: "Active" });

        if (activeHODs.length === 0) {
            return res.status(404).json({ message: "No active HODs found" });
        }

        return res.status(200).json({ message: "Active HODs fetched successfully", hods: activeHODs });
    } catch (error) {
        console.error("Error fetching active HODs:", error);
        return res.status(500).json({ message: "Error fetching active HODs", error: error.message });
    }
};


module.exports = {
    addHOD,
    updateHOD,
    getAllHODs,
    getHODById,
    deleteHOD,
    getActiveHODs
}