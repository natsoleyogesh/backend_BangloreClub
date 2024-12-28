const ProfileRequest = require('../models/profileRequest');
const User = require('../models/user');
const { generateFamilyMemberId } = require('../utils/common');

// User sends a profile edit request
const sendProfileRequest = async (req, res) => {
    try {
        const { dependentId, description, operation } = req.body;
        const userId = req.user.userId;

        // Ensure description is provided
        if (!description) {
            return res.status(400).json({ message: 'Please provide a description of the requested change.' });
        }

        // Validate the presence of either userId or dependentId
        if (!userId && !dependentId) {
            return res.status(400).json({ message: 'Please provide either userId or dependentId to identify the target of the request.' });
        }

        // If dependentId is provided, check that the dependent is a family member of the user
        if (dependentId) {
            const dependentUser = await User.findById(dependentId);
            if (!dependentUser || dependentUser.parentUserId.toString() !== userId) {
                return res.status(403).json({ message: 'Invalid dependentId. The dependent does not belong to the specified user.' });
            }
        }

        // Create the profile edit request
        const newRequest = new ProfileRequest({
            userId: userId, // The main user requesting the change
            dependentId: dependentId || null, // Only set if a family member's details are being updated
            description, // General description of the requested update
            operation
        });

        const savedRequest = await newRequest.save();

        res.status(201).json({
            message: `Profile ${operation} request submitted successfully`,
            request: savedRequest,
        });
    } catch (error) {
        console.error('Error submitting profile edit request:', error);
        res.status(500).json({ message: 'Error submitting profile edit request', error: error.message });
    }
};

// Admin retrieves all profile edit requests
const getProfileRequests = async (req, res) => {
    try {
        // Check if the requester is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const requests = await ProfileRequest.find({ status: "Pending" })


        res.status(200).json({
            message: 'Profile edit requests retrieved successfully',
            requests,
        });
    } catch (error) {
        console.error('Error retrieving profile edit requests:', error);
        res.status(500).json({ message: 'Error retrieving profile edit requests', error: error.message });
    }
};

// Admin rejects a profile edit request
const rejectProfileRequest = async (req, res) => {
    try {
        const adminId = req.user.userId; // Extract adminId from the token's decoded data

        // Check if the requesting user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { requestId } = req.params; // The ID of the profile edit request
        const { adminResponse } = req.body;

        // Find the profile edit request by ID
        const profileEditRequest = await ProfileRequest.findById(requestId);
        if (!profileEditRequest) {
            return res.status(404).json({ message: 'Profile edit request not found' });
        }

        // Update profile edit request status to 'Rejected' and add admin response
        profileEditRequest.status = 'Rejected';
        profileEditRequest.adminResponse = adminResponse || '';
        await profileEditRequest.save();

        res.status(200).json({
            message: 'Profile edit request rejected by admin',
            request: profileEditRequest,
        });
    } catch (error) {
        console.error('Error rejecting profile edit request:', error);
        res.status(500).json({ message: 'Error rejecting profile edit request', error: error.message });
    }
};


// Admin updates user details and approves the request
// const updateUserDetailsByAdmin = async (req, res) => {
//     try {
//         const adminId = req.user.userId; // Extract adminId from the token's decoded data

//         // Check if the requesting user is an admin
//         if (req.user.role !== "admin") {
//             return res.status(403).json({ message: "Access denied. Admins only." });
//         }

//         // Determine the `requestId` from `req.body` or `req.params`
//         const requestId = req.body.requestId || req.params.requestId;
//         const userId = req.params.userId; // Direct userId update if no requestId is provided
//         const { name, email, mobileNumber, address, age, adminResponse, status } = req.body;

//         let user;

//         // If `requestId` is provided, handle the profile edit request
//         if (requestId) {
//             // Find the profile edit request by ID
//             const profileEditRequest = await ProfileRequest.findById(requestId);
//             if (!profileEditRequest) {
//                 return res.status(404).json({ message: "Profile edit request not found." });
//             }

//             // Determine the target user based on `dependentId` or `userId` in the request
//             const targetUserId = profileEditRequest.dependentId || profileEditRequest.userId;

//             user = await User.findById(targetUserId);
//             if (!user) {
//                 return res.status(404).json({ message: "User not found." });
//             }

//             // Update user details only for "edit" operations
//             if (profileEditRequest.operation === "edit") {
//                 if (name) user.name = name;
//                 if (email) user.email = email;
//                 if (mobileNumber) user.mobileNumber = mobileNumber;
//                 if (address) user.address = address;
//                 if (age) user.age = age;
//                 if (status) {
//                     user.status = status;

//                     // Set the activatedDate when the status changes to "Active"
//                     if (status === "Active" && !user.activatedDate) {
//                         user.activatedDate = new Date();
//                     }
//                 }
//                 await user.save();
//             }

//             // Approve the profile edit request
//             profileEditRequest.status = "Approved";
//             profileEditRequest.adminResponse = adminResponse || "Admin Approved The Your Request And Profile Is Updated";
//             await profileEditRequest.save();
//         } else if (userId) {
//             // Direct user update without a requestId
//             user = await User.findById(userId);
//             if (!user) {
//                 return res.status(404).json({ message: "User not found." });
//             }

//             // Update user details directly
//             if (name) user.name = name;
//             if (email) user.email = email;
//             if (mobileNumber) user.mobileNumber = mobileNumber;
//             if (address) user.address = address;
//             if (age) user.age = age;
//             if (status) {
//                 user.status = status;

//                 // Set the activatedDate when the status changes to "Active"
//                 if (status === "Active" && !user.activatedDate) {
//                     user.activatedDate = new Date();
//                 }
//             }
//             await user.save();
//         } else {
//             // If neither `requestId` nor `userId` is provided
//             return res.status(400).json({ message: "Either requestId or userId must be provided." });
//         }

//         // Response with updated user details
//         res.status(200).json({
//             message: "User details updated successfully by admin",
//             user: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 mobileNumber: user.mobileNumber,
//                 memberId: user.memberId,
//                 lastLogin: user.lastLogin,
//                 address: user.address,
//                 relation: user.relation,
//                 profilePicture: user.profilePicture,
//                 age: user.age,
//                 status: user.status
//             },
//         });
//     } catch (error) {
//         console.error("Error updating user details by admin:", error);
//         res.status(500).json({ message: "Error updating user details", error: error.message });
//     }
// };
const updateUserDetailsByAdmin = async (req, res) => {
    try {
        const adminId = req.user.userId; // Extract adminId from the token's decoded data

        // Check if the requesting user is an admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        // Determine the `requestId` from `req.body` or `req.params`
        const requestId = req.body.requestId || req.params.requestId;
        const userId = req.params.userId; // Direct userId update if no requestId is provided
        const {
            name,
            email,
            mobileNumber,
            address,
            address1,
            address2,
            city,
            state,
            country,
            pin,
            dateOfBirth,
            maritalStatus,
            marriageDate,
            title,
            adminResponse,
            status,
        } = req.body;

        let user;

        // If `requestId` is provided, handle the profile edit request
        if (requestId) {
            // Find the profile edit request by ID
            const profileEditRequest = await ProfileRequest.findById(requestId);
            if (!profileEditRequest) {
                return res.status(404).json({ message: "Profile edit request not found." });
            }

            // Determine the target user based on `dependentId` or `userId` in the request
            const targetUserId = profileEditRequest.dependentId || profileEditRequest.userId;

            user = await User.findById(targetUserId);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            // Update user details only for "edit" operations
            if (profileEditRequest.operation === "edit") {
                if (name) user.name = name;
                if (email) user.email = email;
                if (mobileNumber) user.mobileNumber = mobileNumber;
                if (address) user.address = address;
                if (address1) user.address1 = address1;
                if (address2) user.address2 = address2;
                if (city) user.city = city;
                if (state) user.state = state;
                if (country) user.country = country;
                if (pin) user.pin = pin;
                if (dateOfBirth) user.dateOfBirth = dateOfBirth;
                if (maritalStatus) user.maritalStatus = maritalStatus;
                if (marriageDate) user.marriageDate = marriageDate;
                if (title) user.title = title;
                if (status) {
                    user.status = status;

                    // Set the activatedDate when the status changes to "Active"
                    if (status === "Active" && !user.activatedDate) {
                        user.activatedDate = new Date();
                    }
                }
                await user.save();
            }

            // Approve the profile edit request
            profileEditRequest.status = "Approved";
            profileEditRequest.adminResponse = adminResponse || "Admin approved the request and profile is updated.";
            await profileEditRequest.save();
        } else if (userId) {
            // Direct user update without a requestId
            user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            // Update user details directly
            if (name) user.name = name;
            if (email) user.email = email;
            if (mobileNumber) user.mobileNumber = mobileNumber;
            if (address) user.address = address;
            if (address1) user.address1 = address1;
            if (address2) user.address2 = address2;
            if (city) user.city = city;
            if (state) user.state = state;
            if (country) user.country = country;
            if (pin) user.pin = pin;
            if (dateOfBirth) user.dateOfBirth = dateOfBirth;
            if (maritalStatus) user.maritalStatus = maritalStatus;
            if (marriageDate) user.marriageDate = marriageDate;
            if (title) user.title = title;
            if (status) {
                user.status = status;

                // Set the activatedDate when the status changes to "Active"
                if (status === "Active" && !user.activatedDate) {
                    user.activatedDate = new Date();
                }
            }
            await user.save();
        } else {
            // If neither `requestId` nor `userId` is provided
            return res.status(400).json({ message: "Either requestId or userId must be provided." });
        }

        // Response with updated user details
        res.status(200).json({
            message: "User details updated successfully by admin",
            user,
        });
    } catch (error) {
        console.error("Error updating user details by admin:", error);
        res.status(500).json({ message: "Error updating user details", error: error.message });
    }
};


// const createFamilyMember = async (req, res) => {
//     try {
//         const { name, email, mobileNumber, relation, age, parentUserId, requestId } = req.body;
//         const profilePicturePath = req.file ? `/uploads/profilePictures/${req.file.filename}` : "";

//         // Validate that the requestId is provided and the operation is "add"
//         if (!requestId) {
//             return res.status(400).json({ message: "Request ID is required to validate the operation type." });
//         }

//         // Find the profile edit request by ID
//         const profileEditRequest = await ProfileRequest.findById(requestId);
//         if (!profileEditRequest) {
//             return res.status(404).json({ message: "Profile edit request not found." });
//         }

//         // Check if the request operation is "add"
//         if (profileEditRequest.operation !== "add") {
//             return res.status(400).json({ message: "Invalid operation. This request is not for adding a family member." });
//         }

//         // Validate that the parentUserId is provided
//         if (!parentUserId) {
//             return res.status(400).json({ message: "Parent user ID is required to add a family member." });
//         }

//         // Find the parent user
//         const parentUser = await User.findById(parentUserId);
//         if (!parentUser) {
//             return res.status(404).json({ message: "Parent user not found." });
//         }

//         // Validate relationship rules
//         const existingRelations = await User.find({ parentUserId });
//         if (relation === "Spouse" && existingRelations.some((member) => member.relation === "Spouse")) {
//             return res.status(400).json({ message: "Only one spouse can be added per user." });
//         }

//         if (relation === "Child" && (!age || age < 18)) {
//             return res.status(400).json({ message: "Children must be 18 or older to be added." });
//         }

//         // Generate a unique memberId for the family member
//         const memberId = await generateFamilyMemberId(parentUser.memberId, existingRelations.length);

//         // Create and save the family member
//         const familyMember = new User({
//             name,
//             email,
//             mobileNumber,
//             memberId,
//             relation,
//             parentUserId: parentUser._id,
//             age: relation === "Child" ? age : undefined,
//             profilePicture: profilePicturePath,
//         });

//         const savedFamilyMember = await familyMember.save();

//         // Update the profile edit request status to "Approved"
//         profileEditRequest.status = "Approved";
//         profileEditRequest.adminResponse = "Family member addition approved and completed.";
//         await profileEditRequest.save();

//         res.status(201).json({
//             message: "Family member added successfully",
//             user: savedFamilyMember,
//         });
//     } catch (error) {
//         console.error("Error in adding family member:", error);
//         res.status(400).json({
//             message: "Error in adding family member",
//             error: error.message,
//         });
//     }
// };

const createFamilyMember = async (req, res) => {
    try {
        const {
            name,
            email,
            mobileNumber,
            relation,
            parentUserId,
            address,
            address1,
            address2,
            city,
            state,
            country,
            pin,
            dateOfBirth,
            maritalStatus,
            marriageDate,
            title,
            requestId,
        } = req.body;

        const profilePicturePath = req.file ? `/uploads/profilePictures/${req.file.filename}` : "";

        // Validate that the requestId is provided and the operation is "add"
        if (!requestId) {
            return res.status(400).json({ message: "Request ID is required to validate the operation type." });
        }

        // Find the profile edit request by ID
        const profileEditRequest = await ProfileRequest.findById(requestId);
        if (!profileEditRequest) {
            return res.status(404).json({ message: "Profile edit request not found." });
        }

        // Check if the request operation is "add"
        if (profileEditRequest.operation !== "add") {
            return res.status(400).json({ message: "Invalid operation. This request is not for adding a family member." });
        }

        // Validate that the parentUserId is provided
        if (!parentUserId) {
            return res.status(400).json({ message: "Parent user ID is required to add a family member." });
        }

        // Find the parent user
        const parentUser = await User.findById(parentUserId);
        if (!parentUser) {
            return res.status(404).json({ message: "Parent user not found." });
        }

        // Validate relationship rules
        const existingRelations = await User.find({ parentUserId });
        if (relation === "Spouse" && existingRelations.some((member) => member.relation === "Spouse")) {
            return res.status(400).json({ message: "Only one spouse can be added per user." });
        }

        // Generate a unique memberId for the family member
        const memberId = await generateFamilyMemberId(parentUser.memberId, existingRelations.length);

        // Create and save the family member
        const familyMember = new User({
            name,
            email,
            mobileNumber,
            memberId,
            relation,
            parentUserId: parentUser._id,
            address,
            address1,
            address2,
            city,
            state,
            country,
            pin,
            dateOfBirth,
            maritalStatus,
            marriageDate,
            title,
            profilePicture: profilePicturePath,
        });

        const savedFamilyMember = await familyMember.save();

        // Update the profile edit request status to "Approved"
        profileEditRequest.status = "Approved";
        profileEditRequest.adminResponse = "Family member addition approved and completed.";
        await profileEditRequest.save();

        res.status(201).json({
            message: "Family member added successfully",
            user: savedFamilyMember,
        });
    } catch (error) {
        console.error("Error in adding family member:", error);
        res.status(400).json({
            message: "Error in adding family member",
            error: error.message,
        });
    }
};


module.exports = {
    sendProfileRequest,
    getProfileRequests,
    rejectProfileRequest,
    updateUserDetailsByAdmin,
    createFamilyMember
};
