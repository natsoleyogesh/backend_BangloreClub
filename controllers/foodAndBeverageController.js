const FoodAndBeverage = require("../models/foodAndBeverage");

// const addFoodAndBeverage = async (req, res) => {
//     try {
//         const { name, description, subCategories, status } = req.body;
//         console.log(req.body, "reqbody");
//         console.log(req.files, "uploaded files");

//         // Parse `subCategories` from JSON
//         let parsedSubCategories = [];
//         if (subCategories) {
//             parsedSubCategories = JSON.parse(subCategories);

//             // Attach uploaded images and menu files to subcategories
// parsedSubCategories = parsedSubCategories.map((subCategory, index) => {
//     const images = req.files.filter((file) =>
//         file.fieldname === `images_${index}`
//     );
//     const menuFile = req.files.find((file) =>
//         file.fieldname === `menu_${index}`
//     );

//     const imagePaths = images.map((file) => `/uploads/foodAndBeverage/${file.filename}`);
//     return {
//         ...subCategory,
//         images: imagePaths,
//         menu: menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : null,
//     };
// });
//         }

//         // Handle the banner image
//         const bannerImage = req.files.find((file) => file.fieldname === "bannerImage");

//         const newCategory = new FoodAndBeverage({
//             name,
//             description,
//             bannerImage: bannerImage ? `/uploads/foodAndBeverage/${bannerImage.filename}` : null,
//             subCategories: parsedSubCategories,
//             status,
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

// const updateFoodAndBeverage = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, description, subCategories, status } = req.body;

//         console.log(req.body, "req update")

//         // Prepare the updates object
//         const updates = {};

//         // Dynamically add provided fields to the updates object
//         if (name) updates.name = name;
//         if (description) updates.description = description;
//         if (status) updates.status = status;

//         // Handle `bannerImage` update
//         const bannerImage = req.files.find((file) => file.fieldname === "bannerImage");
//         if (bannerImage) {
//             updates.bannerImage = `/uploads/foodAndBeverage/${bannerImage.filename}`;
//         }

//         // Handle `subCategories` update if provided
//         if (subCategories) {
//             const parsedSubCategories = JSON.parse(subCategories).map((subCategory, index) => {
//                 // Filter files for current subcategory
//                 const images = req.files.filter((file) =>
//                     file.fieldname === `images_${index}`
//                 );
//                 const menuFile = req.files.find((file) =>
//                     file.fieldname === `menu_${index}`
//                 );

//                 // Map image file paths
//                 const imagePaths = images.map((file) => `/uploads/foodAndBeverage/${file.filename}`);

//                 return {
//                     ...subCategory,
//                     images: imagePaths,
//                     menu: menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : null,
//                 };
//             });

//             updates.subCategories = parsedSubCategories;
//         }
//         // console.log(updates, "updates")

//         // Update the Food & Beverage category
//         const updatedCategory = await FoodAndBeverage.findByIdAndUpdate(id, updates, {
//             new: true, // Return the updated document
//             runValidators: true, // Validate the updates against the schema
//         });

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

// new code working////////////////////
// const addFoodAndBeverage = async (req, res) => {
//     try {
//         const { name, description, subCategories, status } = req.body;
//         console.log(req.body, "reqbody");
//         console.log(req.files, "uploaded files");

//         // Parse `subCategories` from JSON if provided
//         let parsedSubCategories = [];
//         if (subCategories) {
//             parsedSubCategories = JSON.parse(subCategories);

//             // Process subcategories
//             parsedSubCategories = parsedSubCategories.map((subCategory, index) => {
//                 const images = req.files.filter((file) =>
//                     file.fieldname === `images_${index}`
//                 );
//                 const menuFile = req.files.find((file) =>
//                     file.fieldname === `menu_${index}`
//                 );

//                 const imagePaths = images.map((file) => `/uploads/foodAndBeverage/${file.filename}`);
//                 return {
//                     ...subCategory,
//                     images: imagePaths,
//                     menu: menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : null,
//                 };
//             });
//         }

//         // Handle the banner image
//         const bannerImage = req.files.find((file) => file.fieldname === "bannerImage");
//         const bannerImagePath = bannerImage ? `/uploads/foodAndBeverage/${bannerImage.filename}` : null;
//         const mainmenu = req.files.find((file) => file.fieldname === "mainmenu");
//         const mainmenuPath = mainmenu ? `/uploads/foodAndBeverage/${mainmenu.filename}` : null;

//         // Convert timings from the request if present
//         const timings = req.body.timings ? JSON.parse(req.body.timings) : [];

//         // Create new Food and Beverage category
//         const newCategory = new FoodAndBeverage({
//             name, // Name (linking to Restaurant)
//             description, // Main category description
//             bannerImage: bannerImagePath, // Banner image path
//             timings, // Timings array
//             location: req.body.location || "", // Location (optional)
//             extansion_no: req.body.extansion_no || "", // Extension number (optional)
//             mainmenu: mainmenuPath, // Menu file path (optional)
//             subCategories: parsedSubCategories, // Array of subcategories
//             status, // Active/Inactive
//         });

//         // Save the category to the database
//         const savedCategory = await newCategory.save();

//         // Return success response
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
        const { name, description, subCategories, status, location, extansion_no, timings } = req.body;
        console.log(req.body, "reqbody");
        console.log(req.files, "uploaded files");

        // Parse `subCategories` from JSON if provided
        let parsedSubCategories = [];
        if (subCategories) {
            parsedSubCategories = JSON.parse(subCategories);

            // Process subcategories
            parsedSubCategories = parsedSubCategories.map((subCategory, index) => {
                const images = req.files.filter((file) => file.fieldname === `images_${index}`);
                const menuFile = req.files.find((file) => file.fieldname === `menu_${index}`);

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
        const bannerImagePath = bannerImage ? `/uploads/foodAndBeverage/${bannerImage.filename}` : null;
        const mainmenu = req.files.find((file) => file.fieldname === "mainmenu");
        const mainmenuPath = mainmenu ? `/uploads/foodAndBeverage/${mainmenu.filename}` : null;

        // Convert timings from the request if present
        const timingsArray = timings ? JSON.parse(timings) : [];

        // Create new Food and Beverage category
        const newCategory = new FoodAndBeverage({
            name, // Name (linking to Restaurant)
            description, // Main category description
            bannerImage: bannerImagePath, // Banner image path
            timings: timingsArray, // Timings array
            location: location || "", // Location (optional)
            extansion_no: extansion_no || "", // Extension number (optional)
            mainmenu: mainmenuPath, // Menu file path (optional)
            subCategories: parsedSubCategories, // Array of subcategories
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



// const updateFoodAndBeverage = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, description, subCategories, status, timings, location, extansion_no, } = req.body;

//         console.log(req.body, "req update");

//         // Prepare the updates object
//         const updates = {};

//         // Dynamically add provided fields to the updates object
//         if (name) updates.name = name;
//         if (description) updates.description = description;
//         if (status) updates.status = status;
//         if (location) updates.location = location;
//         if (extansion_no) updates.extansion_no = extansion_no;

//         // Handle `bannerImage` update
//         const bannerImage = req.files.find((file) => file.fieldname === "bannerImage");
//         if (bannerImage) {
//             updates.bannerImage = `/uploads/foodAndBeverage/${bannerImage.filename}`;
//         }
//         const mainmenu = req.files.find((file) => file.fieldname === "mainmenu");
//         if (mainmenu) {
//             updates.mainmenu = mainmenu ? `/uploads/foodAndBeverage/${mainmenu.filename}` : null;
//         }


//         // Handle the `timings` update
//         if (timings) {
//             updates.timings = JSON.parse(timings); // Assuming timings are provided as JSON
//         }


//         // Handle `subCategories` update if provided
//         if (subCategories || req.files > 0) {
//             const parsedSubCategories = JSON.parse(subCategories).map((subCategory, index) => {
//                 // Filter files for the current subcategory
//                 const images = req.files.filter((file) => file.fieldname === `images_${index}`);
//                 const menuFile = req.files.find((file) => file.fieldname === `menu_${index}`);

//                 // Map image file paths
//                 // Map image file paths if images are provided
//                 const imagePaths = images.length > 0
//                     ? images.map((file) => `/uploads/foodAndBeverage/${file.filename}`)
//                     : subCategory.images; // If no new image, retain the existing image

//                 // If a new menu file is provided, use it; otherwise, retain the existing one
//                 const menuPath = menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : subCategory.menu;

//                 return {
//                     ...subCategory,
//                     images: imagePaths,
//                     menu: menuPath, // Preserve existing menu if not updated
//                 };
//             });

//             // Update the specific subcategories within the existing subCategories array
//             const updatedSubCategories = updates.subCategories || [];
//             parsedSubCategories.forEach((parsedSubCategory) => {
//                 const index = updatedSubCategories.findIndex(
//                     (existingSubCategory) => existingSubCategory._id === parsedSubCategory._id
//                 );
//                 if (index !== -1) {
//                     updatedSubCategories[index] = parsedSubCategory; // Update only the specific subcategory
//                 } else {
//                     updatedSubCategories.push(parsedSubCategory); // Add a new subcategory if it doesn't exist
//                 }
//             });

//             updates.subCategories = updatedSubCategories;
//         }

//         // Update the Food & Beverage category
//         const updatedCategory = await FoodAndBeverage.findByIdAndUpdate(id, updates, {
//             new: true, // Return the updated document
//             runValidators: true, // Validate the updates against the schema
//         });

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


// const getFoodAndBeverageById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Attempt to find a category by its ID
//         const category = await FoodAndBeverage.findById(id)
//             .populate('name', '_id name') // Populate the Restaurant reference in the "name" field
//             .populate('subCategories.name', '_id name') // Populate the "name" field in each subCategory
//         if (category) {
//             return res.status(200).json({
//                 message: "Food & Beverage category fetched successfully.",
//                 foodAndBeverage: category,
//             });
//         }

//         // Check subcategories across all categories
//         const categoryWithSubcategory = await FoodAndBeverage.findOne({
//             subCategories: { $elemMatch: { _id: id } },
//         });

//         if (categoryWithSubcategory) {
//             const subcategory = categoryWithSubcategory.subCategories.find(
//                 (sub) => sub._id.toString() === id
//             );

//             return res.status(200).json({
//                 message: "Subcategory fetched successfully.",
//                 subCategory: subcategory,
//                 parentCategory: {
//                     id: categoryWithSubcategory._id,
//                     name: categoryWithSubcategory.name,
//                 },
//             });
//         }

//         // If neither a category nor a subcategory is found
//         return res.status(404).json({ message: "Category or subcategory not found." });
//     } catch (error) {
//         console.error("Error fetching Food & Beverage category or subcategory:", error);
//         res.status(500).json({
//             message: "Failed to fetch Food & Beverage details.",
//             error: error.message,
//         });
//     }
// };


// const getAllFoodAndBeverages = async (req, res) => {
//     try {
//         const foodAndBeverages = await FoodAndBeverage.findById(id)
//             .populate('name') // Populate the Restaurant reference in the "name" field
//             .populate('subCategories.name') // Populate the "name" field in each subCategory
//             .sort({ createdAt: -1 });
//         res.status(200).json({
//             message: "Food & Beverages fetched successfully.",
//             foodAndBeverages,
//         });
//     } catch (error) {
//         console.error("Error fetching Food & Beverages:", error);
//         res.status(500).json({
//             message: "Failed to fetch Food & Beverages.",
//             error: error.message,
//         });
//     }
// };
// new code for working----------------------
// const updateFoodAndBeverage = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, description, subCategories, status, timings, location, extansion_no } = req.body;

//         console.log(req.files, "req update");

//         // Prepare the updates object
//         const updates = {};

//         // Dynamically add provided fields to the updates object
//         if (name) updates.name = name;
//         if (description) updates.description = description;
//         if (status) updates.status = status;
//         if (location) updates.location = location;
//         if (extansion_no) updates.extansion_no = extansion_no;

//         // Handle `bannerImage` update
//         const bannerImage = req.files.find((file) => file.fieldname === "bannerImage");
//         if (bannerImage) {
//             updates.bannerImage = `/uploads/foodAndBeverage/${bannerImage.filename}`;
//         }

//         // Handle `mainmenu` update
//         const mainmenu = req.files.find((file) => file.fieldname === "mainmenu");
//         if (mainmenu) {
//             updates.mainmenu = `/uploads/foodAndBeverage/${mainmenu.filename}`;
//         }

//         // Handle `timings` update
//         if (timings) {
//             updates.timings = JSON.parse(timings); // Assuming timings are provided as JSON
//         }

//         // Handle `subCategories` update if provided
//         if (subCategories) {
//             const parsedSubCategories = JSON.parse(subCategories).map((subCategory, index) => {
//                 // Filter files for the current subcategory (images and menu)
//                 const images = req.files.filter((file) => file.fieldname === `images_${index}`);
//                 const menuFile = req.files.find((file) => file.fieldname === `menu_${index}`);

//                 // Update images if provided, else retain existing images
//                 const imagePaths = images.length > 0
//                     ? images.map((file) => `/uploads/foodAndBeverage/${file.filename}`)
//                     : subCategory.images; // Retain existing images if none are provided

//                 // Update menu if provided, else retain existing menu
//                 const menuPath = menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : subCategory.menu;

//                 // Return the updated subcategory
//                 return {
//                     ...subCategory,
//                     images: imagePaths,
//                     menu: menuPath, // Preserve existing menu if not updated
//                 };
//             });

//             // Prepare updated subCategories array
//             const updatedSubCategories = updates.subCategories || [];
//             parsedSubCategories.forEach((parsedSubCategory) => {
//                 const index = updatedSubCategories.findIndex(
//                     (existingSubCategory) => existingSubCategory._id === parsedSubCategory._id
//                 );
//                 if (index !== -1) {
//                     updatedSubCategories[index] = parsedSubCategory; // Update existing subcategory
//                 } else {
//                     updatedSubCategories.push(parsedSubCategory); // Add new subcategory if not found
//                 }
//             });

//             // Set updated subCategories
//             updates.subCategories = updatedSubCategories;
//         }

//         // Update the Food & Beverage category in the database
//         const updatedCategory = await FoodAndBeverage.findByIdAndUpdate(id, updates, {
//             new: true, // Return the updated document
//             runValidators: true, // Ensure validation is run for updates
//         });

//         if (!updatedCategory) {
//             return res.status(404).json({ message: "Food & Beverage category not found." });
//         }

//         // Return the response with updated category data
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
//         const { name, description, subCategories, status, timings, location, extansion_no } = req.body;

//         console.log(req.body, "req update");

//         // Prepare the updates object
//         const updates = {};

//         // Dynamically add provided fields to the updates object
//         if (name) updates.name = name;
//         if (description) updates.description = description;
//         if (status) updates.status = status;
//         if (location) updates.location = location;
//         if (extansion_no) updates.extansion_no = extansion_no;

//         // Handle `bannerImage` update
//         const bannerImage = req.files.find((file) => file.fieldname === "bannerImage");
//         if (bannerImage) {
//             updates.bannerImage = `/uploads/foodAndBeverage/${bannerImage.filename}`;
//         }
//         const mainmenu = req.files.find((file) => file.fieldname === "mainmenu");
//         if (mainmenu) {
//             updates.mainmenu = `/uploads/foodAndBeverage/${mainmenu.filename}`;
//         }

//         // Handle the `timings` update
//         if (timings) {
//             updates.timings = JSON.parse(timings); // Assuming timings are provided as JSON
//         }

//         // Handle `subCategories` update if provided
//         if (subCategories || req.files.length > 0) {
//             const parsedSubCategories = JSON.parse(subCategories).map((subCategory, index) => {
//                 // Filter files for the current subcategory
//                 const images = req.files.filter((file) => file.fieldname === `images_${index}`);
//                 const menuFile = req.files.find((file) => file.fieldname === `menu_${index}`);

//                 // Map image file paths
//                 const imagePaths = images.length > 0
//                     ? images.map((file) => `/uploads/foodAndBeverage/${file.filename}`)
//                     : subCategory.images; // Retain existing images if no new ones

//                 // If a new menu file is provided, use it; otherwise, retain the existing one
//                 const menuPath = menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : subCategory.menu;

//                 return {
//                     ...subCategory,
//                     images: imagePaths,
//                     menu: menuPath, // Preserve existing menu if not updated
//                 };
//             });

//             // Update the specific subcategories within the existing subCategories array
//             const updatedSubCategories = updates.subCategories || [];
//             parsedSubCategories.forEach((parsedSubCategory) => {
//                 const index = updatedSubCategories.findIndex(
//                     (existingSubCategory) => existingSubCategory._id === parsedSubCategory._id
//                 );
//                 if (index !== -1) {
//                     updatedSubCategories[index] = parsedSubCategory; // Update only the specific subcategory
//                 } else {
//                     updatedSubCategories.push(parsedSubCategory); // Add a new subcategory if it doesn't exist
//                 }
//             });

//             updates.subCategories = updatedSubCategories;
//         }

//         // Update the Food & Beverage category
//         const updatedCategory = await FoodAndBeverage.findByIdAndUpdate(id, updates, {
//             new: true, // Return the updated document
//             runValidators: true, // Validate the updates against the schema
//         });

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
        const { name, description, subCategories, status, timings, location, extansion_no } = req.body;

        console.log(req.body, "req update");

        // Prepare the updates object
        const updates = {};

        // Dynamically add provided fields to the updates object
        if (name) updates.name = name;
        if (description) updates.description = description;
        if (status) updates.status = status;
        if (location) updates.location = location;
        if (extansion_no) updates.extansion_no = extansion_no;

        // Handle `bannerImage` update
        const bannerImage = req.files.find((file) => file.fieldname === "bannerImage");
        if (bannerImage) {
            updates.bannerImage = `/uploads/foodAndBeverage/${bannerImage.filename}`;
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

        // Handle `subCategories` update if provided
        if (subCategories) {
            const parsedSubCategories = JSON.parse(subCategories).map((subCategory, index) => {
                const images = req.files.filter((file) => file.fieldname === `images_${index}`);
                const menuFile = req.files.find((file) => file.fieldname === `menu_${index}`);

                // For images: If there are new images, use them, otherwise retain the old ones.
                const imagePaths = images.length > 0
                    ? images.map((file) => `/uploads/foodAndBeverage/${file.filename}`)
                    : subCategory.images; // If no new images, retain the existing ones

                // For menu: If there's a new menu file, use it, otherwise retain the old one.
                const menuPath = menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : subCategory.menu;

                return {
                    ...subCategory,
                    images: imagePaths, // Updated image paths
                    menu: menuPath, // Updated menu file
                };
            });

            updates.subCategories = parsedSubCategories; // Replace the old subcategories with the updated ones
        } else {
            // If subCategories is not provided in the request, only update the provided fields
            const existingCategory = await FoodAndBeverage.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ message: "Food & Beverage category not found." });
            }

            // Loop through existing subcategories and update only the provided fields
            const updatedSubCategories = existingCategory.subCategories.map((existingSubCategory, index) => {
                const imagesDATA = req.files.filter((file) => file.fieldname === `images_${index}`);
                const menuFile = req.files.find((file) => file.fieldname === `menu_${index}`);

                // For images: If there are new images, use them, otherwise retain the old ones.
                const imagePaths = imagesDATA.length > 0
                    ? imagesDATA.map((file) => `/uploads/foodAndBeverage/${file.filename}`)
                    : existingSubCategory.images; // If no new images, retain the existing ones

                // For menu: If there's a new menu file, use it, otherwise retain the old one.
                const menuPath = menuFile ? `/uploads/foodAndBeverage/${menuFile.filename}` : existingSubCategory.menu;
                console.log("Updated image paths for subcategory", index, imagePaths);
                return {
                    ...existingSubCategory,
                    images: imagePaths, // Updated image paths
                    menu: menuPath, // Updated menu file
                };
            });

            console.log("updatedSubCategories", updatedSubCategories)

            updates.subCategories = updatedSubCategories; // Update subcategories with only the provided fields
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
            .populate('name', '_id name') // Populate the Restaurant reference in the "name" field
            .populate('subCategories.name', '_id name') // Populate the "name" field in each subCategory

        if (category) {
            // Structuring the response to match the required format for a category
            const responseCategory = {
                _id: category._id,
                name: category.name ? category.name.name : "N/A",
                nameId: category.name ? category.name._id : null,
                description: category.description || "",
                location: category.location || "",
                extansion_no: category.extansion_no || "",
                bannerImage: category.bannerImage || "",
                mainmenu: category.mainmenu || null,
                subCategories: category.subCategories.map(sub => ({
                    _id: sub._id,
                    name: sub.name ? sub.name.name : "N/A",
                    nameId: sub.name ? sub.name._id : null,
                    description: sub.description || "",
                    location: sub.location || "",
                    extansion_no: sub.extansion_no || "",
                    images: sub.images || [],
                    menu: sub.menu || "",
                    timings: sub.timings.map(timing => ({
                        title: timing.title || "",
                        startDay: timing.startDay || "",
                        endDay: timing.endDay || "",
                        startTime: timing.startTime || "",
                        endTime: timing.endTime || "",
                        _id: timing._id,
                    })),

                })),
                timings: category.timings || [],
                status: category.status || "Active",
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
                __v: category.__v || 0,
            };

            return res.status(200).json({
                message: "Food & Beverage category fetched successfully.",
                foodAndBeverage: responseCategory,
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

            // Structuring the response to match the required format for a subcategory
            const responseSubCategory = {
                description: subcategory.description || "",
                timings: subcategory.timings.map(timing => ({
                    title: timing.title || "",
                    startDay: timing.startDay || "",
                    endDay: timing.endDay || "",
                    startTime: timing.startTime || "",
                    endTime: timing.endTime || "",
                    _id: timing._id,
                })),
                location: subcategory.location || "",
                extansion_no: subcategory.extansion_no || "",
                images: subcategory.images || [],
                menu: subcategory.menu || "",
                _id: subcategory._id,
            };

            return res.status(200).json({
                message: "Subcategory fetched successfully.",
                subCategory: responseSubCategory,
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


const getEditFoodAndBeverageById = async (req, res) => {
    try {
        const { id } = req.params;

        // Attempt to find a category by its ID
        const category = await FoodAndBeverage.findById(id)
        // .populate('name', '_id name') // Populate the Restaurant reference in the "name" field
        // .populate('subCategories.name', '_id name') // Populate the "name" field in each subCategory

        if (category) {
            // Structuring the response to match the required format for a category
            // const responseCategory = {
            //     _id: category._id,
            //     name: category.name ? category.name.name : "N/A",
            //     nameId: category.name ? category.name._id : null,
            //     description: category.description || "",
            //     location: category.location || "",
            //     extansion_no: category.extansion_no || "",
            //     bannerImage: category.bannerImage || "",
            //     mainmenu: category.mainmenu || null,
            //     subCategories: category.subCategories.map(sub => ({
            //         _id: sub._id,
            //         name: sub.name ? sub.name.name : "N/A",
            //         nameId: sub.name ? sub.name._id : null,
            //         description: sub.description || "",
            //         location: sub.location || "",
            //         extansion_no: sub.extansion_no || "",
            //         images: sub.images || [],
            //         menu: sub.menu || "",
            //         timings: sub.timings.map(timing => ({
            //             title: timing.title || "",
            //             startDay: timing.startDay || "",
            //             endDay: timing.endDay || "",
            //             startTime: timing.startTime || "",
            //             endTime: timing.endTime || "",
            //             _id: timing._id,
            //         })),

            //     })),
            //     timings: category.timings || [],
            //     status: category.status || "Active",
            //     createdAt: category.createdAt,
            //     updatedAt: category.updatedAt,
            //     __v: category.__v || 0,
            // };

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

            // Structuring the response to match the required format for a subcategory
            const responseSubCategory = {
                description: subcategory.description || "",
                timings: subcategory.timings.map(timing => ({
                    title: timing.title || "",
                    startDay: timing.startDay || "",
                    endDay: timing.endDay || "",
                    startTime: timing.startTime || "",
                    endTime: timing.endTime || "",
                    _id: timing._id,
                })),
                location: subcategory.location || "",
                extansion_no: subcategory.extansion_no || "",
                images: subcategory.images || [],
                menu: subcategory.menu || "",
                _id: subcategory._id,
            };

            return res.status(200).json({
                message: "Subcategory fetched successfully.",
                subCategory: responseSubCategory,
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
        // Fetch all food and beverages with population of necessary fields
        const foodAndBeveragesdata = await FoodAndBeverage.find({})
            .populate('name', '_id name') // Populate the Restaurant reference in the "name" field
            .populate('subCategories.name', '_id name') // Populate the "name" field in each subCategory
            .sort({ createdAt: -1 });

        // Structuring the response to match the desired format
        const responseData = foodAndBeveragesdata.map(fb => ({
            _id: fb._id,
            name: fb.name ? fb.name.name : "N/A",
            nameId: fb.name ? fb.name._id : null,
            location: fb.location || "",
            extansion_no: fb.extansion_no || "",
            description: fb.description || "",
            bannerImage: fb.bannerImage || "",
            mainmenu: fb.mainmenu || null,
            timings: fb.timings || [],
            subCategories: fb.subCategories.map(sub => ({
                _id: sub._id,
                name: sub.name ? sub.name.name : "N/A",
                nameId: sub.name ? sub.name._id : null,
                description: sub.description || "",
                location: sub.location || "",
                extansion_no: sub.extansion_no || "",
                images: sub.images || [],
                menu: sub.menu || "",
                timings: sub.timings.map(timing => ({
                    title: timing.title || "",
                    startDay: timing.startDay || "",
                    endDay: timing.endDay || "",
                    startTime: timing.startTime || "",
                    endTime: timing.endTime || "",
                    _id: timing._id,
                })),

            })),
            status: fb.status || "Active",
            createdAt: fb.createdAt,
            updatedAt: fb.updatedAt,
            __v: fb.__v || 0,
        }));

        // Send the structured response
        res.status(200).json({
            message: "Food & Beverage category fetched successfully.",
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

// const getActiveFoodAndBeverages = async (req, res) => {
//     try {
//         const { page = 1, limit = 5 } = req.query;

//         // Convert query parameters to integers
//         const pageNumber = parseInt(page, 10) || 1;
//         const limitNumber = parseInt(limit, 10) || 5;
//         const skip = (pageNumber - 1) * limitNumber;

//         // Fetch active Food and Beverage categories
//         const activeFoodAndBeverages = await FoodAndBeverage.find({ status: "Active" })
//             .sort({ createdAt: -1 }) // Sort by creation date (newest first)
//             .skip(skip)
//             .limit(limitNumber);

//         // Count total active categories for pagination
//         const totalItems = await FoodAndBeverage.countDocuments({ status: "Active" });

//         // Prepare the response
//         res.status(200).json({
//             message: "Active Food and Beverage categories fetched successfully.",
//             foodAndBeverages: activeFoodAndBeverages,
//             pagination: {
//                 totalItems,
//                 currentPage: pageNumber,
//                 totalPages: Math.ceil(totalItems / limitNumber),
//                 limit: limitNumber,
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching active Food and Beverage categories:", error);
//         res.status(500).json({
//             message: "Failed to fetch active Food and Beverage categories.",
//             error: error.message,
//         });
//     }
// };

const getActiveFoodAndBeverages = async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;

        // Convert query parameters to integers
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 5;
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch active Food and Beverage categories with necessary populations
        const activeFoodAndBeveragesData = await FoodAndBeverage.find({ status: "Active" })
            .populate('name', '_id name') // Populate the Restaurant reference in the "name" field
            .populate('subCategories.name', '_id name') // Populate the "name" field in each subCategory
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        // Count total active categories for pagination
        const totalItems = await FoodAndBeverage.countDocuments({ status: "Active" });

        // Structure the response to match the desired format
        const responseData = activeFoodAndBeveragesData.map(fb => ({
            _id: fb._id,
            name: fb.name ? fb.name.name : "N/A",
            nameId: fb.name ? fb.name._id : null,
            location: fb.location || "",
            extansion_no: fb.extansion_no || "",
            description: fb.description || "",
            bannerImage: fb.bannerImage || "",
            mainmenu: fb.mainmenu || null,
            timings: fb.timings || [],
            subCategories: fb.subCategories.map(sub => ({
                _id: sub._id,
                name: sub.name ? sub.name.name : "N/A",
                nameId: sub.name ? sub.name._id : null,
                description: sub.description || "",
                location: sub.location || "",
                extansion_no: sub.extansion_no || "",
                images: sub.images || [],
                menu: sub.menu || "",
                timings: sub.timings.map(timing => ({
                    title: timing.title || "",
                    startDay: timing.startDay || "",
                    endDay: timing.endDay || "",
                    startTime: timing.startTime || "",
                    endTime: timing.endTime || "",
                    _id: timing._id,
                })),
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
module.exports = {
    addFoodAndBeverage,
    updateFoodAndBeverage,
    getAllFoodAndBeverages,
    getFoodAndBeverageById,
    getEditFoodAndBeverageById,
    deleteFoodAndBeverage,
    getActiveFoodAndBeverages
};
