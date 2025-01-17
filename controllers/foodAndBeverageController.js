const FoodAndBeverage = require("../models/foodAndBeverage");
const path = require("path");
const fs = require("fs");

const addFoodAndBeverage = async (req, res) => {
    try {
        const { name, description, status, location, extansion_no, timings } = req.body;
        console.log(req.body, "reqbody");
        console.log(req.files, "uploaded files");
        // Check if Food and Beverage already exists
        const existingCategory = await FoodAndBeverage.findOne({ name, isDeleted: false });
        if (existingCategory) {
            return res.status(400).json({ message: "Food & Beverage category already exists with the same name." });
        }


        // Handle multiple banner images
        const bannerImages = req.files
            .filter((file) => file.fieldname === "bannerImage")
            .map((file) => `/uploads/foodAndBeverage/${file.filename}`);

        // Handle the main menu file
        const mainmenu = req.files.find((file) => file.fieldname === "mainmenu");
        const mainmenuPath = mainmenu ? `/uploads/foodAndBeverage/${mainmenu.filename}` : null;

        // Convert timings from the request if present
        const timingsArray = timings ? JSON.parse(timings) : [];

        // Create new Food and Beverage category
        const newCategory = new FoodAndBeverage({
            name, // Name (linking to Restaurant)
            description, // Main category description
            bannerImage: bannerImages, // Array of banner image paths
            timings: timingsArray, // Timings array
            location: location || "", // Location (optional)
            extansion_no: extansion_no || "", // Extension number (optional)
            mainmenu: mainmenuPath, // Menu file path (optional)
            status, // Active/Inactive
        });

        // Save the category to the database
        const savedCategory = await newCategory.save();

        // Return success response
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
        const { name, description, status, timings, location, extansion_no } = req.body;

        // Check if Food and Beverage with the same name and location already exists
        const existingCategory = await FoodAndBeverage.findOne({ name, isDeleted: false, _id: { $ne: id } });
        if (existingCategory) {
            return res.status(400).json({ message: "Another Food & Beverage category already exists with the same name ." });
        }

        console.log(req.body, "req update");

        // Prepare the updates object
        const updates = {};

        // Dynamically add provided fields to the updates object
        if (name) updates.name = name;
        if (description) updates.description = description;
        if (status) updates.status = status;
        if (location) updates.location = location;
        if (extansion_no) updates.extansion_no = extansion_no;

        // Handle `bannerImage` update (multiple images as an array)
        const bannerImages = req.files
            .filter((file) => file.fieldname === "bannerImage")
            .map((file) => `/uploads/foodAndBeverage/${file.filename}`);
        if (bannerImages.length > 0) {
            updates.bannerImage = bannerImages;
        }

        // Handle `mainmenu` update
        const mainmenu = req.files.find((file) => file.fieldname === "mainmenu");
        if (mainmenu) {
            updates.mainmenu = `/uploads/foodAndBeverage/${mainmenu.filename}`;
        }

        // Handle the `timings` update
        if (timings) {
            updates.timings = JSON.parse(timings); // Assuming timings are provided as JSON
        }

        // Update the Food & Beverage category in the database
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

        // Attempt to find a category by its ID
        const category = await FoodAndBeverage.findById(id)
            .populate('name', '_id name'); // Populate the Restaurant reference in the "name" field

        if (!category) {
            return res.status(404).json({ message: "Food & Beverage category not found." });
        }

        // Structuring the response to match the required format for a category
        const responseCategory = {
            _id: category._id,
            name: category.name ? category.name.name : "N/A",
            nameId: category.name ? category.name._id : null,
            description: category.description || "",
            location: category.location || "",
            extansion_no: category.extansion_no || "",
            bannerImage: category.bannerImage || [],
            mainmenu: category.mainmenu || null,
            timings: category.timings.map(timing => ({
                title: timing.title || "",
                startDay: timing.startDay || "",
                endDay: timing.endDay || "",
                startTime: timing.startTime || "",
                endTime: timing.endTime || "",
                _id: timing._id,
            })),
            status: category.status || "Active",
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            __v: category.__v || 0,
        };

        return res.status(200).json({
            message: "Food & Beverage category fetched successfully.",
            foodAndBeverage: responseCategory,
        });

    } catch (error) {
        console.error("Error fetching Food & Beverage category:", error);
        res.status(500).json({
            message: "Failed to fetch Food & Beverage details.",
            error: error.message,
        });
    }
};


const getEditFoodAndBeverageById = async (req, res) => {
    try {
        const { id } = req.params;

        // Attempt to find a category by its ID
        const category = await FoodAndBeverage.findById(id).exec()


        if (category) {
            return res.status(200).json({
                message: "Food & Beverage category fetched successfully.",
                foodAndBeverage: category,
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
        // Fetch all food and beverages with necessary fields populated
        const foodAndBeveragesData = await FoodAndBeverage.find({ isDeleted: false })
            .populate('name', '_id name') // Populate the Restaurant reference in the "name" field
            .sort({ createdAt: -1 });

        // Structuring the response to match the desired format
        const responseData = foodAndBeveragesData.map(fb => ({
            _id: fb._id,
            name: fb.name ? fb.name.name : "N/A",
            nameId: fb.name ? fb.name._id : null,
            location: fb.location || "",
            extansion_no: fb.extansion_no || "",
            description: fb.description || "",
            bannerImage: fb.bannerImage || [],
            mainmenu: fb.mainmenu || null,
            timings: fb.timings.map(timing => ({
                title: timing.title || "",
                startDay: timing.startDay || "",
                endDay: timing.endDay || "",
                startTime: timing.startTime || "",
                endTime: timing.endTime || "",
                _id: timing._id,
            })),
            status: fb.status || "Active",
            createdAt: fb.createdAt,
            updatedAt: fb.updatedAt,
            __v: fb.__v || 0,
        }));

        // Send the structured response
        res.status(200).json({
            message: "Food & Beverage categories fetched successfully.",
            foodAndBeverages: responseData,
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

        // Fetch active Food and Beverage categories with necessary populations
        const activeFoodAndBeveragesData = await FoodAndBeverage.find({ status: "Active", isDeleted: false })
            .populate('name', '_id name') // Populate the Restaurant reference in the "name" field
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        // Count total active categories for pagination
        const totalItems = await FoodAndBeverage.countDocuments({ status: "Active", isDeleted: false });

        // Structure the response to match the desired format
        const responseData = activeFoodAndBeveragesData.map(fb => ({
            _id: fb._id,
            name: fb.name ? fb.name.name : "N/A",
            nameId: fb.name ? fb.name._id : null,
            location: fb.location || "",
            extansion_no: fb.extansion_no || "",
            description: fb.description || "",
            bannerImage: fb.bannerImage || [],
            mainmenu: fb.mainmenu || null,
            timings: fb.timings.map(timing => ({
                title: timing.title || "",
                startDay: timing.startDay || "",
                endDay: timing.endDay || "",
                startTime: timing.startTime || "",
                endTime: timing.endTime || "",
                _id: timing._id,
            })),
            status: fb.status || "Active",
            createdAt: fb.createdAt,
            updatedAt: fb.updatedAt,
            __v: fb.__v || 0,
        }));

        // Send the structured response with pagination
        res.status(200).json({
            message: "Active Food and Beverage categories fetched successfully.",
            foodAndBeverages: responseData,
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

const deleteFoodAndBeveragesImage = async (req, res) => {
    const { id, index } = req.params;

    try {
        // Find the banquet by ID
        const banquet = await FoodAndBeverage.findById(id);
        if (!banquet) {
            return res.status(404).json({ message: "Food And Beverages not found." });
        }

        // Validate the index
        if (index < 0 || index >= banquet.bannerImage.length) {
            return res.status(400).json({ message: "Invalid image index." });
        }

        // Get the image path
        const imagePath = banquet.bannerImage[index];

        // Remove the image from the array
        banquet.bannerImage.splice(index, 1);

        // Delete the image file from the server
        const filePath = path.resolve(__dirname, "..", imagePath);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Failed to delete image file:", err);
            }
        });

        // Save the updated banquet
        await banquet.save();

        return res.status(200).json({ message: "Image deleted successfully." });
    } catch (error) {
        console.error("Error deleting image:", error);
        return res.status(500).json({
            message: "Failed to delete image.",
            error: error.message,
        });
    }
};

const uploadFoodAndBeveragesImage = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if Food and Beverage category exists
        const foodAndBeverage = await FoodAndBeverage.findById(id);
        if (!foodAndBeverage) {
            return res.status(404).json({ message: "Food and Beverage category not found." });
        }

        // Ensure images are provided in the request
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please provide images to upload." });
        }

        // Process image file paths and ensure cross-platform compatibility
        const imagePaths = req.files.map((file) =>
            `/uploads/foodAndBeverage/${file.filename}` // Adjust based on your file structure
        );

        // Update the banner images by appending the new ones
        foodAndBeverage.bannerImage = [...(foodAndBeverage.bannerImage || []), ...imagePaths];

        // Save the updated Food and Beverage category
        await foodAndBeverage.save();

        return res.status(200).json({
            message: "Images uploaded successfully.",
            images: imagePaths,
            updatedBannerImages: foodAndBeverage.bannerImage,
        });
    } catch (error) {
        console.error("Error uploading images:", error);
        return res.status(500).json({
            message: "Failed to upload images.",
            error: error.message,
        });
    }
};


module.exports = {
    addFoodAndBeverage,
    updateFoodAndBeverage,
    getAllFoodAndBeverages,
    getFoodAndBeverageById,
    getEditFoodAndBeverageById,
    deleteFoodAndBeverage,
    getActiveFoodAndBeverages,
    deleteFoodAndBeveragesImage,
    uploadFoodAndBeveragesImage
};
