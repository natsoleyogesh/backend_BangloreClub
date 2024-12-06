const Amenities = require("../../models/amenities");
const { ICONupload } = require("../../utils/upload");

// Create a new amenity with an uploaded icon file
const createAmenity = async (req, res) => {
    ICONupload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { name, status } = req.body;

            // Ensure the icon file was uploaded
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Store the file path in the database
            const newAmenity = new Amenities({
                name,
                icon: `/uploads/icons/${req.file.filename}`, // Store relative file path
                status
            });

            await newAmenity.save();

            return res.status(201).json({
                message: 'Amenity created successfully',
                data: newAmenity
            });
        } catch (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }
    });
};

// Get all amenities (excluding soft deleted ones)
const getAllAmenities = async (req, res) => {
    try {
        const amenities = await Amenities.find({ isDeleted: false }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Amenities fetched successfully',
            data: amenities
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get amenity by ID
const getAmenityById = async (req, res) => {
    try {
        const { id } = req.params;
        const amenity = await Amenities.findById(id);

        if (!amenity) {
            return res.status(404).json({ message: 'Amenity not found.' });
        }

        return res.status(200).json({
            message: 'Amenity fetched successfully',
            data: amenity
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Update amenity by ID
const updateAmenity = async (req, res) => {
    ICONupload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { id } = req.params;
            const { name, status } = req.body;

            const updateData = {
                name,
                status,
            };

            // If a new icon file is uploaded, update the file path
            if (req.file) {
                updateData.icon = `/uploads/icons/${req.file.filename}`;
            }

            const updatedAmenity = await Amenities.findByIdAndUpdate(
                id,
                updateData,
                { new: true }  // Return the updated document
            );

            if (!updatedAmenity) {
                return res.status(404).json({ message: 'Amenity not found.' });
            }

            return res.status(200).json({
                message: 'Amenity updated successfully',
                data: updatedAmenity
            });
        } catch (err) {
            return res.status(500).json({ message: 'Server error', error: err });
        }
    });
};

// Soft delete amenity by ID
const deleteAmenity = async (req, res) => {
    try {
        const { id } = req.params;

        const amenity = await Amenities.findById(id);

        if (!amenity) {
            return res.status(404).json({ message: 'Amenity not found.' });
        }

        // Mark the amenity as deleted (soft delete)
        amenity.isDeleted = true;
        await amenity.save();

        return res.status(200).json({
            message: 'Amenity deleted successfully'
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get all active amenities (excluding soft deleted ones)
const getActiveAmenities = async (req, res) => {
    try {
        const activeAmenities = await Amenities.find({ status: 'active', isDeleted: false })
            .sort({ createdAt: -1 }); // Sort by creation date in descending order

        return res.status(200).json({
            message: 'Active amenities fetched successfully',
            data: activeAmenities
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

module.exports = {
    createAmenity,
    getAllAmenities,
    getAmenityById,
    updateAmenity,
    deleteAmenity,
    getActiveAmenities
};
