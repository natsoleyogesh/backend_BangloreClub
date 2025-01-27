const { toTitleCase } = require('../../utils/common');
const AboutUs = require('../../models/aboutUs');

// Add a new about entry
const addAbout = async (req, res) => {
    try {

        const { title, description, status } = req.body;
        const normalizedTitle = toTitleCase(title);

        // Create a new about entry
        const about = new AboutUs({
            title: normalizedTitle,
            description,
            status,
        });

        // Save to the database
        await about.save();

        res.status(201).json({ message: "About entry added successfully", about });
    } catch (error) {
        res.status(500).json({ message: "Error adding about entry", error: error.message });
    }
};

// Get all about entries
const getAllAbout = async (req, res) => {
    try {
        const aboutEntries = await AboutUs.find({ isDeleted: false });

        res.status(200).json({ aboutEntries });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving about entries", error: error.message });
    }
};

// Get an about entry by ID
const getAboutById = async (req, res) => {
    try {
        const { id } = req.params;

        const about = await AboutUs.findOne({ _id: id, isDeleted: false });

        if (!about) {
            return res.status(404).json({ message: "About entry not found" });
        }

        res.status(200).json({ about });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving about entry", error: error.message });
    }
};

// Update an about entry
const updateAbout = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        // Update only provided fields
        const updates = {
            ...(title && { title }),
            ...(description && { description }),
            ...(status && { status }),
        };

        const about = await AboutUs.findOneAndUpdate(
            { _id: id, isDeleted: false },
            updates,
            { new: true, runValidators: true } // Return the updated document
        );

        if (!about) {
            return res.status(404).json({ message: "About entry not found" });
        }

        res.status(200).json({ message: "About entry updated successfully", about });
    } catch (error) {
        res.status(500).json({ message: "Error updating about entry", error: error.message });
    }
};

// Soft delete an about entry
const deleteAbout = async (req, res) => {
    try {
        const { id } = req.params;

        const about = await AboutUs.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!about) {
            return res.status(404).json({ message: "About entry not found" });
        }

        res.status(200).json({ message: "About entry deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting about entry", error: error.message });
    }
};

module.exports = {
    addAbout,
    getAllAbout,
    getAboutById,
    updateAbout,
    deleteAbout,
};
