const Download = require('../models/download'); // The Download model

// Middleware function for adding a download
const addDownload = async (req, res, next) => {
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
        const newDownload = new Download({
            title,
            description,
            fileUrl: fileUrl, // Path to the uploaded file
            status: status || 'ACTIVE', // Default status is ACTIVE
            expiredDate
        });

        // Save to the database
        await newDownload.save();

        return res.status(201).json({
            message: 'Download added successfully',
            download: newDownload,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error adding download',
            error: error.message,
        });
    }
};

const getAllDownloads = async (req, res) => {
    try {
        const data = await Download.find();
        const downloads = data.reverse();
        return res.status(200).json({ message: "Downloads fetched successfully", downloads });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching downloads', error: error.message });
    }
}

const downloadDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const download = await Download.findById(id);
        if (!download) {
            return res.status(404).json({ message: 'Download not found' });
        }

        return res.status(200).json({ message: "download fetched successfully", download });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching download', error: error.message });
    }
}

const updateDownload = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, expiredDate } = req.body;
        // const updates = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Please Providethe valid id' });
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

        const updatedDownload = await Download.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedDownload) {
            return res.status(404).json({ message: 'Download not found' });
        }

        return res.status(200).json({ message: 'Download updated successfully', download: updatedDownload });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating download', error: error.message });
    }
}

const deletedDownload = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedDownload = await Download.findByIdAndDelete(id);
        if (!deletedDownload) {
            return res.status(404).json({ message: 'Download not found' });
        }

        return res.status(200).json({ message: 'Download deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting download', error: error.message });
    }
}

const getActiveDownloads = async (req, res) => {
    try {
        const { type } = req.query; // Extract 'type' from query params
        const currentDate = new Date(); // Current date for comparison

        let query = { status: 'Active' }; // Base query for active downloads

        if (type === 'current') {
            // Only include downloads that are not expired
            query.$or = [
                { expiredDate: null }, // No expiry date (never expires)
                { expiredDate: { $gte: currentDate } }, // Expiry date is in the future
            ];
        } else if (type === 'history') {
            // Only include downloads that are expired
            query.expiredDate = { $lt: currentDate }; // Expiry date is in the past
        }

        // Fetch downloads based on the query
        const downloads = await Download.find(query).sort({ createdAt: -1 }); // Sort by most recent first

        return res.status(200).json({
            message: 'Downloads fetched successfully',
            downloads,
        });
    } catch (error) {
        console.error('Error fetching downloads:', error);
        return res.status(500).json({
            message: 'Error fetching downloads',
            error: error.message,
        });
    }
};


module.exports = {
    addDownload,
    updateDownload,
    getAllDownloads,
    downloadDetails,
    deletedDownload,
    getActiveDownloads
}