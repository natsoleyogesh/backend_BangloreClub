const Category = require("../models/category");


const addCategory = async (req, res) => {
    try {
        const { name, code, description, isActive } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name, code, isActive });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists.' });
        }

        const newCategory = new Category({
            name,
            code,
            description,
            isActive,
        });

        await newCategory.save();
        res.status(201).json({ message: 'Category created successfully.', category: newCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating category.' });
    }
}

const getAllCategory = async (req, res) => {
    try {
        const { isActive } = req.query;

        // Build query based on isActive if provided
        let query = {};
        if (isActive !== undefined) {
            // Directly convert the isActive string to a boolean
            query.isActive = isActive === 'true'; // Expecting 'true' or 'false' string in query
        }

        const categories = (await Category.find(query)).reverse();
        res.status(200).json({ message: 'Categories fetched successfully.', categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching categories.' });
    }
}


const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Please Provide The Id.' });
        }
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category fetch successfully.', category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching category.' });
    }
}

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Filter the updates to include only the fields provided in the request body
        const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
            if (updates[key] !== undefined) {
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        // Update the category with the filtered updates
        const updatedCategory = await Category.findByIdAndUpdate(id, filteredUpdates, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation rules are applied
        });

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.json({ message: 'Category updated successfully.', category: updatedCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating category.' });
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Please Provide The Id.' });
        }
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category Delete successfully.', deletedCategory });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting category.' });
    }
}

module.exports = {
    addCategory,
    getAllCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
}