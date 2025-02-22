const AffiliateClub = require("../models/affiliatedClub");
const xlsx = require('xlsx');
const fs = require('fs');

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

// API to upload Excel file and populate database
const addAffiliatedClub = async (req, res) => {
    try {
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const clubs = data.map(row => ({
            affiliateClubNo: row['AFFILIATECLUBNO'],
            name: row['NAME'],
            email: row['EMAIL'] || "",
            faxNumber: row['FAXNUMBER'] || "",
            phoneNumber1: row['PHONENUMBER1'] || "",
            phoneNumber2: row['PHONENUMBER2'] || "",
            // affiliateDate: row['AFFILIATEDATE'] ? new Date(row['AFFILIATEDATE']) : null,
            // deaffiliateDate: row['DEAFFILIATEDATE'] ? new Date(row['DEAFFILIATEDATE']) : null,
            affiliateDate: parseExcelDate(row['AFFILIATEDATE']),
            deaffiliateDate: parseExcelDate(row['DEAFFILIATEDATE']),
            cityOther: row['CITYOTHER'] || "",
            addr1: row['ADDR1'] || "",
            addr2: row['ADDR2'] || "",
            addr3: row['ADDR3'] || "",
            cityDescription: row['CITYDESCRIPTION'] || "",
            pin: row['PIN'] || "",
            stateDescription: row['STATEDESCRIPTION'] || "",
            countryDescription: row['COUNTRYDESCRIPTION'] || "",
        }));

        // Delete all existing clubs
        await AffiliateClub.deleteMany({});

        // Insert new clubs
        await AffiliateClub.insertMany(clubs);

        // Delete the uploaded file
        fs.unlinkSync(filePath);
        return res.status(201).send({ message: 'File processed and data saved successfully' });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};


// // API to get all affiliated clubs
// const getAllAffiliatedClubs = async (req, res) => {
//     try {
//         const { countryDescription } = req.query;

//         let filter = { isDeleted: false };

//         // Add countryDescription to filter if provided
//         if (countryDescription) {
//             filter.countryDescription = countryDescription;
//         }
//         const clubs = await AffiliateClub.find(filter);
//         return res.status(200).send({ message: "All Affilieated Clubs", clubs });
//     } catch (error) {
//         return res.status(500).send({ error: error.message });
//     }
// };
const getAllAffiliatedClubs = async (req, res) => {
    try {
        let { countryDescription, stateDescription, page, limit } = req.query;

        // Convert query parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let filter = { isDeleted: false };

        // Add countryDescription to filter if provided
        if (countryDescription) {
            filter.countryDescription = countryDescription;
        }
        // Add countryDescription to filter if provided
        if (stateDescription) {
            filter.stateDescription = stateDescription;
        }

        // Get total count of matching clubs
        const totalClubs = await AffiliateClub.countDocuments(filter);
        const totalPages = Math.ceil(totalClubs / limit);

        // Fetch paginated affiliated clubs
        const clubs = await AffiliateClub.find(filter)
            .sort({ affiliateClubNo: 1 }) // Sorting by newest first
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            message: "All Affiliated Clubs",
            clubs,
            pagination: {
                currentPage: page,
                totalPages,
                totalClubs,
                pageSize: limit,
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error while fetching affiliated clubs.", error: error.message });
    }
};


// API to get affiliated club by ID
const getAffiliatedClubById = async (req, res) => {
    try {
        const { id } = req.params;
        const club = await AffiliateClub.findById(id);
        if (!club || club.isDeleted) {
            return res.status(404).send({ message: 'Club not found' });
        }
        return res.status(200).send({ message: "Fetch Affilieated Clubs Details", club });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// API to delete an affiliated club by ID
const deleteAffiliatedClub = async (req, res) => {
    try {
        const { id } = req.params;
        const club = await AffiliateClub.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!club) {
            return res.status(404).send({ message: 'Club not found' });
        }
        return res.status(200).send({ message: 'Club deleted successfully', club });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// API to update specific fields of an affiliated club by ID
const updateAffiliatedClub = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};

        const allowedFields = [
            'affiliateClubNo', 'name', 'email', 'faxNumber', 'phoneNumber1',
            'phoneNumber2', 'affiliateDate', 'deaffiliateDate', 'cityOther',
            'addr1', 'addr2', 'addr3', 'cityDescription', 'pin', 'stateDescription',
            'countryDescription'
        ];

        // Dynamically check and add fields to updates object
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const club = await AffiliateClub.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!club) {
            return res.status(404).send({ message: 'Club not found' });
        }

        return res.status(200).send({ message: 'Club updated successfully', club });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};


// API to get all affiliated clubs
const getAffiliatedClubs = async (req, res) => {
    try {
        const { countryDescription, page = 1, limit = 10 } = req.query;

        let filter = { isDeleted: false };

        // Add countryDescription to filter if provided
        if (countryDescription) {
            filter.countryDescription = countryDescription;
        }

        // Parse pagination parameters
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;

        const clubs = await AffiliateClub.find(filter)
            .skip(skip)
            .limit(pageSize);

        const totalClubs = await AffiliateClub.countDocuments(filter)
            .sort({ affiliateClubNo: 1 }); // Sorting by newest first

        return res.status(200).send({
            message: "All Affiliated Clubs",
            clubs,
            pagination: {
                total: totalClubs,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(totalClubs / pageSize),
            },
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};


module.exports = {
    addAffiliatedClub,
    getAllAffiliatedClubs,
    getAffiliatedClubById,
    deleteAffiliatedClub,
    updateAffiliatedClub,
    getAffiliatedClubs
}