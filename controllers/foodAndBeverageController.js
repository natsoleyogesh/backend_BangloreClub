const FoodAndBeverage = require("../models/foodAndBeverage");

// const addFoodAndBeverage = async (req, res) => {
//     try {
//         const { name, description, subCategories } = req.body;

//         // Parse subCategories JSON
//         let parsedSubCategories = [];
//         if (subCategories) {
//             parsedSubCategories = JSON.parse(subCategories);

//             // Attach uploaded images and menu files to subcategories
//             parsedSubCategories = parsedSubCategories.map((subCategory, index) => {
//                 const images = req.files[`subCategoryImages_${index}`] || [];
//                 const menuFile = req.files[`menuFile_${index}`] ? req.files[`menuFile_${index}`][0] : null;

//                 const imagePaths = images.map((file) => `/uploads/foodAndBeverage/${file.filename}`);
//                 return {
//                     ...subCategory,
//                     images: imagePaths,
//                     menu: menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : null,
//                 };
//             });
//         }

//         const newCategory = new FoodAndBeverage({
//             name,
//             description,
//             bannerImage: req.file ? `/uploads/foodAndBeverage/${req.file.filename}` : null,
//             subCategories: parsedSubCategories,
//         });

//         const savedCategory = await newCategory.save();

//         res.status(201).json({
//             message: "Food & Beverage category added successfully.",
//             foodAndBeverage: savedCategory,
//         });
//     } catch (error) {
//         console.error("Error adding Food & Beverage category:", error);
//         res.status(500).json({
//             message: "Failed to add Food & Beverage category.",
//             error: error.message,
//         });
//     }
// };
//--------------------------------------------------------
// const addFoodAndBeverage = async (req, res) => {
//     try {
//         const { name, description, subCategories, status } = req.body;
//         console.log(req.body, "reqbody")
//         // Parse `subCategories` from JSON
//         let parsedSubCategories = [];
//         if (subCategories) {
//             parsedSubCategories = JSON.parse(subCategories);

//             // Attach uploaded images and menu files to subcategories
//             parsedSubCategories = parsedSubCategories.map((subCategory, index) => {
//                 const images = req.files[`subCategoryImages_${index}`] || [];
//                 const menuFile = req.files[`menuFile_${index}`] ? req.files[`menuFile_${index}`][0] : null;

//                 const imagePaths = images.map((file) => `/uploads/foodAndBeverage/${file.filename}`);
//                 return {
//                     ...subCategory,
//                     images: imagePaths,
//                     menu: menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : null,
//                 };
//             });
//         }

//         const newCategory = new FoodAndBeverage({
//             name,
//             description,
//             bannerImage: req.file ? `/uploads/foodAndBeverage/${req.file.filename}` : null,
//             subCategories: parsedSubCategories,
//             status
//         });

//         const savedCategory = await newCategory.save();

//         res.status(201).json({
//             message: "Food & Beverage category added successfully.",
//             foodAndBeverage: savedCategory,
//         });
//     } catch (error) {
//         console.error("Error adding Food & Beverage category:", error);
//         res.status(500).json({
//             message: "Failed to add Food & Beverage category.",
//             error: error.message,
//         });
//     }
// };

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


// const updateFoodAndBeverage = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, description, subCategories } = req.body;

//         // Find the Food & Beverage entry by ID
//         const foodAndBeverage = await FoodAndBeverage.findById(id);
//         if (!foodAndBeverage) {
//             return res.status(404).json({ message: "Food & Beverage category not found." });
//         }

//         // Update fields dynamically based on the provided req.body
//         if (name) foodAndBeverage.name = name;
//         if (description) foodAndBeverage.description = description;

//         // Handle banner image update if provided
//         if (req.file) {
//             foodAndBeverage.bannerImage = `/uploads/foodAndBeverage/${req.file.filename}`;
//         }

//         // Handle subcategories update if provided
//         if (subCategories) {
//             let updatedSubCategories = JSON.parse(subCategories);

//             updatedSubCategories = updatedSubCategories.map((subCategory, index) => {
//                 const images = req.files[`subCategoryImages_${index}`] || [];
//                 const menuFile = req.files[`menuFile_${index}`] ? req.files[`menuFile_${index}`][0] : null;

//                 const imagePaths = images.map((file) => `/uploads/foodAndBeverage/${file.filename}`);

//                 // Update existing subcategory fields dynamically
//                 return {
//                     ...subCategory,
//                     images: imagePaths.length > 0 ? imagePaths : subCategory.images,
//                     menu: menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : subCategory.menu,
//                 };
//             });

//             foodAndBeverage.subCategories = updatedSubCategories;
//         }

//         // Save the updated Food & Beverage category
//         const updatedCategory = await foodAndBeverage.save();
//         res.status(200).json({
//             message: "Food & Beverage category updated successfully.",
//             foodAndBeverage: updatedCategory,
//         });
//     } catch (error) {
//         console.error("Error updating Food & Beverage category:", error);
//         res.status(500).json({
//             message: "Failed to update Food & Beverage category.",
//             error: error.message,
//         });
//     }
// };


// const updateFoodAndBeverage = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, description, subCategories, status } = req.body;

//         const updates = {};

//         if (name) updates.name = name;
//         if (description) updates.description = description;
//         if (status) updates.status = status;

//         // Handle `bannerImage` update
//         if (req.file) {
//             updates.bannerImage = `/uploads/foodAndBeverage/${req.file.filename}`;
//         }

//         // Parse and process `subCategories`
//         if (subCategories) {
//             const parsedSubCategories = JSON.parse(subCategories).map((subCategory, index) => {
//                 const images = req.files[`subCategoryImages_${index}`] || [];
//                 const menuFile = req.files[`menuFile_${index}`] ? req.files[`menuFile_${index}`][0] : null;

//                 const imagePaths = images.map((file) => `/uploads/foodAndBeverage/${file.filename}`);
//                 return {
//                     ...subCategory,
//                     images: imagePaths,
//                     menu: menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : null,
//                 };
//             });

//             updates.subCategories = parsedSubCategories;
//         }

//         const updatedCategory = await FoodAndBeverage.findByIdAndUpdate(id, updates, { new: true });

//         if (!updatedCategory) {
//             return res.status(404).json({ message: "Food & Beverage category not found." });
//         }

//         res.status(200).json({
//             message: "Food & Beverage category updated successfully.",
//             foodAndBeverage: updatedCategory,
//         });
//     } catch (error) {
//         console.error("Error updating Food & Beverage category:", error);
//         res.status(500).json({
//             message: "Failed to update Food & Beverage category.",
//             error: error.message,
//         });
//     }
// };

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



const getFoodAndBeverageById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await FoodAndBeverage.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }

        res.status(200).json({
            message: "Food & Beverage category fetched successfully.",
            foodAndBeverage: category,
        });
    } catch (error) {
        console.error("Error fetching Food & Beverage category:", error);
        res.status(500).json({
            message: "Failed to fetch Food & Beverage category.",
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

module.exports = {
    addFoodAndBeverage,
    updateFoodAndBeverage,
    getAllFoodAndBeverages,
    getFoodAndBeverageById,
    deleteFoodAndBeverage
};
