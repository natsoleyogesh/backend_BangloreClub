const ClubNotice = require('../models/clubNotice'); // The Download model

// Middleware function for adding a download
const addNotice = async (req, res, next) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded or invalid file type. Please provide a valid file.',
            });
        }

        const { title, description, status, expiredDate } = req.body;

        const fileUrl = req.file ? `/uploads/notices/${req.file.filename}` : "";
        // Create a new download document
        const newNotice = new ClubNotice({
            title,
            description,
            fileUrl: fileUrl, // Path to the uploaded file
            status: status || 'Active', // Default status is ACTIVE
            expiredDate
        });

        // Save to the database
        await newNotice.save();

        return res.status(201).json({
            message: 'Club Notice added successfully',
            notice: newNotice,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error adding notice',
            error: error.message,
        });
    }
};

const getAllNotices = async (req, res) => {
    try {
        const data = await ClubNotice.find();
        const notices = data.reverse();
        return res.status(200).json({ message: "Club Notices fetched successfully", notices });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching Notices', error: error.message });
    }
}

const clubNoticeDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await ClubNotice.findById(id);
        if (!notice) {
            return res.status(404).json({ message: 'clubNotice not found' });
        }

        return res.status(200).json({ message: "Club Notice fetched successfully", notice });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching Club Notice', error: error.message });
    }
}

const updateClubNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, expiredDate } = req.body;
        // const updates = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Please Providethe valid id' });
        }
        // Check if file was uploaded
        const fileUrl = req.file ? `/uploads/notices/${req.file.filename}` : "";

        // Prepare the update object dynamically
        const updates = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (status) updates.status = status;
        if (fileUrl) updates.fileUrl = fileUrl; // Update profile image only if uploaded
        if (expiredDate) updates.expiredDate = expiredDate;

        const updateClubNotice = await ClubNotice.findByIdAndUpdate(id, updates, { new: true });
        if (!updateClubNotice) {
            return res.status(404).json({ message: 'Club Notice not found' });
        }

        return res.status(200).json({ message: 'Club Notice updated successfully', notice: updateClubNotice });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating notice', error: error.message });
    }
}

const deletedNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedNotice = await ClubNotice.findByIdAndDelete(id);
        if (!deletedNotice) {
            return res.status(404).json({ message: 'Club Notice not found' });
        }

        return res.status(200).json({ message: 'Club Notice deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting notice', error: error.message });
    }
}

const getActiveNotices = async (req, res) => {
    try {
        const { type } = req.query; // Extract 'type' from query params
        const currentDate = new Date(); // Current date for comparison
        const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0)); // Start of today

        let query = { status: 'Active' }; // Base query for active notices

        if (type === 'current') {
            // Include notices that are not expired or expire today or in the future
            query.$or = [
                { expiredDate: null }, // No expiry date (never expires)
                { expiredDate: { $gte: startOfToday } }, // Expiry date is today or in the future
            ];
        } else if (type === 'past') {
            // Include notices that expired strictly before today
            query.expiredDate = { $lt: startOfToday }; // Expiry date is strictly in the past
        }

        // Fetch notices based on the query
        const notices = await ClubNotice.find(query).sort({ createdAt: -1 }); // Sort by most recent first

        return res.status(200).json({
            message: 'Club Notices fetched successfully',
            notices,
        });
    } catch (error) {
        console.error('Error fetching notices:', error);
        return res.status(500).json({
            message: 'Error fetching notices',
            error: error.message,
        });
    }
};



module.exports = {
    addNotice,
    updateClubNotice,
    getAllNotices,
    clubNoticeDetails,
    deletedNotice,
    getActiveNotices
}