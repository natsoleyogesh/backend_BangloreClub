const User = require("../models/user");
const crypto = require("crypto");
const { generatePrimaryMemberId, generateFamilyMemberId, generateOtp, generateToken } = require("../utils/common");
const fs = require("fs");
const path = require("path");
const QRCodeHelper = require('../utils/helper');
const { logAction } = require("./commonController");

require("dotenv").config();
// const twilio = require("twilio"); // Uncomment this when you want to use Twilio for OTPs

// Static OTP for testing
const STATIC_OTP = "123456";
// Twilio setup (uncomment when ready to use Twilio)
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);

// const createUser = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             mobileNumber,
//             relation,
//             parentUserId,
//             address,
//             address1,
//             address2,
//             city,
//             state,
//             country,
//             pin,
//             dateOfBirth,
//             maritalStatus,
//             marriageDate,
//             title,
//         } = req.body;

//         const profilePicturePath = req.file ? `/uploads/profilePictures/${req.file.filename}` : "";

//         // Determine if this user is a primary user or a family member
//         if (!parentUserId) {
//             const memberId = await generatePrimaryMemberId();
//             const newUser = new User({
//                 name,
//                 email,
//                 mobileNumber,
//                 memberId,
//                 relation: "Primary",
//                 address,
//                 address1,
//                 address2,
//                 city,
//                 state,
//                 country,
//                 pin,
//                 dateOfBirth,
//                 maritalStatus,
//                 marriageDate,
//                 title,
//                 profilePicture: profilePicturePath,
//                 isDeleted: false,
//                 lastLogin: Date.now(),
//             });

//             const savedUser = await newUser.save();
//             return res.status(201).json({
//                 message: "Primary user created successfully",
//                 user: savedUser,
//             });
//         }

//         // If parentUserId is provided, it means this is a family member addition
//         const parentUser = await User.findById(parentUserId);
//         if (!parentUser) {
//             return res.status(404).json({ message: "Parent user not found." });
//         }

//         // Validate relationship rules
//         const existingRelations = await User.find({ parentUserId });
//         if (relation === "Spouse" && existingRelations.some((member) => member.relation === "Spouse")) {
//             return res.status(400).json({ message: "Only one spouse can be added per user." });
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
//             address,
//             address1,
//             address2,
//             city,
//             state,
//             country,
//             pin,
//             dateOfBirth,
//             maritalStatus,
//             marriageDate,
//             title,
//             parentUserId: parentUser._id,
//             profilePicture: profilePicturePath,
//         });

//         const savedFamilyMember = await familyMember.save();
//         res.status(201).json({
//             message: "Family member added successfully",
//             user: savedFamilyMember,
//         });
//     } catch (error) {
//         console.error("Error in creating user or adding family member:", error);
//         res.status(400).json({
//             message: "Error in creating user or adding family member",
//             error: error.message,
//         });
//     }
// };

const createUser = async (req, res) => {
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
            vehicleNumber,
            vehicleModel,
            drivingLicenceNumber,
        } = req.body;

        // Handle profile picture
        const profilePicturePath = req.files?.profilePicture
            ? `/uploads/profilePictures/${req.files.profilePicture[0].filename}`
            : "";

        // Handle proof files
        const uploadProofs = req.files?.proofs
            ? req.files.proofs.map((file) => `/uploads/proofs/${file.filename}`)
            : [];

        // Ensure no more than 3 proofs are uploaded
        if (uploadProofs.length > 3) {
            return res.status(400).json({ message: "You can upload a maximum of 3 proof files." });
        }

        // Determine if this user is a primary user or a family member
        if (!parentUserId) {
            // Generate a unique member ID for the primary user
            const memberId = await generatePrimaryMemberId();

            // Create a new primary user
            const newUser = new User({
                name,
                email,
                mobileNumber,
                memberId,
                relation: "Primary",
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
                vehicleNumber,
                vehicleModel,
                drivingLicenceNumber,
                uploadProofs,
                isDeleted: false,
                lastLogin: Date.now(),
            });

            // Save the primary user to the database
            const savedUser = await newUser.save();
            return res.status(201).json({
                message: "Primary user created successfully",
                user: savedUser,
            });
        }

        // If parentUserId is provided, it means this is a family member addition
        const parentUser = await User.findById(parentUserId);
        if (!parentUser) {
            return res.status(404).json({ message: "Parent user not found." });
        }

        // Validate relationship rules
        const existingRelations = await User.find({ parentUserId });
        if (relation === "Spouse" && existingRelations.some((member) => member.relation === "Spouse")) {
            return res.status(400).json({ message: "Only one spouse can be added per user." });
        }

        // Generate a unique member ID for the family member
        const memberId = await generateFamilyMemberId(parentUser.memberId, existingRelations.length);

        // Create a new family member
        const familyMember = new User({
            name,
            email,
            mobileNumber,
            memberId,
            relation,
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
            parentUserId: parentUser._id,
            profilePicture: profilePicturePath,
            vehicleNumber,
            vehicleModel,
            drivingLicenceNumber,
            uploadProofs,
        });

        // Save the family member to the database
        const savedFamilyMember = await familyMember.save();
        res.status(201).json({
            message: "Family member added successfully",
            user: savedFamilyMember,
        });
    } catch (error) {
        console.error("Error in creating user or adding family member:", error);
        res.status(400).json({
            message: "Error in creating user or adding family member",
            error: error.message,
        });
    }
};



// Step 1: Request login to generate and send OTP
const loginRequest = async (req, res) => {
    try {
        const { identifier } = req.body;

        // Find user by mobile number, email, or member ID
        const user = await User.findOne({
            $or: [
                { mobileNumber: identifier },
                { email: identifier },
                { memberId: identifier },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is active
        if (user.status !== "Active") {
            return res.status(400).json({ message: "User is inactive. Please contact support." });
        }

        // Set the OTP
        console.log(process.env.USE_STATIC_OTP, "dswidi")
        let otp;
        if (process.env.USE_STATIC_OTP === "true") {
            otp = STATIC_OTP;
        } else {
            otp = generateOtp();
        }

        // Save hashed OTP in the user document
        user.otp = crypto.createHash("sha256").update(otp).digest("hex");
        await user.save();

        // Send OTP via Twilio (commented for testing)
        /*
        await client.messages.create({
            body: `Your login OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.mobileNumber,
        });
        */  // Log the login action
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        await logAction({
            userId: user._id,
            userType: "User",
            action: "login",
            role: 'member',
            ipAddress: ip,
            userAgent: req.headers["user-agent"],
        });

        res.status(200).json({
            message: process.env.USE_STATIC_OTP === "true" ? "Static OTP set for testing" : "OTP sent to registered mobile number",
            userId: user._id,
        });
    } catch (error) {
        console.error("Error in login request:", error);
        res.status(500).json({ message: "Error setting OTP", error: error.message });
    }
}

// Step 2: Verify OTP, generate token, and log in
const verifyOtp = async (req, res) => {
    try {
        const { userId, otp, fcmToken } = req.body;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is active
        if (user.status !== "Active") {
            return res.status(400).json({ message: "User is inactive. Please contact support." });
        }

        // Verify OTP
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        if (user.otp !== hashedOtp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        // OTP is valid; clear it and update the last login time
        user.otp = null;
        user.fcmToken = fcmToken;
        user.lastLogin = Date.now();
        await user.save();

        // Generate JWT token
        const tokenData =
        {
            userId: user._id,
            memberId: user.memberId,
            email: user.email,
            role: 'member',
            mobileNumber: user.mobileNumber,
        }
        const token = generateToken(tokenData)
        return res.status(200).json({
            message: "Login successful",
            token, // JWT token
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobileNumber: user.mobileNumber,
                memberId: user.memberId,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
}


// -------------------------old_Code----------------------------------------------------
// Helper function to recursively fetch family members with QR codes
// const fetchFamilyTree = async (userId) => {
//     const familyMembers = await User.find({ parentUserId: userId, status: 'Active' }, "-otp -__v");

//     // Recursively fetch sub-family members for each family member
//     const familyTree = await Promise.all(
//         familyMembers.map(async (member) => {
//             // Generate QR code including the profile picture
//             const qrData = {
//                 _id: member._id,
//                 name: member.name,
//                 email: member.email,
//                 mobileNumber: member.mobileNumber,
//                 memberId: member.memberId,
//                 relation: member.relation,
//                 address: member.address,
//                 age: member.age,
//                 status: member.status,
//                 activatedDate: member.activatedDate,
//                 profilePicture: member.profilePicture, // Add profile picture in QR data
//             };
//             const qrCode = await QRCodeHelper.generateQRCode(qrData);

//             return {
//                 _id: member._id,
//                 name: member.name,
//                 email: member.email,
//                 mobileNumber: member.mobileNumber,
//                 memberId: member.memberId,
//                 relation: member.relation,
//                 address: member.address,
//                 age: member.age,
//                 status: member.status,
//                 activatedDate: member.activatedDate,
//                 profilePicture: member.profilePicture,
//                 qrCode, // Include the generated QR code
//                 familyMembers: await fetchFamilyTree(member._id), // Recursively fetch sub-family members
//             };
//         })
//     );

//     return familyTree;
// };
const fetchFamilyTree = async (userId) => {
    const familyMembers = await User.find({ parentUserId: userId, status: 'Active' }, "-otp -__v");

    // Recursively fetch sub-family members for each family member
    const familyTree = await Promise.all(
        familyMembers.map(async (member) => {
            // Generate QR code including the profile picture and additional fields
            const qrData = {
                primaryMemberId: member._id,
                name: member.name,
                email: member.email,
                mobileNumber: member.mobileNumber,
                memberId: member.memberId,
                relation: member.relation,
                address: member.address,
                address1: member.address1,
                address2: member.address2,
                city: member.city,
                state: member.state,
                country: member.country,
                pin: member.pin,
                dateOfBirth: member.dateOfBirth,
                maritalStatus: member.maritalStatus,
                marriageDate: member.marriageDate,
                title: member.title,
                status: member.status,
                activatedDate: member.activatedDate,
                profilePicture: member.profilePicture, // Add profile picture in QR data
                vehicleNumber: member.vehicleNumber,
                vehicleModel: member.vehicleModel,
                drivingLicenceNumber: member.drivingLicenceNumber,
            };
            const qrCode = await QRCodeHelper.generateQRCode(qrData);

            return {
                _id: member._id,
                name: member.name,
                email: member.email,
                mobileNumber: member.mobileNumber,
                memberId: member.memberId,
                relation: member.relation,
                address: member.address,
                address1: member.address1,
                address2: member.address2,
                city: member.city,
                state: member.state,
                country: member.country,
                pin: member.pin,
                dateOfBirth: member.dateOfBirth,
                maritalStatus: member.maritalStatus,
                marriageDate: member.marriageDate,
                title: member.title,
                status: member.status,
                activatedDate: member.activatedDate,
                profilePicture: member.profilePicture,
                qrCode, // Include the generated QR code
                familyMembers: await fetchFamilyTree(member._id), // Recursively fetch sub-family members
                vehicleNumber: member.vehicleNumber,
                vehicleModel: member.vehicleModel,
                drivingLicenceNumber: member.drivingLicenceNumber,
            };
        })
    );

    return familyTree;
};


// Fetch user details including nested family members based on userId from the JWT token
// const getUserDetails = async (req, res) => {
//     try {
//         const userId = req.user.userId; // Extract userId from the token's decoded data

//         // Find the primary user by ID
//         const user = await User.findById(userId, "-otp -__v");
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Check if the user is active
//         if (user.status !== "Active") {
//             return res.status(400).json({ message: "User is inactive. Please contact support." });
//         }


//         // Generate QR code for the primary user including profile picture
//         const primaryUserQRData = {
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             mobileNumber: user.mobileNumber,
//             memberId: user.memberId,
//             address: user.address,
//             relation: user.relation,
//             age: user.age,
//             status: user.status,
//             activatedDate: user.activatedDate,
//             profilePicture: user.profilePicture, // Include profile picture
//         };
//         const primaryUserQRCode = await QRCodeHelper.generateQRCode(primaryUserQRData);

//         // Fetch the full family tree for this user
//         const familyMembers = await fetchFamilyTree(userId);

//         // Send the response including the user and their full family tree with QR codes
//         res.status(200).json({
//             message: "User details retrieved successfully",
//             user: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 mobileNumber: user.mobileNumber,
//                 memberId: user.memberId,
//                 lastLogin: user.lastLogin,
//                 profilePicture: user.profilePicture,
//                 address: user.address,
//                 relation: user.relation,
//                 age: user.age,
//                 status: user.status,
//                 activatedDate: user.activatedDate,
//                 qrCode: primaryUserQRCode, // Include the primary user's QR code
//                 familyMembers, // Nested family members with QR codes
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching user details:", error);
//         res.status(500).json({ message: "Error fetching user details", error: error.message });
//     }
// };
const getUserDetails = async (req, res) => {
    try {
        const userId = req.user.userId; // Extract userId from the token's decoded data

        // Find the primary user by ID
        const user = await User.findById(userId, "-otp -__v");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is active
        if (user.status !== "Active") {
            return res.status(400).json({ message: "User is inactive. Please contact support." });
        }

        // Generate QR code for the primary user including profile picture and additional fields
        const primaryUserQRData = {
            primaryMemberId: user._id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            memberId: user.memberId,
            address: user.address,
            address1: user.address1,
            address2: user.address2,
            city: user.city,
            state: user.state,
            country: user.country,
            pin: user.pin,
            dateOfBirth: user.dateOfBirth,
            maritalStatus: user.maritalStatus,
            marriageDate: user.marriageDate,
            title: user.title,
            relation: user.relation,
            status: user.status,
            activatedDate: user.activatedDate,
            profilePicture: user.profilePicture, // Include profile picture
            vehicleNumber: user.vehicleNumber,
            vehicleModel: user.vehicleModel,
            drivingLicenceNumber: user.drivingLicenceNumber,
        };
        const primaryUserQRCode = await QRCodeHelper.generateQRCode(primaryUserQRData);

        // Fetch the full family tree for this user
        const familyMembers = await fetchFamilyTree(userId);

        // Send the response including the user and their full family tree with QR codes
        res.status(200).json({
            message: "User details retrieved successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobileNumber: user.mobileNumber,
                memberId: user.memberId,
                lastLogin: user.lastLogin,
                profilePicture: user.profilePicture,
                address: user.address,
                address1: user.address1,
                address2: user.address2,
                city: user.city,
                state: user.state,
                country: user.country,
                pin: user.pin,
                dateOfBirth: user.dateOfBirth,
                maritalStatus: user.maritalStatus,
                marriageDate: user.marriageDate,
                title: user.title,
                relation: user.relation,
                status: user.status,
                activatedDate: user.activatedDate,
                vehicleNumber: user.vehicleNumber,
                vehicleModel: user.vehicleModel,
                drivingLicenceNumber: user.drivingLicenceNumber,
                familyMembers, // Nested family members with QR codes
                qrCode: primaryUserQRCode, // Include the primary user's QR code
            },
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Error fetching user details", error: error.message });
    }
};


// ------------------ ------------------------------------------------------------------------

const updateProfilePicture = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided." });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Store the new profile picture path
        const newProfilePicturePath = `/uploads/profilePictures/${req.file.filename}`;

        // Optional: Delete the old profile picture if it exists
        if (user.profilePicture && user.profilePicture !== "") {
            const oldProfilePicturePath = path.join(__dirname, "..", user.profilePicture);
            if (fs.existsSync(oldProfilePicturePath)) {
                fs.unlinkSync(oldProfilePicturePath);
            }
        }

        // Update the user's profile picture in the database
        user.profilePicture = newProfilePicturePath;
        await user.save();

        res.status(200).json({
            message: "Profile picture updated successfully.",
            profilePicture: newProfilePicturePath,
        });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({
            message: "Error updating profile picture.",
            error: error.message,
        });
    }
};

const userLogout = async (req, res) => {
    try {
        const user = req.user;
        // const adminId = req.user.id; // Assuming JWT middleware attaches `user` to `req`
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        await logAction({
            userId: user.userId,
            userType: "User",
            action: "logout",
            role: user.role,
            ipAddress: ip,
            userAgent: req.headers["user-agent"],
        });

        // Invalidate the token (optional, depends on implementation)
        // This could be handled by blacklisting the token or setting an expiry.

        res.status(200).json({
            message: 'Logout successful.',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            message: 'Internal Server Error',
        });
    }
};


const uploadProofs = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if proofs are provided
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please provide proofs to upload!" });
        }

        // Extract proof file paths and ensure cross-platform compatibility
        const proofPaths = req.files.map((file) => `/${file.path.replace(/\\/g, '/')}`);

        // Ensure no more than 3 proofs are uploaded in total
        if (user.uploadProofs.length + proofPaths.length > 3) {
            return res.status(400).json({ message: "You can upload a maximum of 3 proofs." });
        }

        // Add the new proofs to the user's proofs array
        user.uploadProofs.push(...proofPaths);

        // Save the updated user
        await user.save();

        return res.status(200).json({
            message: "Proofs uploaded successfully.",
            proofs: proofPaths,
        });
    } catch (error) {
        console.error("Error uploading proofs:", error);
        return res.status(500).json({
            message: "Failed to upload proofs.",
            error: error.message,
        });
    }
};


const deleteProofs = async (req, res) => {
    const { userId, index } = req.params;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Validate the index
        if (index < 0 || index >= user.uploadProofs.length) {
            return res.status(400).json({ message: "Invalid proof index." });
        }

        // Get the proof path
        const proofPath = user.uploadProofs[index];

        // Remove the proof from the array
        user.uploadProofs.splice(index, 1);

        // Delete the proof file from the server
        const filePath = path.resolve(__dirname, "..", proofPath);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Failed to delete proof file:", err);
            }
        });

        // Save the updated user
        await user.save();

        return res.status(200).json({ message: "Proof deleted successfully." });
    } catch (error) {
        console.error("Error deleting proof:", error);
        return res.status(500).json({
            message: "Failed to delete proof.",
            error: error.message,
        });
    }
};



module.exports = {
    createUser,
    loginRequest,
    verifyOtp,
    getUserDetails,
    updateProfilePicture,
    userLogout,
    uploadProofs,
    deleteProofs
};
