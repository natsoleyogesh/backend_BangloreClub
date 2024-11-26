const COM = require('../models/com'); // The Download model

// Middleware function for adding a download
const addCOM = async (req, res, next) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded or invalid file type. Please provide a valid PDF file.',
            });
        }

        const { title, description, status, expiredDate } = req.body;

        const fileUrl = req.file ? `/uploads/downloads/${req.file.filename}` : "";
        // Create a new download document
        const newCOM = new COM({
            title,
            description,
            fileUrl: fileUrl, // Path to the uploaded file
            status: status || 'Active', // Default status is ACTIVE
            expiredDate
        });

        // Save to the database
        await newCOM.save();

        return res.status(201).json({
            message: 'Consideration Of Membership added successfully',
            com: newCOM,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error adding Consideration Of Membership',
            error: error.message,
        });
    }
};

const getAllCOMs = async (req, res) => {
    try {
        const data = await COM.find();
        const coms = data.reverse();
        return res.status(200).json({ message: "Consideration Of Membership fetched successfully", coms });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching Consideration Of Membership', error: error.message });
    }
}

const COMDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const com = await COM.findById(id);
        if (!com) {
            return res.status(404).json({ message: 'Consideration Of Membership not found' });
        }

        return res.status(200).json({ message: "Consideration Of Membership fetched successfully", com });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching Consideration Of Membership', error: error.message });
    }
}

const updateCOM = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, expiredDate } = req.body;
        // const updates = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Please Provide the valid id' });
        }
        // Check if file was uploaded
        const fileUrl = req.file ? `/uploads/downloads/${req.file.filename}` : "";

        // Prepare the update object dynamically
        const updates = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (status) updates.status = status;
        if (fileUrl) updates.fileUrl = fileUrl; // Update profile image only if uploaded
        if (expiredDate) updates.expiredDate = expiredDate;

        const updatedCom = await COM.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedCom) {
            return res.status(404).json({ message: 'Consideration Of Membership not found' });
        }

        return res.status(200).json({ message: 'Consideration Of Membership updated successfully', com: updatedCom });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating Consideration Of Membership', error: error.message });
    }
}

const deletedCOM = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCom = await COM.findByIdAndDelete(id);
        if (!deletedCom) {
            return res.status(404).json({ message: 'Consideration Of Membership not found' });
        }

        return res.status(200).json({ message: 'Consideration Of Membership deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting Consideration Of Membership', error: error.message });
    }
}

const getActiveComs = async (req, res) => {
    try {
        const { type } = req.query; // Extract 'type' from query params
        const currentDate = new Date(); // Current date for comparison
        const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0)); // Start of today

        let query = { status: 'Active' }; // Base query for active downloads

        if (type === 'current') {
            // Include downloads that are not expired or expire today or in the future
            query.$or = [
                { expiredDate: null }, // No expiry date (never expires)
                { expiredDate: { $gte: startOfToday } }, // Expiry date is today or in the future
            ];
        } else if (type === 'history') {
            // Only include downloads that expired strictly before today
            query.expiredDate = { $lt: startOfToday }; // Expiry date is strictly in the past
        }

        // Fetch downloads based on the query
        const coms = await COM.find(query).sort({ createdAt: -1 }); // Sort by most recent first

        return res.status(200).json({
            message: 'Consideration Of Membership fetched successfully',
            coms,
        });
    } catch (error) {
        console.error('Error fetching Consideration Of Membership:', error);
        return res.status(500).json({
            message: 'Error fetching Consideration Of Membership',
            error: error.message,
        });
    }
};



module.exports = {
    addCOM,
    getAllCOMs,
    COMDetails,
    updateCOM,
    deletedCOM,
    getActiveComs
}