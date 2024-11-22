const Offer = require("../models/offers");

// const addOffer = async (req, res) => {
//     try {
//         const {
//             title,
//             description,
//             couponCode,
//             discountPercentage,
//             discountAmount,
//             startDate,
//             endDate,
//             status,
//             type,
//             department,
//             termsAndConditions,
//             showExclusive,
//             discountOffer
//         } = req.body;

//         // Check if the file is uploaded
//         // const bannerImage = req.file ? req.file.path : null;
//         const bannerImagePath = req.file ? `/uploads/offers/${req.file.filename}` : "";
//         // Create a new offer
//         const newOffer = new Offer({
//             title,
//             description,
//             couponCode,
//             discountPercentage,
//             discountAmount,
//             startDate,
//             endDate,
//             status,
//             type,
//             department,
//             bannerImage: bannerImagePath,
//             termsAndConditions,
//             showExclusive,
//             discountOffer
//         });

//         // Save the offer to the database
//         await newOffer.save();

//         res.status(201).json({ message: "Offer added successfully", offer: newOffer });
//     } catch (error) {
//         console.error("Error adding offer:", error);
//         res.status(500).json({ message: "Error adding offer", error: error.message });
//     }
// };

const addOffer = async (req, res) => {
    try {
        const {
            title,
            description,
            couponCode,
            discountPercentage,
            discountAmount,
            startDate,
            endDate,
            status,
            type,
            department,
            termsAndConditions,
            showExclusive,
            discountOffer
        } = req.body;

        // Check if an exclusive offer already exists
        if (showExclusive) {
            const existingExclusiveOffer = await Offer.findOne({ showExclusive: true });
            if (existingExclusiveOffer) {
                return res.status(400).json({
                    message: "An exclusive offer already exists. Only one exclusive offer is allowed."
                });
            }
        }

        const bannerImagePath = req.file ? `/uploads/offers/${req.file.filename}` : "";

        // Create a new offer
        const newOffer = new Offer({
            title,
            description,
            couponCode,
            discountPercentage,
            discountAmount,
            startDate,
            endDate,
            status,
            type,
            department,
            bannerImage: bannerImagePath,
            termsAndConditions,
            showExclusive,
            discountOffer
        });

        // Save the offer to the database
        await newOffer.save();

        res.status(201).json({ message: "Offer added successfully", offer: newOffer });
    } catch (error) {
        console.error("Error adding offer:", error);
        res.status(500).json({ message: "Error adding offer", error: error.message });
    }
};

const updateOffer = async (req, res) => {
    try {
        const { id } = req.params;

        // Build the updates object dynamically
        const updates = {};
        if (req.body.title) updates.title = req.body.title;
        if (req.body.description) updates.description = req.body.description;
        if (req.body.couponCode) updates.couponCode = req.body.couponCode;
        if (req.body.discountPercentage) updates.discountPercentage = req.body.discountPercentage;
        if (req.body.discountAmount) updates.discountAmount = req.body.discountAmount;
        if (req.body.startDate) updates.startDate = req.body.startDate;
        if (req.body.endDate) updates.endDate = req.body.endDate;
        if (req.body.status) updates.status = req.body.status;
        if (req.body.type) updates.type = req.body.type;
        if (req.body.department) updates.department = req.body.department;
        if (req.body.termsAndConditions) updates.termsAndConditions = req.body.termsAndConditions;
        if (req.body.showExclusive !== undefined) updates.showExclusive = req.body.showExclusive; // Boolean check
        if (req.body.discountOffer !== undefined) updates.discountOffer = req.body.discountOffer; // Boolean check
        if (req.file) updates.bannerImage = req.file ? `/uploads/offers/${req.file.filename}` : ""; // Handle uploaded file

        // If updating showExclusive, ensure only one exclusive offer exists
        if (updates.showExclusive) {
            const existingExclusiveOffer = await Offer.findOne({
                showExclusive: true,
                _id: { $ne: id } // Exclude the current offer being updated
            });

            if (existingExclusiveOffer) {
                return res.status(400).json({
                    message: "An exclusive offer already exists. Only one exclusive offer is allowed."
                });
            }
        }

        // Check if updates object is empty
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields provided to update" });
        }

        // Find and update the offer by ID
        const updatedOffer = await Offer.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedOffer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        res.status(200).json({ message: "Offer updated successfully", offer: updatedOffer });
    } catch (error) {
        console.error("Error updating offer:", error);
        res.status(500).json({ message: "Error updating offer", error: error.message });
    }
};


// const updateOffer = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Build the updates object dynamically
//         const updates = {};
//         if (req.body.title) updates.title = req.body.title;
//         if (req.body.description) updates.description = req.body.description;
//         if (req.body.couponCode) updates.couponCode = req.body.couponCode;
//         if (req.body.discountPercentage) updates.discountPercentage = req.body.discountPercentage;
//         if (req.body.discountAmount) updates.discountAmount = req.body.discountAmount;
//         if (req.body.startDate) updates.startDate = req.body.startDate;
//         if (req.body.endDate) updates.endDate = req.body.endDate;
//         if (req.body.status) updates.status = req.body.status;
//         if (req.body.type) updates.type = req.body.type;
//         if (req.body.department) updates.department = req.body.department;
//         if (req.body.termsAndConditions) updates.termsAndConditions = req.body.termsAndConditions;
//         if (req.body.showExclusive !== undefined) updates.showExclusive = req.body.showExclusive; // Boolean check
//         if (req.body.discountOffer !== undefined) updates.discountOffer = req.body.discountOffer; // Boolean check
//         if (req.file) updates.bannerImage = req.file ? `/uploads/offers/${req.file.filename}` : ""; // Handle uploaded file

//         // Check if updates object is empty
//         if (Object.keys(updates).length === 0) {
//             return res.status(400).json({ message: "No valid fields provided to update" });
//         }

//         // Find and update the offer by ID
//         const updatedOffer = await Offer.findByIdAndUpdate(id, updates, { new: true });
//         if (!updatedOffer) {
//             return res.status(404).json({ message: "Offer not found" });
//         }

//         res.status(200).json({ message: "Offer updated successfully", offer: updatedOffer });
//     } catch (error) {
//         console.error("Error updating offer:", error);
//         res.status(500).json({ message: "Error updating offer", error: error.message });
//     }
// };

// Get all offers
const getAllOffers = async (req, res) => {
    try {
        // Fetch all offers
        const offerDetails = await Offer.find({});
        const offers = offerDetails.reverse();
        res.status(200).json({ message: "Offers retrieved successfully", offers });
    } catch (error) {
        console.error("Error retrieving offers:", error);
        res.status(500).json({ message: "Error retrieving offers", error: error.message });
    }
};

// Get offer by ID
const getOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Please Provide valid id" });
        }
        // Find the offer by ID
        const offer = await Offer.findById(id);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        res.status(200).json({ message: "Offer retrieved successfully", offer });
    } catch (error) {
        console.error("Error retrieving offer by ID:", error);
        res.status(500).json({ message: "Error retrieving offer by ID", error: error.message });
    }
};

// Delete an offer
const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Please Provide valid id" });
        }
        // Find and delete the offer by ID
        const deletedOffer = await Offer.findByIdAndDelete(id);
        if (!deletedOffer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        res.status(200).json({ message: "Offer deleted successfully" });
    } catch (error) {
        console.error("Error deleting offer:", error);
        res.status(500).json({ message: "Error deleting offer", error: error.message });
    }
};

const getActiveOffers = async (req, res) => {
    try {
        // Extract query parameters
        const { type } = req.query;

        // Build the query object
        const query = { status: "Active" }; // Only include active offers
        if (type) {
            query.type = type; // Add type filter if provided (e.g., New or Current)
        }

        // Fetch offers based on the query
        const offers = await Offer.find(query).sort({ createdAt: -1 }); // Sort by newest first

        if (offers.length === 0) {
            return res.status(404).json({ message: "No active offers found" });
        }

        res.status(200).json({
            message: "Active offers retrieved successfully",
            offers,
        });
    } catch (error) {
        console.error("Error retrieving active offers:", error);
        res.status(500).json({
            message: "Error retrieving active offers",
            error: error.message,
        });
    }
};


module.exports = {
    addOffer,
    updateOffer,
    getAllOffers,
    getOfferById,
    deleteOffer,
    getActiveOffers
}