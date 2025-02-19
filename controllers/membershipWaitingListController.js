const mongoose = require("mongoose");
// const MembershipWaitingList = require("../models/membershipWaitingList");
const User = require("../models/user");
const { application } = require("express");
const { generatePrimaryMemberId } = require("../utils/common");
const fs = require("fs");
const path = require("path");

const xlsx = require('xlsx');
const MembershipList = require("../models/membershipWaitingList");


// const addWaiting = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             mobileNumber,
//             relation,
//             age,
//             sponsoredBy, // Array of sponsor IDs
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

//         // Find the highest existing applicationId
//         const lastApplication = await MembershipWaitingList.findOne()
//             .sort({ applicationId: -1 }) // Sort in descending order of applicationId
//             .exec();

//         let nextApplicationId = "01"; // Default ID if no records exist
//         if (lastApplication && lastApplication.applicationId) {
//             // Increment the last applicationId
//             const lastId = parseInt(lastApplication.applicationId, 10);
//             nextApplicationId = String(lastId + 1).padStart(2, "0");
//         }

//         // Profile picture handling
//         const profilePicturePath = req.file
//             ? `/uploads/profilePictures/${req.file.filename}`
//             : "";

//         // Validate sponsors if provided
//         if (sponsoredBy && sponsoredBy.length > 0) {
//             for (const sponsorId of sponsoredBy) {
//                 const sponsor = await User.findById(sponsorId);
//                 if (!sponsor) {
//                     return res.status(404).json({ message: `Sponsor with ID ${sponsorId} not found.` });
//                 }
//             }
//         }

//         // Create a new application
//         const newApplication = new MembershipWaitingList({
//             name,
//             email,
//             mobileNumber,
//             applicationId: nextApplicationId,
//             applicationStatus: "Pending", // Default status
//             relation,
//             age,
//             sponsoredBy,
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
//             profilePicture: profilePicturePath,
//         });

//         const savedApplication = await newApplication.save();
//         res.status(201).json({
//             message: "Membership application added successfully",
//             application: savedApplication,
//         });
//     } catch (error) {
//         console.error("Error in adding membership application:", error);
//         res.status(400).json({
//             message: "Error in adding membership application",
//             error: error.message,
//         });
//     }
// };

// working code------------------------------------------------------------------------------------
// const addWaiting = async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             mobileNumber,
//             relation,
//             sponsoredBy, // Array of sponsor IDs (as a string)
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

//         // Parse sponsoredBy if it is a stringified JSON array
//         let validSponsoredBy = [];
//         if (sponsoredBy) {
//             try {
//                 const parsedSponsoredBy = typeof sponsoredBy === "string" ? JSON.parse(sponsoredBy) : sponsoredBy;

//                 // Validate each sponsor ID
//                 validSponsoredBy = parsedSponsoredBy.filter((id) =>
//                     mongoose.Types.ObjectId.isValid(id)
//                 );

//                 if (validSponsoredBy.length !== parsedSponsoredBy.length) {
//                     return res.status(400).json({
//                         message: "One or more sponsor IDs are invalid.",
//                     });
//                 }

//                 // Verify sponsors exist in the database
//                 for (const sponsorId of validSponsoredBy) {
//                     const sponsor = await User.findById(sponsorId);
//                     if (!sponsor) {
//                         return res.status(404).json({
//                             message: `Sponsor with ID ${sponsorId} not found.`,
//                         });
//                     }
//                 }
//             } catch (parseError) {
//                 return res.status(400).json({
//                     message: "Invalid format for sponsor IDs.",
//                 });
//             }
//         }

//         // Find the highest existing applicationId
//         const lastApplication = await MembershipWaitingList.findOne()
//             .sort({ applicationId: -1 }) // Sort in descending order of applicationId
//             .exec();

//         let nextApplicationId = "01"; // Default ID if no records exist
//         if (lastApplication && lastApplication.applicationId) {
//             // Increment the last applicationId
//             const lastId = parseInt(lastApplication.applicationId, 10);
//             nextApplicationId = String(lastId + 1).padStart(2, "0");
//         }

//         // Profile picture handling
//         const profilePicturePath = req.file
//             ? `/uploads/profilePictures/${req.file.filename}`
//             : "";

//         // Create a new application
//         const newApplication = new MembershipWaitingList({
//             name,
//             email,
//             mobileNumber,
//             applicationId: nextApplicationId,
//             applicationStatus: "Pending", // Default status
//             relation,
//             sponsoredBy: validSponsoredBy,
//             address,
//             address1,
//             address2,
//             city,
//             state, // Save the state as-is
//             country,
//             pin,
//             dateOfBirth,
//             maritalStatus,
//             marriageDate,
//             title,
//             profilePicture: profilePicturePath,
//         });

//         const savedApplication = await newApplication.save();
//         res.status(201).json({
//             message: "Membership application added successfully",
//             application: savedApplication,
//         });
//     } catch (error) {
//         console.error("Error in adding membership application:", error);
//         res.status(400).json({
//             message: "Error in adding membership application",
//             error: error.message,
//         });
//     }
// };



// const getAllApplications = async (req, res) => {
//     try {
//         // Fetch all applications with sponsor details populated
//         const applications = await MembershipWaitingList.find().populate(
//             "sponsoredBy",
//             // "name email mobileNumber" // Populate only specific sponsor fields
//         ).sort({ createdAt: -1 });
//         res.status(200).json({
//             message: "Membership Waiting Lists Fetch successfully",
//             applications,
//         });
//     } catch (error) {
//         console.error("Error in fetching applications:", error);
//         res.status(500).json({
//             message: "Failed to fetch membership applications",
//             error: error.message,
//         });
//     }
// };

// const getApplicationById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Find application by ID and populate sponsor details
//         const application = await MembershipWaitingList.findById(id).populate(
//             "sponsoredBy",
//         );

//         if (!application) {
//             return res.status(404).json({
//                 message: "Membership application not found",
//             });
//         }

//         res.status(200).json({
//             message: "Membership Waiting List Details Fetch successfully",
//             application,
//         });
//     } catch (error) {
//         console.error("Error in fetching application by ID:", error);
//         res.status(500).json({
//             message: "Failed to fetch membership application",
//             error: error.message,
//         });
//     }
// };


// const deleteApplicationById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Find and delete the application
//         const deletedApplication = await MembershipWaitingList.findByIdAndDelete(id);

//         if (!deletedApplication) {
//             return res.status(404).json({
//                 message: "Membership application not found",
//             });
//         }

//         res.status(200).json({
//             message: "Membership application deleted successfully",
//         });
//     } catch (error) {
//         console.error("Error in deleting application:", error);
//         res.status(500).json({
//             message: "Failed to delete membership application",
//             error: error.message,
//         });
//     }
// };

// const updateApplicationById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Construct the update object dynamically
//         const updateFields = {};
//         for (const key in req.body) {
//             if (req.body[key] !== undefined) {
//                 updateFields[key] = req.body[key];
//             }
//         }

//         // Find and update the application
//         const updatedApplication = await MembershipWaitingList.findByIdAndUpdate(
//             id,
//             updateFields,
//             { new: true, runValidators: true } // Return updated document and validate input
//         ).populate("sponsoredBy");

//         if (!updatedApplication) {
//             return res.status(404).json({
//                 message: "Membership application not found",
//             });
//         }

//         res.status(200).json({
//             message: "Membership application updated successfully",
//             data: updatedApplication,
//         });
//     } catch (error) {
//         console.error("Error in updating application:", error);
//         res.status(400).json({
//             message: "Failed to update membership application",
//             error: error.message,
//         });
//     }
// };

// const updateProfilePicture = async (req, res) => {
//     try {
//         const { id } = req.params; // Get application ID from route params

//         // Check if a file was uploaded
//         if (!req.file) {
//             return res.status(400).json({ message: "No image file provided." });
//         }

//         // Find the membership application by ID
//         const application = await MembershipWaitingList.findById(id);
//         if (!application) {
//             return res.status(404).json({ message: "Membership application not found." });
//         }

//         // Store the new profile picture path
//         const newProfilePicturePath = `/uploads/profilePictures/${req.file.filename}`;

//         // Optional: Delete the old profile picture if it exists
//         if (application.profilePicture && application.profilePicture !== "") {
//             const oldProfilePicturePath = path.join(__dirname, "..", application.profilePicture);
//             if (fs.existsSync(oldProfilePicturePath)) {
//                 try {
//                     fs.unlinkSync(oldProfilePicturePath); // Delete old file
//                 } catch (err) {
//                     console.error("Error deleting old profile picture:", err);
//                 }
//             }
//         }

//         // Update the profile picture in the database
//         application.profilePicture = newProfilePicturePath;
//         await application.save();

//         res.status(200).json({
//             message: "Profile picture updated successfully.",
//             profilePicture: newProfilePicturePath,
//         });
//     } catch (error) {
//         console.error("Error updating profile picture:", error);
//         res.status(500).json({
//             message: "Error updating profile picture.",
//             error: error.message,
//         });
//     }
// };

// const getActiveApplications = async (req, res) => {
//     try {
//         const { page = 1, limit = 5 } = req.query;

//         // Convert query parameters to integers
//         const pageNumber = parseInt(page, 10) || 1;
//         const limitNumber = parseInt(limit, 10) || 5;
//         const skip = (pageNumber - 1) * limitNumber;

//         // Fetch active Food and Beverage categories
//         const activeApplications = await MembershipWaitingList.find({ applicationStatus: "Pending", status: "Active" })
//             .populate("sponsoredBy")
//             .sort({ createdAt: -1 }) // Sort by creation date (newest first)
//             .skip(skip)
//             .limit(limitNumber);

//         // Count total active categories for pagination
//         const totalItems = await MembershipWaitingList.countDocuments({ applicationStatus: "Pending", status: "Active" });

//         // Prepare the response
//         res.status(200).json({
//             message: "Active Applications fetched successfully.",
//             applications: activeApplications,
//             pagination: {
//                 totalItems,
//                 currentPage: pageNumber,
//                 totalPages: Math.ceil(totalItems / limitNumber),
//                 limit: limitNumber,
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching active Application:", error);
//         res.status(500).json({
//             message: "Failed to fetch active Application.",
//             error: error.message,
//         });
//     }
// };

// // Function to update application status and handle approval/rejection
// const updateApplicationStatus = async (req, res) => {
//     try {
//         const { requestId, status } = req.body; // Extract applicationId and status from the request body

//         // Step 1: Find the application in the waiting list by its applicationId
//         // const application = await MembershipWaitingList.findOne({ applicationId });
//         const application = await MembershipWaitingList.findById(requestId);

//         if (!application) {
//             return res.status(404).json({ message: "Application not found." });
//         }

//         // Step 2: Handle application status change based on the requested status
//         if (status === "Approved") {
//             // Step 3: If status is 'Approved', create the user and change status to 'Approved'

//             // Check if the application is already approved
//             if (application.applicationStatus === "Approved") {
//                 return res.status(400).json({ message: "This application is already approved." });
//             }

//             // Create the user based on the application details (similar to your createUser function)
//             const {
//                 name,
//                 email,
//                 mobileNumber,
//                 relation,
//                 parentUserId,
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
//             } = application;

//             const profilePicturePath = application.profilePicture || ""; // Use the profile picture from the application

//             // Determine if this is a primary user or a family member
//             if (!parentUserId) {
//                 // Create a primary user
//                 const memberId = await generatePrimaryMemberId(); // Assuming this is a function to generate a member ID
//                 const newUser = new User({
//                     name,
//                     email,
//                     mobileNumber,
//                     memberId,
//                     relation: "Primary", // Set the relation to 'Primary'
//                     address,
//                     address1,
//                     address2,
//                     city,
//                     state,
//                     country,
//                     pin,
//                     dateOfBirth,
//                     maritalStatus,
//                     marriageDate,
//                     title,
//                     profilePicture: profilePicturePath,
//                     lastLogin: Date.now(),
//                 });

//                 const savedUser = await newUser.save();

//                 // Update the application status to 'Approved'
//                 application.applicationStatus = "Approved";
//                 await application.save();

//                 return res.status(201).json({
//                     message: "Primary user created and application approved successfully.",
//                     user: savedUser,
//                 });
//             }

//             // If it's a family member, handle similarly
//             const parentUser = await User.findById(parentUserId);
//             if (!parentUser) {
//                 return res.status(404).json({ message: "Parent user not found." });
//             }

//             // Validate relationship rules
//             const existingRelations = await User.find({ parentUserId });
//             if (relation === "Spouse" && existingRelations.some((member) => member.relation === "Spouse")) {
//                 return res.status(400).json({ message: "Only one spouse can be added per user." });
//             }


//             const memberId = await generateFamilyMemberId(parentUser.memberId, existingRelations.length);

//             const familyMember = new User({
//                 name,
//                 email,
//                 mobileNumber,
//                 memberId,
//                 relation,
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
//                 parentUserId: parentUser._id,
//                 profilePicture: profilePicturePath,
//             });

//             const savedFamilyMember = await familyMember.save();

//             // Update the application status to 'Approved'
//             application.applicationStatus = "Approved";
//             await application.save();

//             return res.status(201).json({
//                 message: "Family member added successfully and application approved.",
//                 user: savedFamilyMember,
//             });
//         }

//         // If status is 'Rejected', simply update the application status and return a message
//         if (status === "Rejected") {
//             // Check if the application is already rejected
//             if (application.applicationStatus === "Rejected") {
//                 return res.status(400).json({ message: "This application is already rejected." });
//             }

//             application.applicationStatus = "Rejected"; // Set the status to 'Rejected'
//             await application.save();

//             return res.status(200).json({
//                 message: "Application rejected successfully.",
//             });
//         }

//         // If status is invalid, return an error
//         return res.status(400).json({ message: "Invalid status. Please provide either 'Approved' or 'Rejected'." });
//     } catch (error) {
//         console.error("Error updating application status:", error);
//         return res.status(500).json({
//             message: "Error updating application status.",
//             error: error.message,
//         });
//     }
// };

//working code--------------------------------------------------------------------------------------------


// Helper function to parse dates from Excel
const parseExcelDate = (excelDate) => {
    if (!excelDate) return null;
    if (typeof excelDate === 'string') {
        return new Date(excelDate);
    }
    const days = Math.floor(excelDate);
    const date = new Date((days - 25569) * 86400 * 1000); // Excel epoch to JS date
    return date;
};

const addWaiting = async (req, res) => {
    try {
        // Validate file presence
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = req.file.path;

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Remove all old data before uploading the new list
        await MembershipList.deleteMany({});

        // Process and save data to MongoDB
        const bulkOps = data.map(row => {
            // Extract proposer details
            const proposer = {
                name: row["PROPOSER"],
                accountNumber: row["A/C NO"],
            };

            // Extract all seconder data dynamically
            const seconders = [];
            Object.keys(row).forEach(key => {
                if (/^SECONDER-\d+$/.test(key)) {
                    const seconderIndex = key.split("-")[1];
                    const seconderName = row[`SECONDER-${seconderIndex}`];
                    const seconderAccount = row[`A/C NO_${seconderIndex}`];

                    if (seconderName && seconderAccount) {
                        seconders.push({
                            name: seconderName,
                            accountNumber: seconderAccount,
                        });
                    }
                }
            });

            // Filter out invalid seconder entries
            const validSeconders = seconders.filter(seconder => seconder.name && seconder.accountNumber);

            return {
                updateOne: {
                    filter: { applicationNumber: row["APPLCN_NO."] },
                    update: {
                        $set: {
                            applicationNumber: row["APPLCN_NO."],
                            applicationDate: parseExcelDate(row["APPLCN_DATE"]),
                            applicantName: row["APPLICANT'S NAME"],
                            proposer: proposer,
                            seconders: validSeconders,
                        },
                    },
                    upsert: true,
                },
            };
        });

        await MembershipList.bulkWrite(bulkOps);

        // Delete the uploaded file
        fs.unlinkSync(filePath);

        return res.status(200).json({ message: "Data uploaded successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
    // try {
    //     // Validate file presence
    //     if (!req.file) {
    //         return res.status(400).json({ message: "No file uploaded" });
    //     }
    //     const filePath = req.file.path;
    //     // Read the uploaded Excel file
    //     const workbook = xlsx.readFile(req.file.path);
    //     const sheetName = workbook.SheetNames[0];
    //     const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    //     // Remove all old data before uploading the new list
    //     await MembershipList.deleteMany({});

    //     // Process and save data to MongoDB
    //     const bulkOps = data.map(row => {
    //         // Extract proposer details
    //         const proposer = {
    //             name: row["PROPOSER"],
    //             accountNumber: row["A/C NO"],
    //         };

    //         // Extract all seconder data dynamically
    //         const seconders = [];
    //         Object.keys(row).forEach(key => {
    //             if (key.startsWith("SECONDER") && key.includes("A/C NO")) {
    //                 const seconderIndex = key.split("A/C NO")[1];
    //                 const seconderNameKey = `SECONDER-${seconderIndex}`;
    //                 seconders.push({
    //                     name: row[seconderNameKey],
    //                     accountNumber: row[key],
    //                 });
    //             }
    //         });

    //         // Filter out invalid seconder entries
    //         const validSeconders = seconders.filter(seconder => seconder.name && seconder.accountNumber);

    //         return {
    //             updateOne: {
    //                 filter: { applicationNumber: row["APPLCN_NO."] },
    //                 update: {
    //                     $set: {
    //                         applicationNumber: row["APPLCN_NO."],
    //                         applicationDate: new Date(row["APPLCN_DATE"]),
    //                         applicantName: row["APPLICANT'S NAME"],
    //                         proposer: proposer,
    //                         seconders: validSeconders,
    //                     },
    //                 },
    //                 upsert: true,
    //             },
    //         };
    //     });

    //     await MembershipList.bulkWrite(bulkOps);

    //     // Delete the uploaded file
    //     fs.unlinkSync(filePath);

    //     return res.status(200).json({ message: "Data uploaded successfully" });
    // } catch (error) {
    //     console.error(error);
    //     return res.status(500).json({ message: "An error occurred", error: error.message });
    // }
}



// const getAllApplications = async (req, res) => {
//     try {
//         const { search } = req.query;

//         // Build the search query
//         const searchQuery = search
//             ? {
//                 $or: [
//                     { applicantName: { $regex: search, $options: "i" } },
//                     { "proposer.name": { $regex: search, $options: "i" } },
//                     { "proposer.accountNumber": { $regex: search, $options: "i" } },
//                     { "seconders.name": { $regex: search, $options: "i" } },
//                     { "seconders.accountNumber": { $regex: search, $options: "i" } },
//                     { applicationNumber: { $regex: search, $options: "i" } },
//                 ],
//             }
//             : {};

//         // Fetch matching entries from the database
//         const results = await MembershipList.find(searchQuery).lean();

//         // Format the response ensuring seconders remain an array
//         const formattedResults = results.map(entry => ({
//             ...entry,
//             seconders: Array.isArray(entry.seconders) ? entry.seconders : [], // Ensure seconders is an array
//         }));

//         res.status(200).json(formattedResults);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "An error occurred", error: error.message });
//     }
// };

const getAllApplications = async (req, res) => {
    try {
        let { search, page, limit } = req.query;

        // Convert pagination parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Build the search query
        const searchQuery = search
            ? {
                $or: [
                    { applicantName: { $regex: search, $options: "i" } },
                    { "proposer.name": { $regex: search, $options: "i" } },
                    { "proposer.accountNumber": { $regex: search, $options: "i" } },
                    { "seconders.name": { $regex: search, $options: "i" } },
                    { "seconders.accountNumber": { $regex: search, $options: "i" } },
                    { applicationNumber: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        // Get total count of applications
        const totalApplications = await MembershipList.countDocuments(searchQuery);

        // Fetch paginated applications
        const results = await MembershipList.find(searchQuery)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit)
            .lean();

        // Format the response ensuring seconders remain an array
        const formattedResults = results.map(entry => ({
            ...entry,
            seconders: Array.isArray(entry.seconders) ? entry.seconders : [], // Ensure seconders is an array
        }));

        res.status(200).json({
            message: "Applications fetched successfully",
            applications: formattedResults,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalApplications / limit),
                totalApplications,
                pageSize: limit,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};



module.exports = {
    addWaiting,
    getAllApplications,
    // getApplicationById,
    // deleteApplicationById,
    // updateApplicationById,
    // updateProfilePicture,
    // getActiveApplications,
    // updateApplicationStatus
}