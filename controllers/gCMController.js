const GeneralCommitteeMember = require("../models/generalCommitteeMember");
const User = require("../models/user");


const addGCM = async (req, res) => {
    try {
        const { userId, designation, status } = req.body;
        let categories = req.body.categories;

        // Check if userId exists in the User table
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: "User with the given userId does not exist.",
            });
        }

        // Parse categories if it's a string
        if (typeof categories === "string") {
            categories = JSON.parse(categories);
        }

        // Validate categories
        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({
                message: "Categories are required and should be an array.",
            });
        }

        for (const category of categories) {
            if (!category.name) {
                return res.status(400).json({
                    message: "Each category must have a name.",
                });
            }
            if (!Array.isArray(category.subCategories)) {
                return res.status(400).json({
                    message: `Subcategories for category "${category.name}" should be an array.`,
                });
            }
            for (const subCategory of category.subCategories) {
                if (!subCategory.name) {
                    return res.status(400).json({
                        message: `Each subcategory in category "${category.name}" must have a name.`,
                    });
                }
            }
        }

        // Create new General Committee Member
        const newMember = new GeneralCommitteeMember({
            userId,
            designation,
            categories,
            status,
        });

        // Save to the database
        const savedMember = await newMember.save();

        res.status(201).json({
            message: "General Committee Member added successfully",
            gcm: savedMember,
        });
    } catch (error) {
        console.error("Error adding General Committee Member:", error);
        res.status(500).json({
            message: "Failed to add General Committee Member",
            error: error.message,
        });
    }
};


const updateGCM = async (req, res) => {
    try {
        const { id } = req.params; // Extract member ID from URL params
        const { userId, designation, status } = req.body;
        let categories = req.body.categories;

        // Check if userId exists in the User table
        if (userId) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(400).json({
                    message: "User with the given userId does not exist.",
                });
            }
        }

        // Parse categories if it's a string
        if (typeof categories === "string") {
            categories = JSON.parse(categories);
        }

        // Validate categories
        if (!Array.isArray(categories)) {
            return res.status(400).json({
                message: "Categories must be an array.",
            });
        }

        // Build the update object dynamically
        const updates = {};
        if (userId) updates.userId = userId;
        if (designation) updates.designation = designation;
        if (categories.length > 0) updates.categories = categories;
        if (status) updates.status = status;

        // Update General Committee Member in the database
        const updatedMember = await GeneralCommitteeMember.findByIdAndUpdate(
            id,
            updates,
            { new: true } // Return the updated document
        );

        if (!updatedMember) {
            return res.status(404).json({
                message: "General Committee Member not found",
            });
        }

        res.status(200).json({
            message: "General Committee Member updated successfully",
            gcm: updatedMember,
        });
    } catch (error) {
        console.error("Error updating General Committee Member:", error);
        res.status(500).json({
            message: "Failed to update General Committee Member",
            error: error.message,
        });
    }
};


const getAllGCM = async (req, res) => {
    try {
        const data = await GeneralCommitteeMember.find()
            .populate('userId', 'title name mobileNumber profilePicture memberId') // Fetch user details
            .sort({ createdAt: -1 }); // Sort by most recent

        // Map the data for the desired response format
        const gcms = data.map(gcm => ({
            _id: gcm._id,
            title: gcm.userId.title,
            name: gcm.userId.name,
            memberId: gcm.userId.memberId,
            designation: gcm.designation || "",
            categories: gcm.categories.map(category => ({
                name: category.name,
                subCategories: category.subCategories.map(subCategory => ({
                    name: subCategory.name,
                    _id: subCategory._id,
                    createdAt: subCategory.createdAt,
                    updatedAt: subCategory.updatedAt,
                })),
                _id: category._id,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            contactNumber: gcm.userId.mobileNumber,
            image: gcm.userId.profilePicture || "",
            status: gcm.status,
            createdAt: gcm.createdAt,
            updatedAt: gcm.updatedAt,
        }));

        return res.status(200).json({
            message: "All GCMs fetched successfully",
            gcms,
        });
    } catch (error) {
        console.error("Error fetching GCMs:", error);
        return res.status(500).json({
            message: "Error fetching GCMs",
            error: error.message,
        });
    }
};

const getGCMDetails = async (req, res) => {
    const { id } = req.params; // Extract GCM ID from the URL

    try {
        const gcm = await GeneralCommitteeMember.findById(id)
            .populate('userId', 'title name mobileNumber profilePicture memberId') // Populate userId fields
            .exec(); // Execute query

        if (!gcm) {
            return res.status(404).json({
                message: "GCM not found",
            });
        }

        // Map the data for the desired response format
        const gcmDetails = {
            _id: gcm._id,
            userId: gcm.userId._id,
            title: gcm.userId.title,
            name: gcm.userId.name,
            memberId: gcm.userId.memberId,
            designation: gcm.designation || "",
            categories: gcm.categories.map(category => ({
                name: category.name,
                subCategories: category.subCategories.map(subCategory => ({
                    name: subCategory.name,
                    _id: subCategory._id,
                    createdAt: subCategory.createdAt,
                    updatedAt: subCategory.updatedAt,
                })),
                _id: category._id,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            contactNumber: gcm.userId.mobileNumber,
            image: gcm.userId.profilePicture || "",
            status: gcm.status,
            createdAt: gcm.createdAt,
            updatedAt: gcm.updatedAt,
        };

        return res.status(200).json({
            message: "GCM details fetched successfully",
            gcm: gcmDetails,
        });
    } catch (error) {
        console.error("Error fetching GCM details:", error);
        return res.status(500).json({
            message: "Error fetching GCM details",
            error: error.message,
        });
    }
};


const deleteGCM = async (req, res) => {
    const { id } = req.params; // Extract GCM ID from the URL

    try {
        const gcm = await GeneralCommitteeMember.findByIdAndDelete(id);
        if (!gcm) {
            return res.status(404).json({
                message: "GCM not found",
            });
        }
        return res.status(200).json({
            message: "GCM deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting GCM:", error);
        return res.status(500).json({
            message: "Error deleting GCM",
            error: error.message,
        });
    }
};


const getActiveGCM = async (req, res) => {
    try {
        const gcms = await GeneralCommitteeMember.find({ status: "Active" })
            .populate('userId', 'title name mobileNumber profilePicture memberId') // Populate the necessary user fields
            .sort({ createdAt: -1 }); // Sort by most recent

        // Map the data for the desired response format
        const activeGCMs = gcms.reverse().map(gcm => ({
            _id: gcm._id,
            title: gcm.userId.title,
            name: gcm.userId.name,
            memberId: gcm.userId.memberId,
            designation: gcm.designation || "",
            categories: gcm.categories.map(category => ({
                name: category.name,
                subCategories: category.subCategories.map(subCategory => ({
                    name: subCategory.name,
                    _id: subCategory._id,
                    createdAt: subCategory.createdAt,
                    updatedAt: subCategory.updatedAt,
                })),
                _id: category._id,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            contactNumber: gcm.userId.mobileNumber,
            image: gcm.userId.profilePicture || "",
            status: gcm.status,
            createdAt: gcm.createdAt,
            updatedAt: gcm.updatedAt,
        }));

        return res.status(200).json({
            message: "Active GCMs fetched successfully",
            gcms: activeGCMs,
        });
    } catch (error) {
        console.error("Error fetching active GCMs:", error);
        return res.status(500).json({
            message: "Error fetching active GCMs",
            error: error.message,
        });
    }
};



module.exports = {
    addGCM,
    updateGCM,
    getAllGCM,
    getGCMDetails,
    deleteGCM,
    getActiveGCM
}