const FoodAndBeverage = require("../models/foodAndBeverage");

const addFoodAndBeverage = async (req, res) => {
    try {
        const { name, description, subCategories, status } = req.body;
        console.log(req.body, "reqbody");
        console.log(req.files, "uploaded files");

        // Parse `subCategories` from JSON
        let parsedSubCategories = [];
        if (subCategories) {
            parsedSubCategories = JSON.parse(subCategories);

            // Attach uploaded images and menu files to subcategories
            parsedSubCategories = parsedSubCategories.map((subCategory, index) => {
                const images = req.files.filter((file) =>
                    file.fieldname === `subCategoryImages_${index}`
                );
                const menuFile = req.files.find((file) =>
                    file.fieldname === `menuFile_${index}`
                );

                const imagePaths = images.map((file) => `/uploads/foodAndBeverage/${file.filename}`);
                return {
                    ...subCategory,
                    images: imagePaths,
                    menu: menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : null,
                };
            });
        }

        // Handle the banner image
        const bannerImage = req.files.find((file) => file.fieldname === "bannerImage");

        const newCategory = new FoodAndBeverage({
            name,
            description,
            bannerImage: bannerImage ? `/uploads/foodAndBeverage/${bannerImage.filename}` : null,
            subCategories: parsedSubCategories,
            status,
        });

        const savedCategory = await newCategory.save();

        res.status(201).json({
            message: "Food & Beverage category added successfully.",
            foodAndBeverage: savedCategory,
        });
    } catch (error) {
        console.error("Error adding Food & Beverage category:", error);
        res.status(500).json({
            message: "Failed to add Food & Beverage category.",
            error: error.message,
        });
    }
};

const updateFoodAndBeverage = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, subCategories, status } = req.body;

        console.log(req.body, "req update")

        // Prepare the updates object
        const updates = {};

        // Dynamically add provided fields to the updates object
        if (name) updates.name = name;
        if (description) updates.description = description;
        if (status) updates.status = status;

        // Handle `bannerImage` update
        const bannerImage = req.files.find((file) => file.fieldname === "bannerImage");
        if (bannerImage) {
            updates.bannerImage = `/uploads/foodAndBeverage/${bannerImage.filename}`;
        }

        // Handle `subCategories` update if provided
        if (subCategories) {
            const parsedSubCategories = JSON.parse(subCategories).map((subCategory, index) => {
                // Filter files for current subcategory
                const images = req.files.filter((file) =>
                    file.fieldname === `subCategoryImages_${index}`
                );
                const menuFile = req.files.find((file) =>
                    file.fieldname === `menuFile_${index}`
                );

                // Map image file paths
                const imagePaths = images.map((file) => `/uploads/foodAndBeverage/${file.filename}`);

                return {
                    ...subCategory,
                    images: imagePaths,
                    menu: menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : null,
                };
            });

            updates.subCategories = parsedSubCategories;
        }

        // Update the Food & Beverage category
        const updatedCategory = await FoodAndBeverage.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
            runValidators: true, // Validate the updates against the schema
        });

        if (!updatedCategory) {
            return res.status(404).json({ message: "Food & Beverage category not found." });
        }

        res.status(200).json({
            message: "Food & Beverage category updated successfully.",
            foodAndBeverage: updatedCategory,
        });
    } catch (error) {
        console.error("Error updating Food & Beverage category:", error);
        res.status(500).json({
            message: "Failed to update Food & Beverage category.",
            error: error.message,
        });
    }
};

// const getFoodAndBeverageById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const category = await FoodAndBeverage.findById(id);
//         if (!category) {
//             return res.status(404).json({ message: "Category not found." });
//         }

//         res.status(200).json({
//             message: "Food & Beverage category fetched successfully.",
//             foodAndBeverage: category,
//         });
//     } catch (error) {
//         console.error("Error fetching Food & Beverage category:", error);
//         res.status(500).json({
//             message: "Failed to fetch Food & Beverage category.",
//             error: error.message,
//         });
//     }
// };

const getFoodAndBeverageById = async (req, res) => {
    try {
        const { id } = req.params;

        // Attempt to find a category by its ID
        const category = await FoodAndBeverage.findById(id);
        if (category) {
            return res.status(200).json({
                message: "Food & Beverage category fetched successfully.",
                foodAndBeverage: category,
            });
        }

        // Check subcategories across all categories
        const categoryWithSubcategory = await FoodAndBeverage.findOne({
            subCategories: { $elemMatch: { _id: id } },
        });

        if (categoryWithSubcategory) {
            const subcategory = categoryWithSubcategory.subCategories.find(
                (sub) => sub._id.toString() === id
            );

            return res.status(200).json({
                message: "Subcategory fetched successfully.",
                subCategory: subcategory,
                parentCategory: {
                    id: categoryWithSubcategory._id,
                    name: categoryWithSubcategory.name,
                },
            });
        }

        // If neither a category nor a subcategory is found
        return res.status(404).json({ message: "Category or subcategory not found." });
    } catch (error) {
        console.error("Error fetching Food & Beverage category or subcategory:", error);
        res.status(500).json({
            message: "Failed to fetch Food & Beverage details.",
            error: error.message,
        });
    }
};


const getAllFoodAndBeverages = async (req, res) => {
    try {
        const foodAndBeverages = await FoodAndBeverage.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: "Food & Beverages fetched successfully.",
            foodAndBeverages,
        });
    } catch (error) {
        console.error("Error fetching Food & Beverages:", error);
        res.status(500).json({
            message: "Failed to fetch Food & Beverages.",
            error: error.message,
        });
    }
};

const deleteFoodAndBeverage = async (req, res) => {
    try {
        const { id } = req.params;
        const foodAndBeverage = await FoodAndBeverage.findByIdAndDelete(id);

        if (!foodAndBeverage) {
            return res.status(404).json({ message: "Food & Beverage category not found." });
        }

        res.status(200).json({
            message: "Food & Beverage category deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting Food & Beverage category:", error);
        res.status(500).json({
            message: "Failed to delete Food & Beverage category.",
            error: error.message,
        });
    }
};

const getActiveFoodAndBeverages = async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;

        // Convert query parameters to integers
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 5;
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch active Food and Beverage categories
        const activeFoodAndBeverages = await FoodAndBeverage.find({ status: "Active" })
            .sort({ createdAt: -1 }) // Sort by creation date (newest first)
            .skip(skip)
            .limit(limitNumber);

        // Count total active categories for pagination
        const totalItems = await FoodAndBeverage.countDocuments({ status: "Active" });

        // Prepare the response
        res.status(200).json({
            message: "Active Food and Beverage categories fetched successfully.",
            foodAndBeverages: activeFoodAndBeverages,
            pagination: {
                totalItems,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalItems / limitNumber),
                limit: limitNumber,
            },
        });
    } catch (error) {
        console.error("Error fetching active Food and Beverage categories:", error);
        res.status(500).json({
            message: "Failed to fetch active Food and Beverage categories.",
            error: error.message,
        });
    }
};

module.exports = {
    addFoodAndBeverage,
    updateFoodAndBeverage,
    getAllFoodAndBeverages,
    getFoodAndBeverageById,
    deleteFoodAndBeverage,
    getActiveFoodAndBeverages
};
