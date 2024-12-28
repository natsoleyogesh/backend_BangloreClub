const Restaurant = require("../../models/restaurant");
const { toTitleCase } = require("../../utils/common");

// Create a new restaurant
const createRestaurant = async (req, res) => {
    try {
        const { name, status } = req.body;

        const normalizedName = toTitleCase(name);


        // Check if restaurant already exists
        const existingRestaurant = await Restaurant.findOne({ name: normalizedName, isDeleted: false });
        if (existingRestaurant) {
            return res.status(400).json({ message: 'Restaurant already exists.' });
        }

        // Create and save the new restaurant
        const restaurant = new Restaurant({ name, status });
        await restaurant.save();

        return res.status(201).json({ message: "Restaurant Add Succesffully", restaurant });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get all restaurants, excluding soft deleted ones
const getAllRestaurants = async (req, res) => {
    try {
        // Fetch all restaurants that are not marked as deleted, sorted by `createdAt` in descending order
        const restaurants = await Restaurant.find({ isDeleted: false }).sort({ createdAt: -1 });

        return res.status(200).json({ message: "All Restaurants", restaurants });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get restaurant by ID
const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found.' });
        }

        return res.status(200).json({ message: "Restaurant Details", restaurant });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Update restaurant by ID
const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, status } = req.body;

        const updateData = {};
        if (name) {
            name = toTitleCase(name);

            // Check if a category with the same name (case-insensitive) already exists (excluding current category)
            const existingAmenities = await Restaurant.findOne({
                name,
                _id: { $ne: id }, // Exclude the current category
                isDeleted: false // Check only non-deleted categories
            });

            if (existingAmenities) {
                return res.status(400).json({ message: 'Reastaurant with this name already exists.' });
            }

            // Add normalized name to updates
            updateData.name = name;
        }
        if (status) {
            updateData.status = status
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            id,
            updateData,
            { new: true }  // Return the updated document
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ message: 'Restaurant not found.' });
        }

        return res.status(200).json({ message: "Restaurant Update Successfully", updatedRestaurant });
    } catch (err) {
        console.log(err, "err")
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Soft delete restaurant by ID
const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found.' });
        }

        // Mark the restaurant as deleted (soft delete)
        restaurant.isDeleted = true;
        await restaurant.save();

        return res.status(200).json({ message: 'Restaurant deleted successfully.' });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

// Get all active restaurants, excluding soft deleted ones
const getActiveRestaurants = async (req, res) => {
    try {
        const activeRestaurants = await Restaurant.find({ status: 'active', isDeleted: false })
            .sort({ createdAt: -1 }); // Sort by creation date in descending order
        return res.status(200).json({ message: "Active Restaurants", activeRestaurants });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
};

module.exports = {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getActiveRestaurants
};
