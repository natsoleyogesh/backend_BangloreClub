const Download = require('../models/download'); // The Download model
const { toTitleCase } = require('../utils/common');

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

        const normalizedTitle = toTitleCase(title);
        // Check if category already exists
        const existingDownload = await Download.findOne({ title: normalizedTitle, isDeleted: false });
        if (existingDownload) {
            return res.status(400).json({ message: 'Download Is already exists but Inactive.' });
        }

        const fileUrl = req.file ? `/uploads/downloads/${req.file.filename}` : "";
        // Create a new download document
        const newDownload = new Download({
            title,
            description,
            fileUrl: fileUrl, // Path to the uploaded file
            status: status || 'Active', // Default status is ACTIVE
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

// const getAllDownloads = async (req, res) => {
//     try {
//         const data = await Download.find();
//         const downloads = data.reverse();
//         return res.status(200).json({ message: "Downloads fetched successfully", downloads });
//     } catch (error) {
//         return res.status(500).json({ message: 'Error fetching downloads', error: error.message });
//     }
// }

const getAllDownloads = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Convert pagination parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of downloads
        const totalDownloads = await Download.countDocuments();

        // Fetch paginated downloads
        const downloads = await Download.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            message: "Downloads fetched successfully",
            downloads,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalDownloads / limit),
                totalDownloads,
                pageSize: limit,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching downloads",
            error: error.message,
        });
    }
};


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
        let { title, description, status, expiredDate } = req.body;
        // const updates = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Please Providethe valid id' });
        }
        // Check if file was uploaded
        const fileUrl = req.file ? `/uploads/downloads/${req.file.filename}` : "";

        // Prepare the update object dynamically
        const updates = {};
        // if (title) updates.title = title;
        if (title) {
            title = toTitleCase(title);

            const existingNotice = await Download.findOne({
                title,
                _id: { $ne: id }, // Exclude the current document by ID
            });

            if (existingNotice) {
                return res.status(400).json({ message: 'A download with this title already exists.' });
            }

            // Add normalized title to updates
            updates.title = title;
        }
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