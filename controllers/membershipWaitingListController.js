const mongoose = require("mongoose");
// const MembershipWaitingList = require("../models/membershipWaitingList");
const User = require("../models/user");
const { application } = require("express");
const { generatePrimaryMemberId } = require("../utils/common");
const fs = require("fs");
const path = require("path");

const xlsx = require('xlsx');
const MembershipList = require("../models/membershipWaitingList");

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
}

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