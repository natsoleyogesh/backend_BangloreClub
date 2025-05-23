const ClubNotice = require('../models/clubNotice'); // The ClubNotice model
const { toTitleCase } = require('../utils/common');
const { createNotification } = require('../utils/pushNotification');

// Middleware function for adding a notice
const addNotice = async (req, res) => {
    try {
        console.log(req.files, "files", req.file);

        // Validate uploaded files
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                message: 'No files uploaded or invalid file type. Please provide valid files.',
            });
        }

        const { title, description, status, expiredDate, showBanner } = req.body;

        const normalizedTitle = toTitleCase(title);

        // Check if the notice already exists
        const existingNotice = await ClubNotice.findOne({ title: normalizedTitle });
        if (existingNotice) {
            return res.status(400).json({ message: 'Club Notice already exists.' });
        }

        // Extract file URLs from uploaded files
        const fileUrl = req.files['fileUrl'] ? `/uploads/notices/${req.files['fileUrl'][0].filename}` : "";
        const bannerImage = req.files['bannerImage'] ? `/uploads/notices/${req.files['bannerImage'][0].filename}` : "";

        // Create a new notice document
        const newNotice = new ClubNotice({
            title: normalizedTitle,
            description,
            fileUrl, // Path to the uploaded file
            bannerImage, // Path to the uploaded banner image
            status: status || 'Active', // Default status is ACTIVE
            expiredDate,
            showBanner,
        });

        // Save to the database
        await newNotice.save();

        // Call the createNotification function
        await createNotification({
            title: `Notice - ${newNotice.title}`,
            send_to: "All",
            // push_message: `${newNotice.description}`,
            push_message: `New Club Notice is available for you at the club notice section.`,
            department: "clubNotice",
            image: bannerImage, // Assign the value directly
        });

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

// const getAllNotices = async (req, res) => {
//     try {
//         const data = await ClubNotice.find();
//         const notices = data.reverse();
//         return res.status(200).json({ message: "Club Notices fetched successfully", notices });
//     } catch (error) {
//         return res.status(500).json({ message: 'Error fetching notices', error: error.message });
//     }
// };

const getAllNotices = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Convert pagination parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of notices
        const totalNotices = await ClubNotice.countDocuments();

        // Fetch paginated notices
        const notices = await ClubNotice.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            message: "Club Notices fetched successfully",
            notices,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalNotices / limit),
                totalNotices,
                pageSize: limit,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching notices", error: error.message });
    }
};


const clubNoticeDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await ClubNotice.findById(id);
        if (!notice) {
            return res.status(404).json({ message: 'Club Notice not found' });
        }

        return res.status(200).json({ message: "Club Notice fetched successfully", notice });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching Club Notice', error: error.message });
    }
};

// Middleware function for updating a notice
const updateClubNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, expiredDate, showBanner } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Please provide a valid id' });
        }

        // Validate uploaded files
        const fileUrl = req.files && req.files['fileUrl'] ? `/uploads/notices/${req.files['fileUrl'][0].filename}` : "";
        const bannerImage = req.files && req.files['bannerImage'] ? `/uploads/notices/${req.files['bannerImage'][0].filename}` : "";

        // Prepare the update object dynamically
        const updates = {};

        if (title) {
            const normalizedTitle = toTitleCase(title);

            const existingNotice = await ClubNotice.findOne({
                title: normalizedTitle,
                _id: { $ne: id }, // Exclude the current document by ID
            });

            if (existingNotice) {
                return res.status(400).json({ message: 'A club notice with this title already exists.' });
            }

            updates.title = normalizedTitle;
        }

        if (description) updates.description = description;
        if (status) updates.status = status;
        if (fileUrl) updates.fileUrl = fileUrl; // Update file URL only if uploaded
        if (bannerImage) updates.bannerImage = bannerImage; // Update banner image if uploaded
        if (expiredDate) updates.expiredDate = expiredDate;
        if (showBanner !== undefined) updates.showBanner = showBanner; // Handle boolean values explicitly

        const updatedNotice = await ClubNotice.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedNotice) {
            return res.status(404).json({ message: 'Club Notice not found' });
        }

        return res.status(200).json({ message: 'Club Notice updated successfully', notice: updatedNotice });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating notice', error: error.message });
    }
};

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
};

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
    getActiveNotices,
};
