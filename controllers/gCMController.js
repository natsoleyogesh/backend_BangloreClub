const GeneralCommitteeMember = require("../models/generalCommitteeMember");

// const addGCM = async (req, res) => {
//     try {
//         const {
//             title,
//             name,
//             memberId,
//             designation,
//             contactNumber,
//             status,
//         } = req.body;

//         let categories = req.body.categories;

//         console.log(typeof categories, "type of categories");
//         // Parse categories if it's a string
//         if (typeof categories === "string") {
//             categories = JSON.parse(categories);
//         }

//         console.log(categories, "categories");
//         console.log(Array.isArray(categories), "is categories an array?");
//         console.log(categories?.length, "categories.length");

//         // Validate categories
//         if (!Array.isArray(categories) || categories.length === 0) {
//             return res.status(400).json({
//                 message: "Categories are required and should be an array.",
//             });
//         }

//         if (!req.file) {
//             return res.status(400).json({ message: "Please Provide the Profile Image!" })
//         }

//         const imagePath = req.file ? `/uploads/profilePictures/${req.file.filename}` : "";
//         // Create new General Committee Member
//         const newMember = new GeneralCommitteeMember({
//             title,
//             name,
//             memberId,
//             designation,
//             categories,
//             contactNumber,
//             profileImage: imagePath,
//             status,
//         });

//         // Save to the database
//         const savedMember = await newMember.save();

//         res.status(201).json({
//             message: "General Committee Member added successfully",
//             gcm: savedMember,
//         });
//     } catch (error) {
//         console.error("Error adding General Committee Member:", error);
//         res.status(500).json({
//             message: "Failed to add General Committee Member",
//             error: error.message,
//         });
//     }
// };

const addGCM = async (req, res) => {
    try {
        const {
            title,
            name,
            memberId,
            designation,
            contactNumber,
            status,
        } = req.body;

        let categories = req.body.categories;

        console.log(typeof categories, "type of categories");

        // Parse categories if it's a string
        if (typeof categories === "string") {
            categories = JSON.parse(categories);
        }

        console.log(categories, "categories");
        console.log(Array.isArray(categories), "is categories an array?");
        console.log(categories?.length, "categories.length");

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

        // Check if profile image exists
        if (!req.file) {
            return res.status(400).json({ message: "Please provide the profile image!" });
        }

        const imagePath = req.file ? `/uploads/profilePictures/${req.file.filename}` : "";

        // Create new General Committee Member
        const newMember = new GeneralCommitteeMember({
            title,
            name,
            memberId,
            designation,
            categories,
            contactNumber,
            profileImage: imagePath,
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


// const updateGCM = async (req, res) => {
//     try {
//         const { id } = req.params; // Extract member ID from URL params
//         const {
//             title,
//             name,
//             memberId,
//             designation,
//             categories,
//             contactNumber,
//             status,
//         } = req.body;

//         // Build the update object dynamically
//         const updates = {};
//         if (title) updates.title = title;
//         if (name) updates.name = name;
//         if (memberId) updates.memberId = memberId;
//         if (designation) updates.designation = designation;
//         if (categories && Array.isArray(categories)) updates.categories = categories;
//         if (contactNumber) updates.contactNumber = contactNumber;
//         if (status) updates.status = status;
//         if (req.file) {
//             updates.profileImage = req.file ? `/uploads/profilePictures/${req.file.filename}` : "";
//         }


//         // Update General Committee Member in the database
//         const updatedMember = await GeneralCommitteeMember.findByIdAndUpdate(
//             id,
//             updates,
//             { new: true } // Return the updated document
//         );

//         if (!updatedMember) {
//             return res.status(404).json({
//                 message: "General Committee Member not found",
//             });
//         }

//         res.status(200).json({
//             message: "General Committee Member updated successfully",
//             gcm: updatedMember,
//         });
//     } catch (error) {
//         console.error("Error updating General Committee Member:", error);
//         res.status(500).json({
//             message: "Failed to update General Committee Member",
//             error: error.message,
//         });
//     }
// };

const updateGCM = async (req, res) => {
    try {
        const { id } = req.params; // Extract member ID from URL params
        const {
            title,
            name,
            memberId,
            designation,
            contactNumber,
            status,
        } = req.body;

        let categories = req.body.categories;

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
        if (title) updates.title = title;
        if (name) updates.name = name;
        if (memberId) updates.memberId = memberId;
        if (designation) updates.designation = designation;
        if (categories.length > 0) updates.categories = categories;
        if (contactNumber) updates.contactNumber = contactNumber;
        if (status) updates.status = status;

        // Handle profile image update
        if (req.file) {
            updates.profileImage = `/uploads/profilePictures/${req.file.filename}`;
        }

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
        const gcms = await GeneralCommitteeMember.find().sort({ createdAt: -1 }); // Sort by most recent
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
        const gcm = await GeneralCommitteeMember.findById(id);
        if (!gcm) {
            return res.status(404).json({
                message: "GCM not found",
            });
        }
        return res.status(200).json({
            message: "GCM details fetched successfully",
            gcm,
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
        const gcms = await GeneralCommitteeMember.find({ status: "Active" }).sort({ createdAt: -1 }); // Filter by 'Active' status
        return res.status(200).json({
            message: "Active GCMs fetched successfully",
            gcms,
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