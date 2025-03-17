const User = require("../models/user");
const crypto = require("crypto");
const { generatePrimaryMemberId, generateFamilyMemberId, generateOtp, generateToken } = require("../utils/common");
const fs = require("fs");
const path = require("path");
const QRCodeHelper = require('../utils/helper');
const { logAction, logUpdateQrCode } = require("./commonController");

const xlsx = require('xlsx');
const sendEmail = require("../utils/sendMail");
const { otpRenderTemplate } = require("../utils/templateRenderer");
const emailTemplates = require("../utils/emailTemplates");
const { sendSMSViaPOST } = require("../utils/sendOtp");




require("dotenv").config();
// const twilio = require("twilio"); // Uncomment this when you want to use Twilio for OTPs

// Static OTP for testing
const STATIC_OTP = "224455";
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
//             vehicleNumber,
//             vehicleModel,
//             drivingLicenceNumber,
//             creditLimit,
//             creditStop,
//             qrCodeId,
//             cardId
//         } = req.body;

//         // Handle profile picture
//         const profilePicturePath = req.files?.profilePicture
//             ? `/uploads/profilePictures/${req.files.profilePicture[0].filename}`
//             : "";

//         // Handle proof files
//         const uploadProofs = req.files?.proofs
//             ? req.files.proofs.map((file) => `/uploads/proofs/${file.filename}`)
//             : [];

//         // Ensure no more than 3 proofs are uploaded
//         if (uploadProofs.length > 3) {
//             return res.status(400).json({ message: "You can upload a maximum of 3 proof files." });
//         }


//         // Determine if this user is a primary user or a family member
//         if (!parentUserId) {
//             // Generate a unique member ID for the primary user
//             // const memberId = await generatePrimaryMemberId();

//             // // Check if email or mobile number is already linked to another account
//             // const existingUser = await User.findOne({
//             //     $or: [{ email: email }, { mobileNumber: mobileNumber }, { relation: "Primary" }],
//             // });
//             const existingUser = await User.findOne({
//                 $and: [
//                     { relation: "Primary" },
//                     { $or: [{ email: email }, { mobileNumber: mobileNumber }] }
//                 ]
//             });

//             if (existingUser) {
//                 return res.status(400).json({
//                     message: "This mobile number or e-mail is already linked to another primary member account.",
//                 });
//             }


//             const memberId = req.body.memberId;


//             // Create a new primary user
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
//                 vehicleNumber,
//                 vehicleModel,
//                 drivingLicenceNumber,
//                 uploadProofs,
//                 isDeleted: false,
//                 lastLogin: Date.now(),
//                 creditLimit,
//                 creditStop,
//                 qrCodeId,
//                 cardId
//             });

//             // Save the primary user to the database
//             let savedUser = await newUser.save();
//             // Generate and update the QR Code
//             const userQRCode = await QRCodeHelper.generateQRCode(savedUser);
//             savedUser.qrCode = userQRCode;
//             const finalSavedUser = await savedUser.save();

//             return res.status(201).json({
//                 message: "Primary user created successfully",
//                 user: finalSavedUser,
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

//         // Generate a unique member ID for the family member
//         const memberId = await generateFamilyMemberId(parentUser.memberId, existingRelations.length);

//         // Create a new family member
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
//             vehicleNumber,
//             vehicleModel,
//             drivingLicenceNumber,
//             uploadProofs,
//             qrCodeId,
//             cardId
//         });

//         // Save the family member to the database
//         let savedFamilyMember = await familyMember.save();
//         const familyUserQRCode = await QRCodeHelper.generateQRCode(savedFamilyMember);
//         savedFamilyMember.qrCode = familyUserQRCode;

//         const finalSavedFamilyMember = await savedFamilyMember.save();
//         return res.status(201).json({
//             message: "Family member added successfully",
//             user: finalSavedFamilyMember,
//         });
//     } catch (error) {
//         console.error("Error in creating user or adding family member:", error);
//         return res.status(400).json({
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
            email2,
            mobileNumber2,
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
            creditLimit,
            creditStop,
            qrCodeId,
            cardId
        } = req.body;

        // Handle profile picture (if uploaded)
        const profilePicturePath = req.files?.profilePicture
            ? `/uploads/profilePictures/${req.files.profilePicture[0].filename}`
            : "";

        // Handle proof files (limit to 3 proofs)
        const uploadProofs = req.files?.proofs
            ? req.files.proofs.map((file) => `/uploads/proofs/${file.filename}`)
            : [];

        if (uploadProofs.length > 3) {
            return res.status(400).json({ message: "You can upload a maximum of 3 proof files." });
        }

        // Handle primary user creation
        if (!parentUserId) {
            // Check if primary user already exists with same email or mobile
            const existingUser = await User.findOne({
                $and: [
                    { relation: "Primary" },
                    { $or: [{ email }, { mobileNumber }] }
                ]
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "This mobile number or e-mail is already linked to another primary member account.",
                });
            }

            const memberId = req.body.memberId;

            // Create a new primary user
            const newUser = new User({
                name,
                email,
                mobileNumber,
                email2,
                mobileNumber2,
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
                creditLimit,
                creditStop,
                qrCodeId,
                cardId
            });

            // Save and generate QR code
            const savedUser = await newUser.save();
            const userQRCode = await QRCodeHelper.generateQRCode(savedUser);
            savedUser.qrCode = userQRCode;

            // Save final user with QR code
            const finalSavedUser = await savedUser.save();

            return res.status(201).json({
                message: "Primary user created successfully",
                user: finalSavedUser,
            });
        }

        // Handle family member addition
        const parentUser = await User.findById(parentUserId);
        if (!parentUser) {
            return res.status(404).json({ message: "Parent user not found." });
        }

        // Validate relationship rules for family members (e.g., only one spouse per user)
        const existingRelations = await User.find({ parentUserId });
        if (relation === "Spouse" && existingRelations.some((member) => member.relation === "Spouse")) {
            return res.status(400).json({ message: "Only one spouse can be added per user." });
        }

        // Generate unique member ID for family member
        const memberId = await generateFamilyMemberId(parentUser.memberId, existingRelations.length);

        // Create the family member
        const familyMember = new User({
            name,
            email,
            mobileNumber,
            email2,
            mobileNumber2,
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
            qrCodeId,
            cardId
        });

        // Save the family member and generate QR code
        const savedFamilyMember = await familyMember.save();
        const familyUserQRCode = await QRCodeHelper.generateQRCode(savedFamilyMember);
        savedFamilyMember.qrCode = familyUserQRCode;

        // Final save with QR code for family member
        const finalSavedFamilyMember = await savedFamilyMember.save();

        return res.status(201).json({
            message: "Family member added successfully",
            user: finalSavedFamilyMember,
        });

    } catch (error) {
        console.error("Error in creating user or adding family member:", error);
        return res.status(400).json({
            message: "Error in creating user or adding family member",
            error: error.message,
        });
    }
};



// Step 1: Request login to generate and send OTP
const loginRequest = async (req, res) => {
    try {
        const { identifier } = req.body;

        // // Find user by mobile number, email, or member ID
        // const user = await User.findOne({
        //     $or: [
        //         { mobileNumber: identifier },
        //         { email: identifier },
        //         { memberId: identifier },
        //         { relation: "Primary" } // Ensuring the relation is "Primary"
        //     ],
        // },

        // );
        const user = await User.findOne({
            $and: [
                { relation: "Primary" },
                {
                    $or: [
                        { mobileNumber: identifier },
                        { email: identifier },
                        { memberId: identifier }
                    ]
                }
            ]
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
        const templateData = {
            otp: otp
        }

        const emailTemplate = emailTemplates.otpTemplate;
        const htmlBody = otpRenderTemplate(emailTemplate.body, templateData);
        const subject = otpRenderTemplate(emailTemplate.subject, templateData);

        // send OTP vie Mobile Number
        const message = `Dear Member, your OTP for verification code is ${otp} Please do not share this OTP with anyone. BCLUB`
        await sendSMSViaPOST(user.mobileNumber, message);

        // Send OTP via Email
        await sendEmail(user.email, subject, htmlBody, attachments = [], cc = null);

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
            ipAddress: req.userIp, // ip,
            userAgent: req.headers["user-agent"],
        });

        return res.status(200).json({
            message: process.env.USE_STATIC_OTP === "true" ? "OTP sent to registered mobile number or registered email" : "OTP sent to registered mobile number or registered email",
            userId: user._id,
        });
    } catch (error) {
        console.error("Error in login request:", error);
        return res.status(500).json({ message: "Error setting OTP", error: error.message });
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
            // const qrCode = await QRCodeHelper.generateQRCode(qrData);
            const qrCode = member.qrCode;

            return {
                _id: member._id,
                name: member.name,
                email: member.email,
                mobileNumber: member.mobileNumber,
                email2: member.email2,
                mobileNumber2: member.mobileNumber2,
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
                vehicleNumber: member.vehicleNumber,
                vehicleModel: member.vehicleModel,
                drivingLicenceNumber: member.drivingLicenceNumber,
                qrCodeId: member.qrCodeId,
                cardId: member.cardId,
                qrGenratedDate: member.qrGenratedDate,
                qrCode, // Include the generated QR code
                familyMembers: await fetchFamilyTree(member._id), // Recursively fetch sub-family members
            };
        })
    );

    return familyTree;
};


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
            email2: user.email2,
            mobileNumber2: user.mobileNumber2,
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
        // const primaryUserQRCode = await QRCodeHelper.generateQRCode(primaryUserQRData);
        const primaryUserQRCode = user.qrCode;

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
                email2: user.email2,
                mobileNumber2: user.mobileNumber2,
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
                creditLimit: user.creditLimit,
                creditStop: user.creditStop,
                qrCodeId: user.qrCodeId,
                cardId: user.cardId,
                qrGenratedDate: user.qrGenratedDate,
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


const updateProfilePictureByUser = async (req, res) => {
    try {
        const { userId } = req.user;

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

        // // Optional: Delete the old profile picture if it exists
        // if (user.profilePicture && user.profilePicture !== "") {
        //     const oldProfilePicturePath = path.join(__dirname, "..", user.profilePicture);
        //     if (fs.existsSync(oldProfilePicturePath)) {
        //         fs.unlinkSync(oldProfilePicturePath);
        //     }
        // }

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
            ipAddress: req.userIp, // ip,
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
        // const filePath = path.resolve(__dirname, "..", proofPath);
        // fs.unlink(filePath, (err) => {
        //     if (err) {
        //         console.error("Failed to delete proof file:", err);
        //     }
        // });

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




// const uploadMemberData = async (req, res) => {
//     try {
//         const filePath = req.file.path;
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         const savedMembers = [];

//         for (const member of data) {
//             // if (member.CATEGORY === "Permanent Member") {
//             if (member.CATEGORY && member.CATEGORY.startsWith("Permanent Member")) {
//                 const existingMember = await User.findOne({ memberId: member.MEMBERACCNO });
//                 if (existingMember) {
//                     console.log(`Skipping duplicate entry for memberId: ${member.MEMBERACCNO}`);
//                     continue;
//                 }
//                 // Create Primary Member
//                 const primaryMember = new User({
//                     memberId: member.MEMBERACCNO,
//                     title: member.TITLEDESCRIPTION || "Mr.",
//                     name: member.MEMBERNAME,
//                     dateOfBirth: member.DATEOFBIRTH ? new Date(member.DATEOFBIRTH) : null,
//                     relation: "Primary",
//                     maritalStatus: member.MARITALINFO || "Single",
//                     address: "",
//                     address1: "",
//                     address2: "",
//                     city: "",
//                     state: "",
//                     country: "",
//                     pin: "",
//                     email: "", // Placeholder, as email is not in the file
//                     mobileNumber: "", // Placeholder, as mobileNumber is not in the file
//                     otp: null,
//                     age: null,
//                     marriageDate: null,
//                     status: "Active",
//                     activatedDate: Date.now(),
//                     profilePicture: "",
//                     isDeleted: false,
//                     fcmToken: "",
//                     lastLogin: Date.now(),
//                     vehicleNumber: "",
//                     vehicleModel: "",
//                     drivingLicenceNumber: "",
//                     uploadProofs: [],
//                     creditStop: false,
//                     creditLimit: 0,
//                 });

//                 const savedPrimary = await primaryMember.save();
//                 savedMembers.push(savedPrimary);

//                 // Create Spouse if available
//                 if (member.SPOUSEID && member.SPOUSENAME) {
//                     const existingSpouse = await User.findOne({ memberId: member.SPOUSEID });
//                     if (existingSpouse) {
//                         console.log(`Skipping duplicate entry for spouseId: ${member.SPOUSEID}`);
//                         continue;
//                     }
//                     const spouseMember = new User({
//                         memberId: member.SPOUSEID,
//                         title: member.SPOUSETITLE || "Mrs.",
//                         name: member.SPOUSENAME,
//                         dateOfBirth: member.SPOUSEDATEOFBIRTH ? new Date(member.SPOUSEDATEOFBIRTH) : null,
//                         relation: "Spouse",
//                         maritalStatus: "Married",
//                         parentUserId: savedPrimary._id,
//                         address: "",
//                         address1: "",
//                         address2: "",
//                         city: "",
//                         state: "",
//                         country: "",
//                         pin: "",
//                         email: "", // Placeholder
//                         mobileNumber: "", // Placeholder
//                         otp: null,
//                         age: null,
//                         marriageDate: null,
//                         status: "Active",
//                         activatedDate: Date.now(),
//                         profilePicture: "",
//                         isDeleted: false,
//                         fcmToken: "",
//                         lastLogin: Date.now(),
//                         vehicleNumber: "",
//                         vehicleModel: "",
//                         drivingLicenceNumber: "",
//                         uploadProofs: [],
//                         creditStop: false,
//                         creditLimit: 0,
//                     });

//                     const savedSpouse = await spouseMember.save();
//                     savedMembers.push(savedSpouse);
//                 }
//             }
//         }
//         // Delete the uploaded file
//         fs.unlinkSync(filePath);

//         return res.status(200).json({ message: "Members and their spouses uploaded successfully", data: savedMembers });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Error uploading members", error: error.message });
//     }
// }


// const uploadMemberData = async (req, res) => {
//     try {
//         const filePath = req.file.path;
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         const savedMembers = new Map();

//         for (const member of data) {
//             if (member.MEMBERCATEGORY) {
//                 // Primary Member
//                 const primaryMemberId = member.MEMBERACCNO;
//                 const existingMember = await User.findOne({ memberId: primaryMemberId });
//                 if (existingMember) {
//                     console.log(`Skipping duplicate entry for memberId: ${primaryMemberId}`);
//                     continue;
//                 }
//                 const primaryMember = new User({
//                     memberId: primaryMemberId,
//                     title: member.MEMBERTITLE || "Mr.",
//                     name: member.MEMBERNAME,
//                     dateOfBirth: member.MEMBERDOB ? new Date(member.MEMBERDOB) : null,
//                     relation: "Primary",
//                     maritalStatus: member.MEMBERMARITALINFO || "Single",
//                     // address: `${member.ADDR2 || ""}, ${member.ADDR3 || ""}`.trim(),
//                     address: member.ADDR1 || "",
//                     address1: member.ADDR2 || "",
//                     address2: member.ADDR3 || "",
//                     city: member.CITYDESCRIPTION || "",
//                     state: member.STATEDESCRIPTION || "",
//                     country: member.COUNTRYDESCRIPTION || "",
//                     pin: member.PIN || "",
//                     email: member.EMAIL1 || "",
//                     mobileNumber: member.PH1 || "",
//                     email2: member.EMAIL2 || "",
//                     mobileNumber2: member.PH2 || "",
//                     otp: null,
//                     age: null,
//                     marriageDate: null,
//                     status: "Active",
//                     activatedDate: Date.now(),
//                     profilePicture: "",
//                     isDeleted: false,
//                     fcmToken: "",
//                     lastLogin: Date.now(),
//                     vehicleNumber: member.VEHICLENO || "",
//                     vehicleModel: member.VEHICLEMAKE || "",
//                     drivingLicenceNumber: "",
//                     uploadProofs: [],
//                     creditStop: false,
//                     creditLimit: 0,
//                 });
//                 const savedPrimary = await primaryMember.save();
//                 savedMembers.set(primaryMemberId, savedPrimary);
//                 // await primaryMember.save();
//             }

//             // Spouse Member
//             if (member.MEMBERSPOUSEID && member.MEMBERSPOUSENAME) {
//                 const spouseId = member.MEMBERSPOUSEID;
//                 const existingSpouse = await User.findOne({ memberId: spouseId });
//                 if (existingSpouse) {
//                     console.log(`Skipping duplicate entry for spouseId: ${spouseId}`);
//                     continue;
//                 }
//                 const spouseMember = new User({
//                     memberId: spouseId,
//                     title: member.MEMBERSPOUSETITLE || "Mrs.",
//                     name: member.MEMBERSPOUSENAME,
//                     dateOfBirth: member.MEMBERSPOUSEDOB ? new Date(member.MEMBERSPOUSEDOB) : null,
//                     relation: "Spouse",
//                     maritalStatus: "Married",
//                     parentUserId: savedMembers.get(member.MEMBERACCNO)?._id || null,
//                     // address: `${member.ADDR2 || ""}, ${member.ADDR3 || ""}`.trim(),
//                     address: member.ADDR1 || "",
//                     address1: member.ADDR2 || "",
//                     address2: member.ADDR3 || "",
//                     city: member.CITYDESCRIPTION || "",
//                     state: member.STATEDESCRIPTION || "",
//                     country: member.COUNTRYDESCRIPTION || "",
//                     pin: member.PIN || "",
//                     email: member.EMAIL1 || "",
//                     mobileNumber: member.PH1 || "",
//                     email2: member.EMAIL2 || "",
//                     mobileNumber2: member.PH2 || "",
//                     otp: null,
//                     age: null,
//                     marriageDate: null,
//                     status: "Active",
//                     activatedDate: Date.now(),
//                     profilePicture: "",
//                     isDeleted: false,
//                     fcmToken: "",
//                     lastLogin: Date.now(),
//                     vehicleNumber: member.VEHICLENO || "",
//                     vehicleModel: member.VEHICLEMAKE || "",
//                     drivingLicenceNumber: "",
//                     uploadProofs: [],
//                     creditStop: false,
//                     creditLimit: 0,
//                 });
//                 // const savedSpouse = await spouseMember.save();
//                 // savedMembers.set(spouseId, savedSpouse);
//                 await spouseMember.save();
//             }

//             // Additional User Members and User Spouses
//             if (member.USERID && member.USERNAME) {
//                 const userId = member.USERID;
//                 const existingUser = await User.findOne({ memberId: userId });
//                 if (existingUser) {
//                     console.log(`Skipping duplicate entry for userId: ${userId}`);
//                     continue;
//                 }
//                 const userRelation = member.USERCATEGORY || "Dependent";
//                 const userMember = new User({
//                     memberId: userId,
//                     title: member.USERTITLE || "Mr.",
//                     name: member.USERNAME,
//                     dateOfBirth: member.USERDOB ? new Date(member.USERDOB) : null,
//                     relation: userRelation,
//                     parentUserId: savedMembers.get(member.MEMBERACCNO)?._id || null,
//                     maritalStatus: member.USERMARITALINFO || "Single",
//                     // address: `${member.ADDR2 || ""}, ${member.ADDR3 || ""}`.trim(),
//                     address: member.ADDR1 || "",
//                     address1: member.ADDR2 || "",
//                     address2: member.ADDR3 || "",
//                     city: member.CITYDESCRIPTION || "",
//                     state: member.STATEDESCRIPTION || "",
//                     country: member.COUNTRYDESCRIPTION || "",
//                     pin: member.PIN || "",
//                     email: member.EMAIL1 || "",
//                     mobileNumber: member.PH1 || "",
//                     email2: member.EMAIL2 || "",
//                     mobileNumber2: member.PH2 || "",
//                     otp: null,
//                     age: null,
//                     marriageDate: null,
//                     status: "Active",
//                     activatedDate: Date.now(),
//                     profilePicture: "",
//                     isDeleted: false,
//                     fcmToken: "",
//                     lastLogin: Date.now(),
//                     vehicleNumber: member.VEHICLENO || "",
//                     vehicleModel: member.VEHICLEMAKE || "",
//                     drivingLicenceNumber: "",
//                     uploadProofs: [],
//                     creditStop: false,
//                     creditLimit: 0,
//                 });
//                 await userMember.save();
//                 // savedMembers.set(userId, savedUser);

//                 // User Spouse
//                 if (member.USERSPOUSEID && member.USERSPOUSENAME) {
//                     const userSpouseId = member.USERSPOUSEID;
//                     const userSpouseRelation = `${userRelation} Spouse`;
//                     const userSpouse = new User({
//                         memberId: userSpouseId,
//                         title: member.USERSPOUSETITLE || "Mr.",
//                         name: member.USERSPOUSENAME,
//                         dateOfBirth: member.USERSPOUSEDOB ? new Date(member.USERSPOUSEDOB) : null,
//                         relation: userSpouseRelation,
//                         maritalStatus: member.USERMARITALINFO || "Single",
//                         parentUserId: savedMembers.get(member.MEMBERACCNO)?._id || null,
//                         // address: `${member.ADDR2 || ""}, ${member.ADDR3 || ""}`.trim(),
//                         address: member.ADDR1 || "",
//                         address1: member.ADDR2 || "",
//                         address2: member.ADDR3 || "",
//                         city: member.CITYDESCRIPTION || "",
//                         state: member.STATEDESCRIPTION || "",
//                         country: member.COUNTRYDESCRIPTION || "",
//                         pin: member.PIN || "",
//                         email: member.EMAIL1 || "",
//                         mobileNumber: member.PH1 || "",
//                         email2: member.EMAIL2 || "",
//                         mobileNumber2: member.PH2 || "",
//                         otp: null,
//                         age: null,
//                         marriageDate: member.USERMARRIAGEDATE ? new Date(member.USERMARRIAGEDATE) : null,
//                         status: "Active",
//                         activatedDate: Date.now(),
//                         profilePicture: "",
//                         isDeleted: false,
//                         fcmToken: "",
//                         lastLogin: Date.now(),
//                         vehicleNumber: member.VEHICLENO || "",
//                         vehicleModel: member.VEHICLEMAKE || "",
//                         drivingLicenceNumber: "",
//                         uploadProofs: [],
//                         creditStop: false,
//                         creditLimit: 0,
//                     });
//                     await userSpouse.save();
//                 }
//             }
//         }

//         // Delete the uploaded file
//         fs.unlinkSync(filePath);

//         return res.status(200).json({ message: "Members, spouses, users, and user spouses uploaded successfully" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Error uploading members", error: error.message });
//     }
// };

function excelSerialToJSDate(serial) {
    const excelEpoch = new Date(1899, 11, 30); // Excel starts at 1900-01-01, but JavaScript starts at 1899-12-30
    return new Date(excelEpoch.getTime() + serial * 86400000);
}

const uploadMemberData = async (req, res) => {
    try {
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const savedMembers = new Map();

        for (const member of data) {
            let primaryMemberId = member.MEMBERACCNO;
            let primaryMember = await User.findOne({ memberId: primaryMemberId });

            // Primary Member Handling
            if (!primaryMember && member.MEMBERCATEGORY) {
                primaryMember = new User({
                    memberId: primaryMemberId,
                    title: member.MEMBERTITLE || "Mr.",
                    name: member.MEMBERNAME,
                    dateOfBirth: member.MEMBERDOB ? excelSerialToJSDate(member.MEMBERDOB) : null,
                    relation: "Primary",
                    maritalStatus: member.MEMBERMARITALINFO || "Single",
                    address: member.ADDR1 || "",
                    address1: member.ADDR2 || "",
                    address2: member.ADDR3 || "",
                    city: member.CITYDESCRIPTION || "",
                    state: member.STATEDESCRIPTION || "",
                    country: member.COUNTRYDESCRIPTION || "",
                    pin: member.PIN || "",
                    email: member.EMAIL1 || "",
                    mobileNumber: member.PH1 || "",
                    email2: member.EMAIL2 || "",
                    mobileNumber2: member.PH2 || "",
                    status: "Active",
                    activatedDate: Date.now(),
                    lastLogin: Date.now(),
                    vehicleNumber: member.VEHICLENO || "",
                    vehicleModel: member.VEHICLEMAKE || "",
                    uploadProofs: [],
                    creditStop: false,
                    creditLimit: 0,
                });

                primaryMember = await primaryMember.save();
                console.log(`✅ Primary Member Added: ${primaryMemberId}`);
            } else {
                console.log(`⚠️ Skipping existing Primary Member: ${primaryMemberId}`);
            }

            if (primaryMember) {
                savedMembers.set(primaryMemberId, primaryMember);
            }

            // Process Spouse Member
            if (member.MEMBERSPOUSEID && member.MEMBERSPOUSENAME) {
                const spouseId = member.MEMBERSPOUSEID;
                let existingSpouse = await User.findOne({ memberId: spouseId });

                if (!existingSpouse) {
                    const spouseMember = new User({
                        memberId: spouseId,
                        title: member.MEMBERSPOUSETITLE || "Mrs.",
                        name: member.MEMBERSPOUSENAME,
                        dateOfBirth: member.MEMBERSPOUSEDOB ? excelSerialToJSDate(member.MEMBERSPOUSEDOB) : null,
                        relation: "Spouse",
                        maritalStatus: "Married",
                        parentUserId: primaryMember?._id || null,
                        address: member.ADDR1 || "",
                        address1: member.ADDR2 || "",
                        address2: member.ADDR3 || "",
                        city: member.CITYDESCRIPTION || "",
                        state: member.STATEDESCRIPTION || "",
                        country: member.COUNTRYDESCRIPTION || "",
                        pin: member.PIN || "",
                        email: member.EMAIL1 || "",
                        mobileNumber: member.PH1 || "",
                        email2: member.EMAIL2 || "",
                        mobileNumber2: member.PH2 || "",
                        status: "Active",
                        activatedDate: Date.now(),
                        lastLogin: Date.now(),
                        vehicleNumber: member.VEHICLENO || "",
                        vehicleModel: member.VEHICLEMAKE || "",
                        uploadProofs: [],
                        creditStop: false,
                        creditLimit: 0,
                    });

                    await spouseMember.save();
                    console.log(`✅ Spouse Added: ${spouseId}`);
                } else {
                    console.log(`⚠️ Skipping existing Spouse: ${spouseId}`);
                }
            }

            // Process Additional User Members
            if (member.USERID && member.USERNAME) {
                const userId = member.USERID;
                let existingUser = await User.findOne({ memberId: userId });

                const userRelation = member.USERCATEGORY || "Dependent";
                if (!existingUser) {
                    const userMember = new User({
                        memberId: userId,
                        title: member.USERTITLE || "Mr.",
                        name: member.USERNAME,
                        dateOfBirth: member.USERDOB ? excelSerialToJSDate(member.USERDOB) : null,
                        relation: userRelation,
                        parentUserId: primaryMember?._id || null,
                        maritalStatus: member.USERMARITALINFO || "Single",
                        address: member.ADDR1 || "",
                        address1: member.ADDR2 || "",
                        address2: member.ADDR3 || "",
                        city: member.CITYDESCRIPTION || "",
                        state: member.STATEDESCRIPTION || "",
                        country: member.COUNTRYDESCRIPTION || "",
                        pin: member.PIN || "",
                        email: member.EMAIL1 || "",
                        mobileNumber: member.PH1 || "",
                        email2: member.EMAIL2 || "",
                        mobileNumber2: member.PH2 || "",
                        status: "Active",
                        activatedDate: Date.now(),
                        lastLogin: Date.now(),
                        vehicleNumber: member.VEHICLENO || "",
                        vehicleModel: member.VEHICLEMAKE || "",
                        uploadProofs: [],
                        creditStop: false,
                        creditLimit: 0,
                    });

                    await userMember.save();
                    console.log(`✅ Dependent Added: ${userId}`);
                } else {
                    console.log(`⚠️ Skipping existing Dependent: ${userId}`);
                }

                // Process User Spouse
                if (member.USERSPOUSEID && member.USERSPOUSENAME) {
                    const userSpouseId = member.USERSPOUSEID;
                    let existingUserSpouse = await User.findOne({ memberId: userSpouseId });

                    if (!existingUserSpouse) {
                        const userSpouse = new User({
                            memberId: userSpouseId,
                            title: member.USERSPOUSETITLE || "Mr.",
                            name: member.USERSPOUSENAME,
                            dateOfBirth: member.USERSPOUSEDOB ? excelSerialToJSDate(member.USERSPOUSEDOB) : null,
                            relation: `${userRelation} Spouse`,
                            maritalStatus: member.USERMARITALINFO || "Single",
                            parentUserId: primaryMember?._id || null,
                            address: member.ADDR1 || "",
                            address1: member.ADDR2 || "",
                            address2: member.ADDR3 || "",
                            city: member.CITYDESCRIPTION || "",
                            state: member.STATEDESCRIPTION || "",
                            country: member.COUNTRYDESCRIPTION || "",
                            pin: member.PIN || "",
                            email: member.EMAIL1 || "",
                            mobileNumber: member.PH1 || "",
                            email2: member.EMAIL2 || "",
                            mobileNumber2: member.PH2 || "",
                            marriageDate: member.USERMARRIAGEDATE ? excelSerialToJSDate(member.USERMARRIAGEDATE) : null,
                            status: "Active",
                            activatedDate: Date.now(),
                            lastLogin: Date.now(),
                            vehicleNumber: member.VEHICLENO || "",
                            vehicleModel: member.VEHICLEMAKE || "",
                            uploadProofs: [],
                            creditStop: false,
                            creditLimit: 0,
                        });

                        await userSpouse.save();
                        console.log(`✅ Dependent Spouse Added: ${userSpouseId}`);
                    } else {
                        console.log(`⚠️ Skipping existing Dependent Spouse: ${userSpouseId}`);
                    }
                }
            }
        }

        fs.unlinkSync(filePath);

        return res.status(200).json({ message: "Members, spouses, users, and user spouses uploaded successfully" });
    } catch (error) {
        console.error("❌ Error uploading members:", error);
        return res.status(500).json({ message: "Error uploading members", error: error.message });
    }
};




const uploadMemberAddress = async (req, res) => {
    try {
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const updatedMembers = [];

        for (const address of data) {
            try {
                const member = await User.findOne({ memberId: address.ACCNO });
                if (!member) {
                    console.log(`Member with memberId: ${address.ACCNO} not found, skipping.`);
                    continue;
                }

                // Update the member's address and additional contact details
                member.address = address.ADDR1 || member.address;
                member.address1 = address.ADDR2 || member.address1;
                member.address2 = address.ADDR3 || member.address2;
                member.city = address.CITY || member.city;
                member.state = address.STATEDESCRIPTION || member.state;
                member.country = address.COUNTRYDESCRIPTION || member.country;
                member.pin = address.PIN || member.pin;

                // Update additional fields if available
                if (address.PH1 && /^[0-9]{10}$/.test(address.PH1)) {
                    member.mobileNumber = address.PH1;
                }
                if (address.EMAIL1 && /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(address.EMAIL1)) {
                    member.email = address.EMAIL1;
                }

                const updatedMember = await member.save();
                updatedMembers.push(updatedMember);
            } catch (error) {
                console.error(`Error updating memberId: ${address.ACCNO}, skipping.`, error.message);
                continue;
            }
        }
        // Delete the uploaded file
        fs.unlinkSync(filePath);

        return res.status(200).json({ message: "Member addresses and contact details updated successfully", data: updatedMembers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error updating member addresses", error: error.message });
    }
}

// const uploadQrCodeData = async (req, res) => {
//     const updatedMembers = [];
//     let filePath;

//     try {
//         // Ensure the file exists before proceeding
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded" });
//         }

//         filePath = req.file.path;
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         // Process each row of data
//         for (const qrcodeData of data) {
//             try {
//                 const member = await User.findOne({ memberId: qrcodeData.USERID });

//                 // Handle if member is not found
//                 if (!member) {
//                     console.log(`Member with memberId: ${qrcodeData.USERID} not found, skipping.`);
//                     continue;
//                 }

//                 // Update the member's details
//                 const updatedMember = await updateMemberDetails(member, qrcodeData);

//                 // Generate and update the QR Code
//                 const userQRCode = await QRCodeHelper.generateQRCode(updatedMember);
//                 updatedMember.qrCode = userQRCode;

//                 // Save the final updated member data
//                 const finalUpdatedMember = await updatedMember.save();
//                 updatedMembers.push(finalUpdatedMember);

//             } catch (error) {
//                 console.error(`Error processing memberId: ${qrcodeData.USERID}`, error.message);
//                 continue;
//             }
//         }

//         return res.status(200).json({ message: "Member QR code data and contact details updated successfully", data: updatedMembers });

//     } catch (error) {
//         console.error("Error processing file", error);
//         return res.status(500).json({ message: "Error updating member QR code data", error: error.message });

//     } finally {
//         // Clean up the uploaded file after processing
//         if (filePath) {
//             fs.unlinkSync(filePath);
//         }
//     }
// };


// -----------------------------new data
// const BATCH_SIZE = 1000; // Define the batch size (you can adjust this based on performance)

// const uploadQrCodeData = async (req, res) => {
//     const updatedMembers = [];
//     let filePath;
//     let batchStart = 0;

//     try {
//         // Ensure the file exists before proceeding
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded" });
//         }

//         filePath = req.file.path;
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         // Process data in batches
//         const processBatch = async (batchData) => {
//             for (const qrcodeData of batchData) {
//                 try {
//                     const member = await User.findOne({ memberId: qrcodeData.USERID });
//                     if (!member) {
//                         console.log(`Member with memberId: ${qrcodeData.USERID} not found, skipping.`);
//                         continue;
//                     }

//                     // Update the member's details
//                     const updatedMember = await updateMemberDetails(member, qrcodeData);

//                     // Generate and update the QR Code
//                     const userQRCode = await QRCodeHelper.generateQRCode(updatedMember);
//                     updatedMember.qrCode = userQRCode;

//                     // Save the final updated member data
//                     const finalUpdatedMember = await updatedMember.save();
//                     updatedMembers.push(finalUpdatedMember);

//                 } catch (error) {
//                     console.error(`Error processing memberId: ${qrcodeData.USERID}`, error.message);
//                     continue;
//                 }
//             }
//         };

//         // Process the file in batches
//         const totalRows = data.length;
//         while (batchStart < totalRows) {
//             const batchData = data.slice(batchStart, batchStart + BATCH_SIZE); // Get the next batch of data
//             await processBatch(batchData);
//             batchStart += BATCH_SIZE; // Move the batch pointer

//             console.log(`Processed batch from row ${batchStart - BATCH_SIZE + 1} to ${batchStart}`);
//         }

//         return res.status(200).json({
//             message: "Member QR code data and contact details updated successfully",
//             data: updatedMembers,
//         });

//     } catch (error) {
//         console.error("Error processing file", error);
//         return res.status(500).json({
//             message: "Error updating member QR code data",
//             error: error.message,
//         });

//     } finally {
//         // Clean up the uploaded file after processing
//         if (filePath) {
//             fs.unlinkSync(filePath);
//         }
//     }
// };

const BATCH_SIZE = 1000; // Process in smaller batches

const uploadQrCodeData = async (req, res) => {
    let filePath;
    let totalProcessed = 0;

    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`Total Records in File: ${data.length}`);

        // Send immediate response to prevent timeout
        res.status(202).json({
            message: "File uploaded successfully. Processing started in background.",
            totalRows: data.length,
        });

        // Process data in the background
        processFileInBatches(data, filePath);

    } catch (error) {
        console.error("Error processing file:", error);
        return res.status(500).json({
            message: "Error updating QR code data",
            error: error.message,
        });

    }
};

// Process data in the background to prevent request timeout
const processFileInBatches = async (data, filePath) => {
    let batchStart = 0;

    while (batchStart < data.length) {
        const batch = data.slice(batchStart, batchStart + BATCH_SIZE);
        await processBatch(batch);
        batchStart += BATCH_SIZE;
        console.log(`Processed batch ${batchStart}/${data.length}`);
    }

    fs.unlinkSync(filePath); // Remove file after processing
};

// Process a single batch of users
const processBatch = async (batch) => {
    const bulkOperations = [];

    for (const qrcodeData of batch) {
        try {
            const member = await User.findOne({ memberId: qrcodeData.USERID });
            if (!member) {
                console.log(`Skipping member with ID: ${qrcodeData.USERID}, not found.`);
                continue;
            }

            // Update the member details
            const updatedMember = await updateMemberDetails(member, qrcodeData);

            // Generate QR Code
            const userQRCode = await QRCodeHelper.generateQRCode(updatedMember);
            updatedMember.qrCode = userQRCode;

            // Prepare bulk update operation
            bulkOperations.push({
                updateOne: {
                    filter: { _id: updatedMember._id },
                    update: { $set: { qrCode: userQRCode } },
                },
            });

        } catch (error) {
            console.error(`Error processing memberId: ${qrcodeData.USERID}`, error.message);
        }
    }

    // Execute bulk update
    if (bulkOperations.length > 0) {
        await User.bulkWrite(bulkOperations);
        console.log(`Batch Processed: ${bulkOperations.length}`);
    }
};

const updateMemberDetails = async (member, qrcodeData) => {
    // Check if CREATEDDATE exists and is a number (Excel timestamp)
    if (qrcodeData.CREATEDDATE && typeof qrcodeData.CREATEDDATE === 'number') {
        // Convert the Excel serial date to a JavaScript Date object
        const excelDate = qrcodeData.CREATEDDATE;
        const jsDate = new Date((excelDate - 25569) * 86400 * 1000); // Subtract 25569 to adjust from the Excel date system
        member.qrGenratedDate = jsDate;
    } else {
        // Handle case where CREATEDDATE is not a number or is missing
        console.error("Invalid CREATEDDATE format:", qrcodeData.CREATEDDATE);
        member.qrGenratedDate = new Date(); // Fallback to current date
    }

    // Update other fields if available
    member.qrCodeId = qrcodeData.QRID || member.qrCodeId;
    member.cardId = qrcodeData.CARDID || member.cardId;
    member.qrCode = ""

    return await member.save();
};



// Get User Details by userId (MongoDB _id)
const getUserDetailById = async (req, res) => {
    try {
        // Get the userId from request params (admin selects the userId)
        const { userId } = req.params;

        // Find the user by _id (userId is passed as MongoDB _id)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Return the user details as a response
        return res.status(200).json({
            message: "User details fetched successfully",
            user
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({
            message: "Error fetching user details",
            error: error.message
        });
    }
};

// Update QR Code Details (admin updates qrCodeId and generates new QR code)
const updateQrDetails = async (req, res) => {
    try {
        const { userId } = req.params; // userId passed in the request params
        const { qrCodeId } = req.body; // New qrCodeId passed in the request body
        const adminDetails = req.user;

        // Find the user by userId (_id)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if qrCodeId is blank (empty string, null, or undefined)
        if (!qrCodeId || qrCodeId === "") {
            return res.status(400).json({ message: "Please Provide the QR Code" });
        }

        user.qrCodeId = qrCodeId;
        user.qrCode = "";


        // Generate the new QR Code based on the updated user details
        const newQrCode = await QRCodeHelper.generateQRCode(user);

        // Update the qrCode field with the generated QR code
        user.qrCode = newQrCode;

        // Save the updated user document
        const updatedUser = await user.save();

        // Log activity
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        await logUpdateQrCode({
            memberId: updatedUser._id,
            adminId: adminDetails.userId,
            activity: "qrUpdate",
            details: "QR code Update and member details update.",
            ipAddress: req.userIp, // ip,
            userAgent: req.headers["user-agent"],
        })

        return res.status(200).json({
            message: "QR Code details updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating QR Code details:", error);
        return res.status(500).json({
            message: "Error updating QR Code details",
            error: error.message
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
    deleteProofs,
    updateProfilePictureByUser,

    // upload apis
    uploadMemberData,
    uploadMemberAddress,
    uploadQrCodeData,
    getUserDetailById,
    updateQrDetails
};
