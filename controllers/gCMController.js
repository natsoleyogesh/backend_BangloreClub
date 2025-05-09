const Department = require("../models/department");
const Designation = require("../models/designation");
const GeneralCommitteeMember = require("../models/generalCommitteeMember");
const User = require("../models/user");


const addGCM = async (req, res) => {
    try {
        const { userId, designation, status, priority } = req.body;
        let categories = req.body.categories;

        // Check if userId exists in the User table
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: "User with the given userId does not exist.",
            });
        }

        // // Check if designation exists in the Designation table
        // if (designation) {
        //     const existingDesignation = await Designation.findById(designation);
        //     if (!existingDesignation) {
        //         return res.status(400).json({
        //             message: "Designation does not exist.",
        //         });
        //     }
        // }

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

            const existingCategory = await Designation.findById(category.name);
            if (!existingCategory) {
                return res.status(400).json({
                    message: `Category with ID "${category.name}" does not exist.`,
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
                        message: `Each subcategory in category "${category.name}" must have a name`,
                    });
                }

                const existingSubCategory = await Department.findById(subCategory.name);
                if (!existingSubCategory) {
                    return res.status(400).json({
                        message: `Subcategory with ID "${subCategory.name}" does not exist.`,
                    });
                }
            }
        }

        // Check if file was uploaded
        const image = req.file ? `/ uploads / gcm / ${req.file.filename}` : "";

        const FindExistingPriority = await GeneralCommitteeMember.findOne({ priority: priority }).exec();
        if (FindExistingPriority) {
            return res.status(400).json({
                message: `The ${priority} is already assign By Other Member.`,
            });
        }

        // Create new General Committee Member
        const newMember = new GeneralCommitteeMember({
            userId,
            designation,
            categories,
            status,
            image,
            priority
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
        const { userId, designation, status, priority } = req.body;
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

        // // Check if designation exists in the Designation table
        // if (designation) {
        //     const existingDesignation = await Designation.findById(designation);
        //     if (!existingDesignation) {
        //         return res.status(400).json({
        //             message: "Designation does not exist.",
        //         });
        //     }
        // }

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

        for (const category of categories) {
            if (!category.name) {
                return res.status(400).json({
                    message: "Each category must have a name.",
                });
            }

            const existingCategory = await Designation.findById(category.name);
            if (!existingCategory) {
                return res.status(400).json({
                    message: `Category with ID "${category.name}" does not exist.`,
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

                const existingSubCategory = await Department.findById(subCategory.name);
                if (!existingSubCategory) {
                    return res.status(400).json({
                        message: `Subcategory with ID "${subCategory.name}" does not exist.`,
                    });
                }
            }
        }

        // Check if file was uploaded
        let image;
        if (req.file) {
            image = req.file ? `/uploads/gcm/${req.file.filename}` : "";
        }

        // Build the update object dynamically
        const updates = {};
        if (userId) updates.userId = userId;
        if (designation) updates.designation = designation;
        if (categories.length > 0) updates.categories = categories;
        if (status) updates.status = status;
        if (image) updates.image = image; // Update profile image only if uploaded
        if (priority) updates.priority = priority;

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

// const getAllGCM = async (req, res) => {
//     try {
//         const gcms = await GeneralCommitteeMember.find({ status: "Active" })
//             .populate('userId', 'title name mobileNumber profilePicture memberId')
//             .populate('categories.name', '_id designationName')
//             .populate('categories.subCategories.name', '_id departmentName')
//             .sort({ createdAt: -1 });

//         const formattedGCMs = gcms.map(gcm => ({
//             _id: gcm._id,
//             title: gcm.userId.title,
//             name: gcm.userId.name,
//             memberId: gcm.userId.memberId,
//             designation: gcm.designation || "",
//             categories: gcm.categories.map(category => ({
//                 name: category.name.designationName || "N/A",
//                 subCategories: category.subCategories.map(subCategory => ({
//                     name: subCategory.name.departmentName || "N/A",
//                     _id: subCategory._id,
//                     createdAt: subCategory.createdAt,
//                     updatedAt: subCategory.updatedAt,
//                 })),
//                 _id: category._id,
//                 createdAt: category.createdAt,
//                 updatedAt: category.updatedAt,
//             })),
//             contactNumber: gcm.userId.mobileNumber,
//             image: gcm.image || "",
//             priority: gcm.priority || 1,
//             status: gcm.status,
//             createdAt: gcm.createdAt,
//             updatedAt: gcm.updatedAt,
//         }));

//         return res.status(200).json({
//             message: "All GCMs fetched successfully",
//             gcms: formattedGCMs,
//         });
//     } catch (error) {
//         console.error("Error fetching GCMs:", error);
//         return res.status(500).json({
//             message: "Error fetching GCMs",
//             error: error.message,
//         });
//     }
// };


const getAllGCM = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Convert pagination parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of active GCMs
        const totalGCMs = await GeneralCommitteeMember.countDocuments({ status: "Active" });

        // Fetch paginated GCMs
        const gcms = await GeneralCommitteeMember.find({ status: "Active" })
            .populate("userId", "title name mobileNumber profilePicture memberId")
            .populate("categories.name", "_id designationName")
            .populate("categories.subCategories.name", "_id departmentName")
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        // Format GCM data
        const formattedGCMs = gcms.map(gcm => ({
            _id: gcm._id,
            title: gcm.userId.title,
            name: gcm.userId.name,
            memberId: gcm.userId.memberId,
            designation: gcm.designation || "",
            categories: gcm.categories.map(category => ({
                name: category.name?.designationName || "N/A",
                subCategories: category.subCategories.map(subCategory => ({
                    name: subCategory.name?.departmentName || "N/A",
                    _id: subCategory._id,
                    createdAt: subCategory.createdAt,
                    updatedAt: subCategory.updatedAt,
                })),
                _id: category._id,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            contactNumber: gcm.userId.mobileNumber,
            image: gcm.image || "",
            priority: gcm.priority || 1,
            status: gcm.status,
            createdAt: gcm.createdAt,
            updatedAt: gcm.updatedAt,
        }));

        return res.status(200).json({
            message: "All GCMs fetched successfully",
            gcms: formattedGCMs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalGCMs / limit),
                totalGCMs,
                pageSize: limit,
            },
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
    const { id } = req.params;

    try {
        const gcm = await GeneralCommitteeMember.findById(id)
            .populate('userId', 'title name mobileNumber profilePicture memberId')
            .populate('categories.name', '_id designationName')
            .populate('categories.subCategories.name', '_id departmentName')
            .exec();

        if (!gcm) {
            return res.status(404).json({
                message: "GCM not found",
            });
        }

        const gcmDetails = {
            _id: gcm._id,
            title: gcm.userId.title,
            name: gcm.userId.name,
            memberId: gcm.userId.memberId,
            designation: gcm.designation || "",
            categories: gcm.categories.map(category => ({
                name: category.name.designationName || "N/A",
                subCategories: category.subCategories.map(subCategory => ({
                    name: subCategory.name.departmentName || "N/A",
                    _id: subCategory._id,
                    createdAt: subCategory.createdAt,
                    updatedAt: subCategory.updatedAt,
                })),
                _id: category._id,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            contactNumber: gcm.userId.mobileNumber,
            image: gcm.image || "",
            priority: gcm.priority || 1,
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

const getGCMDetailsById = async (req, res) => {
    const { id } = req.params;

    try {
        const gcm = await GeneralCommitteeMember.findById(id)
            .populate('userId', 'title name mobileNumber profilePicture memberId')
            .exec();

        if (!gcm) {
            return res.status(404).json({
                message: "GCM not found",
            });
        }

        const gcmDetails = {
            _id: gcm._id,
            title: gcm.userId.title,
            name: gcm.userId.name,
            memberId: gcm.userId.memberId,
            designation: gcm.designation || "",
            categories: gcm.categories.map(category => ({
                name: category.name || "N/A",
                subCategories: category.subCategories.map(subCategory => ({
                    name: subCategory.name || "N/A",
                    _id: subCategory._id,
                    createdAt: subCategory.createdAt,
                    updatedAt: subCategory.updatedAt,
                })),
                _id: category._id,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            contactNumber: gcm.userId.mobileNumber,
            image: gcm.image || "",
            priority: gcm.priority || 1,
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
    const { id } = req.params;

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
            .populate('userId', 'title name mobileNumber profilePicture memberId')
            .populate('categories.name', '_id designationName')
            .populate('categories.subCategories.name', '_id departmentName')
            // .sort({ createdAt: -1 });
            .sort({ priority: 1 });

        const activeGCMs = gcms.map(gcm => ({
            _id: gcm._id,
            title: gcm.userId.title,
            name: gcm.userId.name,
            memberId: gcm.userId.memberId,
            designation: gcm.designation || "",
            categories: gcm.categories.map(category => ({
                name: category.name.designationName || "N/A",
                subCategories: category.subCategories.map(subCategory => ({
                    name: subCategory.name.departmentName || "N/A",
                    _id: subCategory._id,
                    createdAt: subCategory.createdAt,
                    updatedAt: subCategory.updatedAt,
                })),
                _id: category._id,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            })),
            contactNumber: gcm.userId.mobileNumber,
            image: gcm.image || "",
            priority: gcm.priority || 1,
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
    getActiveGCM,
    getGCMDetailsById
};
