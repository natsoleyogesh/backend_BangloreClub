const ClubRuleByelaw = require("../models/ruleByelaw");
const { toTitleCase } = require("../utils/common");

const addRuleBylaw = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded or invalid file type. Please provide a valid PDF file.',
            });
        }

        // Destructure input data from request body
        const { title, status, expiredDate } = req.body;

        // Validate required fields
        if (!title) {
            return res.status(400).json({
                message: 'Title is required.',
            });
        }

        // Normalize the title (e.g., convert to title case)
        const normalizedTitle = toTitleCase(title);

        // Check if a record with the same title already exists
        const existingRule = await ClubRuleByelaw.findOne({
            title: normalizedTitle,
            isDeleted: false
        });

        if (existingRule) {
            return res.status(400).json({
                message: 'A rule with this title already exists but is inactive.'
            });
        }

        // Validate the expiredDate (if provided)
        if (expiredDate) {
            const currentDate = new Date();
            const providedDate = new Date(expiredDate);

            if (providedDate <= currentDate) {
                return res.status(400).json({
                    message: 'Expired date must be a future date.',
                });
            }
        }

        // Define the file URL
        const fileUrl = `/uploads/downloads/${req.file.filename}`;

        // Create a new record for the rule/bylaw
        const newRule = new ClubRuleByelaw({
            title: normalizedTitle,
            fileUrl,
            status: status || 'Active', // Default status is "Active" if not provided
            expiredDate: expiredDate || null, // Allow expiredDate to be optional
        });

        // Save the new rule to the database
        await newRule.save();

        // Respond with success message and data
        return res.status(201).json({
            message: 'Rule/Bylaw added successfully.',
            download: newRule,
        });
    } catch (error) {
        // Handle server errors
        console.error('Error adding rule/bylaw:', error);
        return res.status(500).json({
            message: 'An error occurred while adding the rule/bylaw.',
            error: error.message,
        });
    }
};

const getAllRulesBylaws = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Convert pagination parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of rules and bylaws
        const totalRulesBylaws = await ClubRuleByelaw.countDocuments({ isDeleted: false });

        // Fetch paginated rules and bylaws
        const rulesBylaws = await ClubRuleByelaw.find({ isDeleted: false })
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        // Return success response with pagination info
        return res.status(200).json({
            message: "Rules and Bylaws fetched successfully.",
            ruleByelaws: rulesBylaws,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalRulesBylaws / limit),
                totalRulesBylaws,
                pageSize: limit,
            },
        });
    } catch (error) {
        // Log the error for debugging
        console.error("Error fetching Rules and Bylaws:", error);

        // Return error response
        return res.status(500).json({
            message: "An error occurred while fetching Rules and Bylaws.",
            error: error.message,
        });
    }
};

const getRuleBylawById = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await ClubRuleByelaw.findById(id);

        if (!item) {
            return res.status(404).json({ message: "Rule/Byelaw not found." });
        }

        res.status(200).json({
            message: "Rule/Byelaw fetched successfully.",
            ruleByelaw: item,
        });
    } catch (error) {
        console.error("Error fetching Rule/Bylaw:", error);
        res.status(500).json({
            message: "Failed to fetch Rule/Bylaw.",
            error: error.message,
        });
    }
};

const updateRuleBylaw = async (req, res) => {
    try {
        // Extract the rule/bylaw ID from the request parameters
        const { id } = req.params;

        // Destructure fields from the request body
        const { title, status, expiredDate } = req.body;

        // Validate the ID
        if (!id) {
            return res.status(400).json({
                message: "Please provide a valid ID.",
            });
        }

        // Check if a file was uploaded and set the file URL
        const fileUrl = req.file ? `/uploads/downloads/${req.file.filename}` : "";

        // Prepare the updates object dynamically
        const updates = {};

        // Handle title normalization and duplication check
        if (title) {
            const normalizedTitle = toTitleCase(title);

            // Check if a rule/bylaw with the same title already exists (excluding the current one)
            const existingRule = await ClubRuleByelaw.findOne({
                title: normalizedTitle,
                _id: { $ne: id }, // Exclude the current document
                isDeleted: false, // Only check for non-deleted entries
            });

            if (existingRule) {
                return res.status(400).json({
                    message: "A rule/bylaw with this title already exists.",
                });
            }

            updates.title = normalizedTitle;
        }

        // Add optional fields to updates if they are present in the request body
        if (status) updates.status = status;
        if (expiredDate) updates.expiredDate = expiredDate;
        if (fileUrl) updates.fileUrl = fileUrl;

        // Perform the update in the database
        const updatedRule = await ClubRuleByelaw.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
        });

        // If no document was found, return a 404 error
        if (!updatedRule) {
            return res.status(404).json({
                message: "Rule/Bylaw not found.",
            });
        }

        // Respond with success
        return res.status(200).json({
            message: "Rule/Bylaw updated successfully.",
            ruleByelaw: updatedRule,
        });
    } catch (error) {
        // Log and respond with server error
        console.error("Error updating rule/bylaw:", error);
        return res.status(500).json({
            message: "An error occurred while updating the rule/bylaw.",
            error: error.message,
        });
    }
};

const deleteRuleBylaw = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedItem = await ClubRuleByelaw.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ message: "Rule/Bylaw not found." });
        }

        res.status(200).json({
            message: "Rule/Bylaw deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting Rule/Bylaw:", error);
        res.status(500).json({
            message: "Failed to delete Rule/Bylaw.",
            error: error.message,
        });
    }
};

const getActiveRulesBylaws = async (req, res) => {
    try {
        const { type, page = 1, limit = 10 } = req.query; // Extract 'type', 'page', and 'limit' from query params
        const currentDate = new Date(); // Current date for comparison
        const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0)); // Start of today

        let query = { isDeleted: false }; // Base query

        // Determine the query based on the 'type'
        if (type === 'current') {
            // Fetch only current (active and not expired) rules
            query.status = 'Active';
            query.$or = [
                { expiredDate: null }, // No expiry date (never expires)
                { expiredDate: { $gte: startOfToday } }, // Expiry date is today or in the future
            ];
        } else if (type === 'history') {
            // Fetch only expired rules
            query.expiredDate = { $lt: startOfToday }; // Expiry date is strictly in the past
        }

        // Pagination logic
        const skip = (page - 1) * limit; // Calculate number of documents to skip
        const total = await ClubRuleByelaw.countDocuments(query); // Get the total count of matching documents
        const downloads = await ClubRuleByelaw.find(query)
            .sort({ createdAt: -1 }) // Sort by most recent first
            .skip(skip) // Skip documents for pagination
            .limit(parseInt(limit)); // Limit the number of results

        // Return the response
        return res.status(200).json({
            message: 'Rules and Bylaws fetched successfully.',
            ruleByelaws: downloads,
            pagination: {
                total, // Total number of matching documents
                page: parseInt(page), // Current page
                limit: parseInt(limit), // Number of results per page
                totalPages: Math.ceil(total / limit), // Total number of pages
            },
        });
    } catch (error) {
        console.error('Error fetching Rules/Bylaws:', error);
        return res.status(500).json({
            message: 'An error occurred while fetching Rules and Bylaws.',
            error: error.message,
        });
    }
};

module.exports = {
    addRuleBylaw,
    updateRuleBylaw,
    getAllRulesBylaws,
    getRuleBylawById,
    deleteRuleBylaw,
    getActiveRulesBylaws
}