const User = require("../models/user");
const crypto = require("crypto");
const { generatePrimaryMemberId, generateFamilyMemberId, generateOtp, generateToken } = require("../utils/common");
const fs = require("fs");
const path = require("path");
const QRCodeHelper = require('../utils/helper');

require("dotenv").config();
// const twilio = require("twilio"); // Uncomment this when you want to use Twilio for OTPs

// Static OTP for testing
const STATIC_OTP = "123456";
// Twilio setup (uncomment when ready to use Twilio)
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);

const createUser = async (req, res) => {
    try {
        const { name, email, mobileNumber, relation, age, parentUserId, address } = req.body;
        console.log(req.body, "ree")
        const profilePicturePath = req.file ? `/uploads/profilePictures/${req.file.filename}` : "";

        // Determine if this user is a primary user or a family member
        if (!parentUserId) {
            const memberId = await generatePrimaryMemberId();
            const newUser = new User({
                name,
                email,
                mobileNumber,
                memberId,
                relation: "Primary",
                address,
                profilePicture: profilePicturePath,
                isDeleted: false,
                lastLogin: Date.now(),
            });

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

        if (relation === "Child" && (!age || age < 18)) {
            return res.status(400).json({ message: "Children must be 18 or older to be added." });
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
            address,
            parentUserId: parentUser._id,
            age: relation === "Child" ? age : undefined,
            profilePicture: profilePicturePath,
        });

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
        */

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
        const { userId, otp } = req.body;

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
        user.lastLogin = Date.now();
        await user.save();

        // Generate JWT token
        const tokenData =
        {
            userId: user._id,
            memberId: user.memberId,
            email: user.email,
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
// Helper function to recursively fetch family members
// const fetchFamilyTree = async (userId) => {
//     const familyMembers = await User.find({ parentUserId: userId }, "-otp -__v");

//     // Recursively fetch sub-family members for each family member
//     const familyTree = await Promise.all(
//         familyMembers.map(async (member) => ({
//             _id: member._id,
//             name: member.name,
//             email: member.email,
//             mobileNumber: member.mobileNumber,
//             memberId: member.memberId,
//             relation: member.relation,
//             address: member.address,
//             age: member.age,
//             profilePicture: member.profilePicture,
//             familyMembers: await fetchFamilyTree(member._id), // Recursively fetch sub-family members
//         }))
//     );

//     return familyTree;
// };

// Helper function to recursively fetch family members with QR codes
const fetchFamilyTree = async (userId) => {
    const familyMembers = await User.find({ parentUserId: userId, status: 'Active' }, "-otp -__v");

    // Recursively fetch sub-family members for each family member
    const familyTree = await Promise.all(
        familyMembers.map(async (member) => {
            // Generate QR code including the profile picture
            const qrData = {
                _id: member._id,
                name: member.name,
                email: member.email,
                mobileNumber: member.mobileNumber,
                memberId: member.memberId,
                relation: member.relation,
                address: member.address,
                age: member.age,
                status: member.status,
                activatedDate: member.activatedDate,
                profilePicture: member.profilePicture, // Add profile picture in QR data
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
                age: member.age,
                status: member.status,
                activatedDate: member.activatedDate,
                profilePicture: member.profilePicture,
                qrCode, // Include the generated QR code
                familyMembers: await fetchFamilyTree(member._id), // Recursively fetch sub-family members
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

//         // Fetch the full family tree for this user
//         const familyMembers = await fetchFamilyTree(userId);

//         // Send the response including the user and their full family tree
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
//                 familyMembers, // Nested family members
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


        // Generate QR code for the primary user including profile picture
        const primaryUserQRData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            mobileNumber: user.mobileNumber,
            memberId: user.memberId,
            address: user.address,
            relation: user.relation,
            age: user.age,
            status: user.status,
            activatedDate: user.activatedDate,
            profilePicture: user.profilePicture, // Include profile picture
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
                relation: user.relation,
                age: user.age,
                status: user.status,
                activatedDate: user.activatedDate,
                qrCode: primaryUserQRCode, // Include the primary user's QR code
                familyMembers, // Nested family members with QR codes
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

module.exports = {
    createUser,
    loginRequest,
    verifyOtp,
    getUserDetails,
    updateProfilePicture
};
