const ClubRuleByelaw = require("../models/ruleByelaw");
const { toTitleCase } = require("../utils/common");


// const addRuleBylaw = async (req, res) => {
//     try {
//         const { type, category, title, description, isExpandable, status } = req.body;

//         // Validate type
//         if (!type || !["Rule", "Byelaw"].includes(type)) {
//             return res.status(400).json({ message: "Invalid or missing type. Valid types: Rule, Byelaw." });
//         }

//         // // Check if a rule/bylaw with the same type, category, and title already exists
//         // const existingRuleBylaw = await ClubRuleByelaw.findOne({
//         // type,
//         // category,
//         //     title,
//         // });

//         // if (existingRuleBylaw) {
//         //     return res.status(400).json({
//         //         message: `A ${type} with the same category and title already exists.`,
//         //     });
//         // }
//         const normalizedTitle = toTitleCase(title);
//         // Check if category already exists
//         const existingRuleBylaw = await ClubRuleByelaw.findOne({ title: normalizedTitle, type, isDeleted: false });
//         if (existingRuleBylaw) {
//             return res.status(400).json({ message: 'Club Notice Is already exists but Inactive.' });
//         }

//         // Create new rule/bylaw
//         const newRuleBylaw = new ClubRuleByelaw({
//             type,
//             // category,
//             title,
//             description,
//             isExpandable,
//             status,
//         });

//         const savedRuleBylaw = await newRuleBylaw.save();

//         res.status(201).json({
//             message: `${type} added successfully.`,
//             ruleByelaw: savedRuleBylaw,
//         });
//     } catch (error) {
//         console.error("Error adding Rule/Bylaw:", error);
//         res.status(500).json({
//             message: "Failed to add Rule/Bylaw.",
//             error: error.message,
//         });
//     }
// };

// Middleware function for adding a download
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
        // Fetch all rules and bylaws from the database, sorted by creation date (newest first)
        const rulesBylaws = await ClubRuleByelaw.find({ isDeleted: false }).sort({ createdAt: -1 });

        // Return success response
        return res.status(200).json({
            message: "Rules and Bylaws fetched successfully.",
            ruleByelaws: rulesBylaws,
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


// const updateRuleBylaw = async (req, res) => {
//     try {
//         const { id } = req.params;
//         let { title } = req.body;
//         // Log the incoming request body for debugging
//         console.log("Received request body:", req.body);

//         // Build the updates object dynamically based on provided fields
//         const updates = {};
//         if (req.body.type) {
//             if (!["Rule", "Byelaw"].includes(req.body.type)) {
//                 return res.status(400).json({ message: "Invalid type. Valid types: Rule, Byelaw." });
//             }
//             updates.type = req.body.type;
//         }

//         // if (req.body.category) {
//         //     if (typeof req.body.category !== "string") {
//         //         return res.status(400).json({ message: "Category must be a string." });
//         //     }
//         //     updates.category = req.body.category;
//         // }

//         if (title) {
//             if (typeof title !== "string") {
//                 return res.status(400).json({ message: "Title must be a string." });
//             }
//             // updates.title = req.body.title;

//             title = toTitleCase(title);

//             const existingRuleBylaw = await ClubRuleByelaw.findOne({
//                 title,
//                 _id: { $ne: id }, // Exclude the current document by ID
//             });

//             if (existingRuleBylaw) {
//                 return res.status(400).json({ message: 'A club notice with this title already exists.' });
//             }

//             // Add normalized title to updates
//             updates.title = title;

//         }

//         if (req.body.description) {
//             if (typeof req.body.description !== "string") {
//                 return res.status(400).json({ message: "Description must be a string." });
//             }
//             updates.description = req.body.description;
//         }

//         if (req.body.isExpandable !== undefined) {
//             if (typeof req.body.isExpandable !== "boolean") {
//                 return res.status(400).json({ message: "isExpandable must be a boolean." });
//             }
//             updates.isExpandable = req.body.isExpandable;
//         }

//         if (req.body.status) {
//             if (!["Active", "Inactive"].includes(req.body.status)) {
//                 return res.status(400).json({ message: "Invalid status. Valid values: Active, Inactive." });
//             }
//             updates.status = req.body.status;
//         }

//         // Check for duplicates if title, type, and category are being updated
//         if (updates.type || updates.category || updates.title) {
//             const duplicateCheck = await ClubRuleByelaw.findOne({
//                 _id: { $ne: id }, // Exclude the current record
//                 type: updates.type || (await ClubRuleByelaw.findById(id)).type, // Use current value if not updated
//                 // category: updates.category || (await ClubRuleByelaw.findById(id)).category,
//                 title: updates.title || (await ClubRuleByelaw.findById(id)).title,
//             });

//             if (duplicateCheck) {
//                 return res.status(400).json({
//                     message: `A ${updates.type || "Rule/Byelaw"} with the same category and title already exists.`,
//                 });
//             }
//         }

//         // Update the rule/bylaw
//         const updatedItem = await ClubRuleByelaw.findByIdAndUpdate(id, updates, { new: true });

//         if (!updatedItem) {
//             return res.status(404).json({ message: "Rule/Byelaw not found." });
//         }

//         res.status(200).json({
//             message: "Rule/Byelaw updated successfully.",
//             ruleByelaw: updatedItem,
//         });
//     } catch (error) {
//         console.error("Error updating Rule/Byelaw:", error);
//         res.status(500).json({
//             message: "Failed to update Rule/Byelaw.",
//             error: error.message,
//         });
//     }
// };

// const updateRuleBylaw = async (req, res) => {
//     try {
//         const { id } = req.params;
//         let { title, description, status, expiredDate } = req.body;
//         // const updates = req.body;
//         if (!id) {
//             return res.status(400).json({ message: 'Please Providethe valid id' });
//         }
//         // Check if file was uploaded
//         const fileUrl = req.file ? `/uploads/downloads/${req.file.filename}` : "";

//         // Prepare the update object dynamically
//         const updates = {};
//         // if (title) updates.title = title;
//         if (title) {
//             title = toTitleCase(title);

//             const existingNotice = await ClubRuleByelaw.findOne({
//                 title,
//                 _id: { $ne: id }, // Exclude the current document by ID
//             });

//             if (existingNotice) {
//                 return res.status(400).json({ message: 'A download with this title already exists.' });
//             }

//             // Add normalized title to updates
//             updates.title = title;
//         }
//         if (description) updates.description = description;
//         if (status) updates.status = status;
//         if (fileUrl) updates.fileUrl = fileUrl; // Update profile image only if uploaded
//         if (expiredDate) updates.expiredDate = expiredDate;

//         const updatedDownload = await Download.findByIdAndUpdate(id, updates, { new: true });
//         if (!updatedDownload) {
//             return res.status(404).json({ message: 'Download not found' });
//         }

//         return res.status(200).json({ message: 'Download updated successfully', download: updatedDownload });
//     } catch (error) {
//         return res.status(500).json({ message: 'Error updating download', error: error.message });
//     }
// }


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


// const getActiveRulesBylaws = async (req, res) => {
//     try {
//         const { search, page = 1, limit = 5, type } = req.query;

//         // Validate type if provided
//         if (type && !["Rule", "Byelaw"].includes(type)) {
//             return res.status(400).json({ message: "Invalid type. Valid types are 'Rule' or 'Byelaw'." });
//         }

//         // Build query dynamically
//         const query = { status: "Active" };

//         if (type) query.type = type; // Filter by type if provided

//         // If a search term is provided, apply it to multiple fields (e.g., title, category, etc.)
//         if (search) {
//             query.$or = [
//                 { title: { $regex: search, $options: "i" } }, // Case-insensitive search on title
//                 { category: { $regex: search, $options: "i" } }, // Case-insensitive search on category
//                 { description: { $regex: search, $options: "i" } } // Case-insensitive search on description
//             ];
//         }

//         // Pagination logic
//         const pageNumber = parseInt(page, 10) || 1;
//         const limitNumber = parseInt(limit, 10) || 5; // Default limit is 5
//         const skip = (pageNumber - 1) * limitNumber;

//         // Fetch search results with pagination
//         const results = await ClubRuleByelaw.find(query)
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limitNumber);

//         // Get total count for pagination metadata
//         const totalItems = await ClubRuleByelaw.countDocuments(query);

//         res.status(200).json({
//             message: "Search results fetched successfully.",
//             ruleByelaws: results,
//             pagination: {
//                 totalItems,
//                 currentPage: pageNumber,
//                 totalPages: Math.ceil(totalItems / limitNumber),
//                 limit: limitNumber,
//             },
//         });
//     } catch (error) {
//         console.error("Error searching Rules/Bylaws:", error);
//         res.status(500).json({
//             message: "Failed to fetch search results.",
//             error: error.message,
//         });
//     }
// };

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