const ClubRuleByelaw = require("../models/ruleByelaw");
const { toTitleCase } = require("../utils/common");


const addRuleBylaw = async (req, res) => {
    try {
        const { type, category, title, description, isExpandable, status } = req.body;

        // Validate type
        if (!type || !["Rule", "Byelaw"].includes(type)) {
            return res.status(400).json({ message: "Invalid or missing type. Valid types: Rule, Byelaw." });
        }

        // // Check if a rule/bylaw with the same type, category, and title already exists
        // const existingRuleBylaw = await ClubRuleByelaw.findOne({
        // type,
        // category,
        //     title,
        // });

        // if (existingRuleBylaw) {
        //     return res.status(400).json({
        //         message: `A ${type} with the same category and title already exists.`,
        //     });
        // }
        const normalizedTitle = toTitleCase(title);
        // Check if category already exists
        const existingRuleBylaw = await ClubRuleByelaw.findOne({ title: normalizedTitle, type, isDeleted: false });
        if (existingRuleBylaw) {
            return res.status(400).json({ message: 'Club Notice Is already exists but Inactive.' });
        }

        // Create new rule/bylaw
        const newRuleBylaw = new ClubRuleByelaw({
            type,
            // category,
            title,
            description,
            isExpandable,
            status,
        });

        const savedRuleBylaw = await newRuleBylaw.save();

        res.status(201).json({
            message: `${type} added successfully.`,
            ruleByelaw: savedRuleBylaw,
        });
    } catch (error) {
        console.error("Error adding Rule/Bylaw:", error);
        res.status(500).json({
            message: "Failed to add Rule/Bylaw.",
            error: error.message,
        });
    }
};


const getAllRulesBylaws = async (req, res) => {
    try {
        const { type } = req.query;

        // Validate type if provided
        if (type && !["Rule", "Byelaw"].includes(type)) {
            return res.status(400).json({ message: "Invalid type. Valid types are 'Rule' or 'Byelaw'." });
        }

        // Build query dynamically
        const query = type ? { type } : {}; // If type is provided, filter by it

        const items = await ClubRuleByelaw.find(query).sort({ createdAt: -1 }); // Fetch based on query

        res.status(200).json({
            message: "Rules and Bylaws fetched successfully.",
            ruleByelaws: items,
        });
    } catch (error) {
        console.error("Error fetching Rules/Bylaws:", error);
        res.status(500).json({
            message: "Failed to fetch Rules/Bylaws.",
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
        const { id } = req.params;
        let { title } = req.body;
        // Log the incoming request body for debugging
        console.log("Received request body:", req.body);

        // Build the updates object dynamically based on provided fields
        const updates = {};
        if (req.body.type) {
            if (!["Rule", "Byelaw"].includes(req.body.type)) {
                return res.status(400).json({ message: "Invalid type. Valid types: Rule, Byelaw." });
            }
            updates.type = req.body.type;
        }

        // if (req.body.category) {
        //     if (typeof req.body.category !== "string") {
        //         return res.status(400).json({ message: "Category must be a string." });
        //     }
        //     updates.category = req.body.category;
        // }

        if (title) {
            if (typeof title !== "string") {
                return res.status(400).json({ message: "Title must be a string." });
            }
            // updates.title = req.body.title;

            title = toTitleCase(title);

            const existingRuleBylaw = await ClubRuleByelaw.findOne({
                title,
                _id: { $ne: id }, // Exclude the current document by ID
            });

            if (existingRuleBylaw) {
                return res.status(400).json({ message: 'A club notice with this title already exists.' });
            }

            // Add normalized title to updates
            updates.title = title;

        }

        if (req.body.description) {
            if (typeof req.body.description !== "string") {
                return res.status(400).json({ message: "Description must be a string." });
            }
            updates.description = req.body.description;
        }

        if (req.body.isExpandable !== undefined) {
            if (typeof req.body.isExpandable !== "boolean") {
                return res.status(400).json({ message: "isExpandable must be a boolean." });
            }
            updates.isExpandable = req.body.isExpandable;
        }

        if (req.body.status) {
            if (!["Active", "Inactive"].includes(req.body.status)) {
                return res.status(400).json({ message: "Invalid status. Valid values: Active, Inactive." });
            }
            updates.status = req.body.status;
        }

        // Check for duplicates if title, type, and category are being updated
        if (updates.type || updates.category || updates.title) {
            const duplicateCheck = await ClubRuleByelaw.findOne({
                _id: { $ne: id }, // Exclude the current record
                type: updates.type || (await ClubRuleByelaw.findById(id)).type, // Use current value if not updated
                category: updates.category || (await ClubRuleByelaw.findById(id)).category,
                title: updates.title || (await ClubRuleByelaw.findById(id)).title,
            });

            if (duplicateCheck) {
                return res.status(400).json({
                    message: `A ${updates.type || "Rule/Byelaw"} with the same category and title already exists.`,
                });
            }
        }

        // Update the rule/bylaw
        const updatedItem = await ClubRuleByelaw.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ message: "Rule/Byelaw not found." });
        }

        res.status(200).json({
            message: "Rule/Byelaw updated successfully.",
            ruleByelaw: updatedItem,
        });
    } catch (error) {
        console.error("Error updating Rule/Byelaw:", error);
        res.status(500).json({
            message: "Failed to update Rule/Byelaw.",
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
        const { search, page = 1, limit = 5, type } = req.query;

        // Validate type if provided
        if (type && !["Rule", "Byelaw"].includes(type)) {
            return res.status(400).json({ message: "Invalid type. Valid types are 'Rule' or 'Byelaw'." });
        }

        // Build query dynamically
        const query = { status: "Active" };

        if (type) query.type = type; // Filter by type if provided

        // If a search term is provided, apply it to multiple fields (e.g., title, category, etc.)
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } }, // Case-insensitive search on title
                { category: { $regex: search, $options: "i" } }, // Case-insensitive search on category
                { description: { $regex: search, $options: "i" } } // Case-insensitive search on description
            ];
        }

        // Pagination logic
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 5; // Default limit is 5
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch search results with pagination
        const results = await ClubRuleByelaw.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        // Get total count for pagination metadata
        const totalItems = await ClubRuleByelaw.countDocuments(query);

        res.status(200).json({
            message: "Search results fetched successfully.",
            ruleByelaws: results,
            pagination: {
                totalItems,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalItems / limitNumber),
                limit: limitNumber,
            },
        });
    } catch (error) {
        console.error("Error searching Rules/Bylaws:", error);
        res.status(500).json({
            message: "Failed to fetch search results.",
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