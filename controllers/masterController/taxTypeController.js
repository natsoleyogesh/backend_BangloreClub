const TaxType = require("../../models/taxType");
const { toTitleCase } = require("../../utils/common");

// Create a new tax type
const createTaxType = async (req, res) => {
    try {
        const { name, percentage, status } = req.body;
        const normalizedName = toTitleCase(name);
        // Check if the tax type already exists
        const existingTaxType = await TaxType.findOne({ name: normalizedName, isDeleted: false }).exec();
        if (existingTaxType) {
            return res.status(400).json({ message: 'Tax type already exists.' });
        }

        // Create and save the new tax type
        const taxType = new TaxType({ name, percentage, status });
        await taxType.save();

        return res.status(201).json({
            message: 'Tax type created successfully',
            data: taxType
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get all tax types (excluding soft deleted ones)
const getAllTaxTypes = async (req, res) => {
    try {
        // Fetch all tax types that are not marked as deleted, sorted by `createdAt` in descending order
        const taxTypes = await TaxType.find({ isDeleted: false }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Tax types fetched successfully',
            data: taxTypes
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get tax type by ID
const getTaxTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const taxType = await TaxType.findById(id);

        if (!taxType) {
            return res.status(404).json({ message: 'Tax type not found.' });
        }

        return res.status(200).json({
            message: 'Tax type fetched successfully',
            data: taxType
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Update tax type by ID
const updateTaxType = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, percentage, status } = req.body;

        const updateData = {};
        if (name) {
            name = toTitleCase(name);

            // Check if a category with the same name (case-insensitive) already exists (excluding current category)
            const existingAmenities = await TaxType.findOne({
                name,
                _id: { $ne: id }, // Exclude the current category
                isDeleted: false // Check only non-deleted categories
            });

            if (existingAmenities) {
                return res.status(400).json({ message: 'tax type with this name already exists.' });
            }

            // Add normalized name to updates
            updateData.name = name;
        }
        if (status) {
            updateData.status = status
        }
        if (percentage) {
            updateData.percentage = percentage
        }

        const updatedTaxType = await TaxType.findByIdAndUpdate(
            id,
            { name, percentage, status },
            { new: true }  // Return the updated document
        );

        if (!updatedTaxType) {
            return res.status(404).json({ message: 'Tax type not found.' });
        }

        return res.status(200).json({
            message: 'Tax type updated successfully',
            data: updatedTaxType
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Soft delete tax type by ID
const deleteTaxType = async (req, res) => {
    try {
        const { id } = req.params;

        const taxType = await TaxType.findById(id);

        if (!taxType) {
            return res.status(404).json({ message: 'Tax type not found.' });
        }

        // Mark the tax type as deleted (soft delete)
        taxType.isDeleted = true;
        await taxType.save();

        return res.status(200).json({
            message: 'Tax type deleted successfully'
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get all active tax types (excluding soft deleted ones)
const getActiveTaxTypes = async (req, res) => {
    try {
        const activeTaxTypes = await TaxType.find({ status: 'active', isDeleted: false })
            .sort({ createdAt: -1 }); // Sort by creation date in descending order
        return res.status(200).json({
            message: 'Active tax types fetched successfully',
            data: activeTaxTypes
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

module.exports = {
    createTaxType,
    getAllTaxTypes,
    getTaxTypeById,
    updateTaxType,
    deleteTaxType,
    getActiveTaxTypes
};
