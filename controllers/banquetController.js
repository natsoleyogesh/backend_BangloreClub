const { default: mongoose } = require("mongoose");
const BanquetCategory = require("../models/banquetCategory");
const Banquet = require("../models/banquets");
const BanquetBooking = require("../models/banquetBooking");
const path = require("path");
const fs = require("fs");
const QRCodeHelper = require('../utils/helper');
const banquet = require("../models/banquets");
const moment = require('moment');
const { addBilling } = require("./billingController");
const emailTemplates = require("../utils/emailTemplates");
const { banquetrenderTemplate } = require("../utils/templateRenderer");
const sendEmail = require("../utils/sendMail");
const { createNotification } = require("../utils/pushNotification");
const { createRequest, updateRequest } = require("./allRequestController");
const AllRequest = require("../models/allRequest");
const { toTitleCase } = require("../utils/common");
const Admin = require("../models/Admin");
const Department = require("../models/department");
const User = require("../models/user");
const { sendSMSViaPOST } = require("../utils/sendOtp");
const { validateBookingDates } = require("./commonController");

// Banquet Category APIs Functions

const addCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        // Normalize the name to Title Case
        const normalizedName = toTitleCase(name);
        // Check if category already exists
        const existingCategory = await BanquetCategory.findOne({ name: normalizedName, isDeleted: false });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists but Inactive.' });
        }

        const newCategory = new BanquetCategory({
            name,
            description,
            status,
        });

        await newCategory.save();
        res.status(201).json({ message: 'Banquet Category created successfully.', category: newCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating category.' });
    }
}


const getAllCategory = async (req, res) => {
    try {
        let { status, page, limit } = req.query;

        // Convert query parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Build query based on status if provided
        let query = {};
        if (status) {
            query.status = status;
        }

        // Get total count of matching categories
        const totalCategories = await BanquetCategory.countDocuments(query);
        const totalPages = Math.ceil(totalCategories / limit);

        // Fetch paginated categories
        const categories = await BanquetCategory.find(query)
            .sort({ createdAt: -1 })  // Sorting by newest first
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: 'Categories fetched successfully.',
            categories,
            pagination: {
                currentPage: page,
                totalPages,
                totalCategories,
                pageSize: limit,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching categories.' });
    }
};


const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Please Provide The Id.' });
        }
        const category = await BanquetCategory.findById(id);
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
        let { name, ...updates } = req.body;

        // Normalize the name to Title Case if it's being updated
        if (name) {
            name = toTitleCase(name);

            // Check if a category with the same name already exists (excluding the current category)
            const existingCategory = await BanquetCategory.findOne({
                name,
                _id: { $ne: id }, // Exclude the current category from the search
                isDeleted: false // Ensure it's not a deleted category
            });

            if (existingCategory) {
                return res.status(400).json({ message: 'Category with this name already exists.' });
            }
        }

        // Include normalized name in the updates if it exists
        if (name) {
            updates.name = name;
        }

        // Filter the updates to include only the fields provided in the request body
        const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
            if (updates[key] !== undefined) {
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        // Update the category with the filtered updates
        const updatedCategory = await BanquetCategory.findByIdAndUpdate(id, filteredUpdates, {
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
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Please Provide The Id.' });
        }
        const deletedCategory = await BanquetCategory.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category Delete successfully.', deletedCategory });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting category.' });
    }
}

// Banquet Creation APIs Functions

const createBanquet = async (req, res) => {
    try {
        const {
            banquetName,
            description,
            // checkInTime,
            // checkOutTime,
            maxAllowedPerRoom,
            minAllowedPerRoom,
            priceRange,
            pricingDetails,
            specialDayTariff,
            taxTypes,
            amenities,
            cancellationPolicy,
            breakfastIncluded,
            banquetHallSize,
            features,
            status,
            pricingDetailDescription,
            billable,
            guideline,
            priority
        } = req.body;

        // Validate banquet name
        if (!banquetName) {
            return res.status(400).json({ message: 'Banquet name is required.' });
        }

        // Validate banquet category
        const checkBanquetCategory = await BanquetCategory.findById(banquetName).exec();
        if (!checkBanquetCategory) {
            return res.status(400).json({ message: 'Invalid Banquet Name' });
        }

        // Check if banquet already exists
        const existingBanquet = await Banquet.findOne({ banquetName });
        if (existingBanquet) {
            return res.status(400).json({ message: 'Banquet with this name already exists.' });
        }

        // Validate and parse price range
        let parsedPriceRange = typeof priceRange === 'string' ? JSON.parse(priceRange) : priceRange;
        if (parsedPriceRange) {
            parsedPriceRange = {
                minPrice: parseFloat(parsedPriceRange.minPrice),
                maxPrice: parseFloat(parsedPriceRange.maxPrice),
            };
            if (parsedPriceRange.minPrice < 0 || parsedPriceRange.maxPrice < 0) {
                return res.status(400).json({ message: 'Price range cannot be negative.' });
            }
            if (parsedPriceRange.minPrice > parsedPriceRange.maxPrice) {
                return res.status(400).json({ message: 'Min price cannot be greater than max price.' });
            }
        }

        // Parse and validate pricing details
        const parsedPricingDetails = Array.isArray(pricingDetails)
            ? pricingDetails
            : typeof pricingDetails === 'string'
                ? JSON.parse(pricingDetails)
                : [];
        const validPricingDetails = parsedPricingDetails.map(detail => ({
            days: detail.days || [],
            timeSlots: detail.timeSlots || [],
            price: parseFloat(detail.price),
        }));

        // Parse and validate special day tariff
        const parsedSpecialDayTariff = Array.isArray(specialDayTariff)
            ? specialDayTariff
            : typeof specialDayTariff === 'string'
                ? JSON.parse(specialDayTariff)
                : [];
        const validSpecialDayTariff = parsedSpecialDayTariff.map(tariff => ({
            special_day_name: tariff.special_day_name || '',
            startDate: new Date(tariff.startDate),
            endDate: new Date(tariff.endDate),
            extraCharge: parseFloat(tariff.extraCharge),
        }));

        // Parse and validate tax types and amenities
        const parsedTaxTypes = Array.isArray(taxTypes)
            ? taxTypes
            : typeof taxTypes === 'string'
                ? JSON.parse(taxTypes)
                : [];
        const parsedAmenities = Array.isArray(amenities)
            ? amenities
            : typeof amenities === 'string'
                ? JSON.parse(amenities)
                : [];

        // Parse and validate cancellation policy
        const parsedCancellationPolicy = typeof cancellationPolicy === 'string'
            ? JSON.parse(cancellationPolicy)
            : cancellationPolicy || {};
        const validCancellationPolicy = {
            before7Days: parsedCancellationPolicy.before7Days || 0,
            between7To2Days: parsedCancellationPolicy.between7To2Days || 25,
            between48To24Hours: parsedCancellationPolicy.between48To24Hours || 50,
            lessThan24Hours: parsedCancellationPolicy.lessThan24Hours || 100,
        };

        // Parse features
        const parsedFeatures = typeof features === 'string'
            ? JSON.parse(features)
            : features || {
                smokingAllowed: false,
                petFriendly: false,
                accessible: false,
            };

        if (req.files.length > 6) {
            return res.status(400).json({
                message: 'Only 6 Images Are Allowed!',
            });
        }
        // Parse and handle images
        const images = req.files ? req.files.map(file => `/${file.path.replace(/\\/g, '/')}`) : [];
        // let billableDate = null;
        // if (billable === true) {
        //     billableDate = Date.now()
        // }
        const parsedBillable = typeof billable === 'string'
            ? JSON.parse(billable)
            : billable

        let billableDate = parsedBillable ? Date.now() : null;
        // Create new banquet instance
        const newBanquet = new Banquet({
            banquetName,
            description: description || '',
            // checkInTime,
            // checkOutTime,
            maxAllowedPerRoom,
            minAllowedPerRoom,
            images,
            priceRange: parsedPriceRange,
            pricingDetails: validPricingDetails,
            specialDayTariff: validSpecialDayTariff,
            taxTypes: parsedTaxTypes,
            amenities: parsedAmenities,
            cancellationPolicy: validCancellationPolicy,
            breakfastIncluded: breakfastIncluded === 'true', // Convert string to boolean
            banquetHallSize: parseFloat(banquetHallSize),
            features: parsedFeatures,
            status: status || 'Active',
            pricingDetailDescription,
            billable: parsedBillable,
            billableDate,
            guideline,
            priority
        });

        // Save the new banquet
        await newBanquet.save();

        return res.status(201).json({
            message: 'Banquet created successfully.',
            banquet: newBanquet,
        });
    } catch (error) {
        console.error('Error creating banquet:', error);
        return res.status(500).json({
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

const getAllBanquets = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Convert query parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Define the filter to exclude deleted records
        const filter = { isDeleted: false };

        // Fetch total count of banquets
        const totalBanquets = await Banquet.countDocuments(filter);
        const totalPages = Math.ceil(totalBanquets / limit);

        // Fetch paginated banquets with related data
        const banquets = await Banquet.find(filter)
            .populate('banquetName') // Populate specific fields
            .populate('taxTypes') // Populate taxTypes
            .populate('amenities') // Populate amenities
            .sort({ createdAt: -1 }) // Sort by creation date
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            message: "Banquets fetched successfully.",
            data: banquets,
            pagination: {
                currentPage: page,
                totalPages,
                totalBanquets,
                pageSize: limit,
            }
        });
    } catch (error) {
        console.error("Error fetching banquets:", error);
        return res.status(500).json({
            message: "Server error while fetching banquets.",
            error: error.message,
        });
    }
};



const getBanquetById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the banquet by ID and populate related fields
        const banquet = await Banquet.findById(id)
            .populate('banquetName')
            .populate('taxTypes')
            .populate('amenities');

        // Check if the banquet exists and is not deleted
        if (!banquet || banquet.isDeleted) {
            return res.status(404).json({
                message: 'Banquet not found or has been deleted.',
            });
        }

        return res.status(200).json({
            message: 'Banquet fetched successfully.',
            data: banquet,
        });
    } catch (error) {
        console.error('Error fetching banquet by ID:', error);
        return res.status(500).json({
            message: 'Server error while fetching banquet.',
            error: error.message,
        });
    }
};

const getBanquetEditDetailsById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the banquet by ID and populate related fields
        const banquet = await Banquet.findById(id)

        // Check if the banquet exists and is not deleted
        if (!banquet || banquet.isDeleted) {
            return res.status(404).json({
                message: 'Banquet not found or has been deleted.',
            });
        }

        return res.status(200).json({
            message: 'Banquet fetched successfully.',
            data: banquet,
        });
    } catch (error) {
        console.error('Error fetching banquet by ID:', error);
        return res.status(500).json({
            message: 'Server error while fetching banquet.',
            error: error.message,
        });
    }
};


const deleteBanquet = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the banquet by ID
        const banquet = await Banquet.findById(id);

        // Check if the banquet exists and is not already deleted
        if (!banquet || banquet.isDeleted) {
            return res.status(404).json({
                message: 'Banquet not found or already deleted.',
            });
        }

        // Mark the banquet as deleted (soft delete)
        banquet.isDeleted = true;
        await banquet.save();

        return res.status(200).json({
            message: 'Banquet deleted successfully.',
            data: banquet,
        });
    } catch (error) {
        console.error('Error deleting banquet:', error);
        return res.status(500).json({
            message: 'Server error while deleting banquet.',
            error: error.message,
        });
    }
};


const deleteBanquetImage = async (req, res) => {
    const { banquetId, index } = req.params;

    try {
        // Find the banquet by ID
        const banquet = await Banquet.findById(banquetId);
        if (!banquet) {
            return res.status(404).json({ message: "Banquet not found." });
        }

        // Validate the index
        if (index < 0 || index >= banquet.images.length) {
            return res.status(400).json({ message: "Invalid image index." });
        }

        // Get the image path
        const imagePath = banquet.images[index];

        // Remove the image from the array
        banquet.images.splice(index, 1);

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


const uploadBanquetImage = async (req, res) => {
    const { banquetId } = req.params;

    try {
        // Find the banquet by ID
        const banquet = await Banquet.findById(banquetId);
        if (!banquet) {
            return res.status(404).json({ message: "Banquet not found." });
        }

        // Check if images are provided
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please provide banquet images!" });
        }


        const totalImages = banquet.images.length + req.files.length;
        if (totalImages > 6) {
            return res.status(400).json({
                message: `Only 6 Images Are allowed ${banquet.images.length} Are Availble, Please Select the only (${6 - banquet.images.length})`,
            });
        }

        // Extract image file paths and ensure cross-platform compatibility
        const imagePaths = req.files.map((file) => `/${file.path.replace(/\\/g, '/')}`);

        // Add the new images to the banquet's images array
        banquet.images.push(...imagePaths);

        // Save the updated banquet
        await banquet.save();

        return res.status(200).json({
            message: "Images uploaded successfully.",
            images: imagePaths,
        });
    } catch (error) {
        console.error("Error uploading images:", error);
        return res.status(500).json({
            message: "Failed to upload images.",
            error: error.message,
        });
    }
};


const updateBanquet = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            banquetName,
            description,
            // checkInTime,
            // checkOutTime,
            maxAllowedPerRoom,
            minAllowedPerRoom,
            priceRange,
            pricingDetails,
            specialDayTariff,
            taxTypes,
            amenities,
            cancellationPolicy,
            breakfastIncluded,
            banquetHallSize,
            features,
            status,
            pricingDetailDescription,
            billable,
            guideline,
            priority
        } = req.body;

        // Find the banquet by ID
        const banquet = await Banquet.findById(id);

        if (!banquet || banquet.isDeleted) {
            return res.status(404).json({ message: 'Banquet not found or has been deleted.' });
        }

        // Validate and parse price range
        let parsedPriceRange = priceRange;
        if (priceRange && typeof priceRange === 'string') {
            parsedPriceRange = JSON.parse(priceRange);
        }
        if (parsedPriceRange) {
            if (parsedPriceRange.minPrice < 0 || parsedPriceRange.maxPrice < 0) {
                return res.status(400).json({ message: 'Price range cannot be negative.' });
            }
            if (parsedPriceRange.minPrice > parsedPriceRange.maxPrice) {
                return res.status(400).json({ message: 'Min price cannot be greater than max price.' });
            }
        }

        // Parse pricing details
        let parsedPricingDetails = pricingDetails;
        if (pricingDetails && typeof pricingDetails === 'string') {
            parsedPricingDetails = JSON.parse(pricingDetails);
        }
        if (parsedPricingDetails) {
            parsedPricingDetails = parsedPricingDetails.map(detail => ({
                days: detail.days || [],
                timeSlots: detail.timeSlots || [],
                price: parseFloat(detail.price),
            }));
        }

        // Parse special day tariff
        let parsedSpecialDayTariff = specialDayTariff;
        if (specialDayTariff && typeof specialDayTariff === 'string') {
            parsedSpecialDayTariff = JSON.parse(specialDayTariff);
        }
        if (parsedSpecialDayTariff) {
            parsedSpecialDayTariff = parsedSpecialDayTariff.map(tariff => ({
                special_day_name: tariff.special_day_name || '',
                startDate: tariff.startDate ? new Date(tariff.startDate) : null,
                endDate: tariff.endDate ? new Date(tariff.endDate) : null,
                extraCharge: tariff.extraCharge ? parseFloat(tariff.extraCharge) : 0,
            }));
        }

        // Parse tax types and amenities
        const parsedTaxTypes = taxTypes
            ? Array.isArray(taxTypes)
                ? taxTypes
                : typeof taxTypes === 'string'
                    ? taxTypes.split(',').map(id => id.trim())
                    : []
            : undefined;

        const parsedAmenities = amenities
            ? Array.isArray(amenities)
                ? amenities
                : typeof amenities === 'string'
                    ? amenities.split(',').map(id => id.trim())
                    : []
            : undefined;

        // Parse cancellation policy
        let parsedCancellationPolicy = cancellationPolicy;
        if (cancellationPolicy && typeof cancellationPolicy === 'string') {
            parsedCancellationPolicy = JSON.parse(cancellationPolicy);
        }

        // Parse features
        let parsedFeatures = features;
        if (features && typeof features === 'string') {
            parsedFeatures = JSON.parse(features);
        }

        // let billableDate = null;
        // if (billable !== undefined && billable === true) {
        //     billableDate = new Date();
        // }
        let parsedBillable = billable;

        if (billable && typeof billable === 'string') {
            parsedBillable = JSON.parse(billable);
        }

        let billableDate = parsedBillable ? Date.now() : null;


        // Update only provided fields
        if (banquetName) banquet.banquetName = banquetName;
        if (description) banquet.description = description;
        // if (checkInTime) banquet.checkInTime = checkInTime;
        // if (checkOutTime) banquet.checkOutTime = checkOutTime;
        if (maxAllowedPerRoom) banquet.maxAllowedPerRoom = maxAllowedPerRoom;
        if (minAllowedPerRoom) banquet.minAllowedPerRoom = minAllowedPerRoom;
        if (parsedPriceRange) banquet.priceRange = parsedPriceRange;
        if (parsedPricingDetails) banquet.pricingDetails = parsedPricingDetails;
        if (parsedSpecialDayTariff) banquet.specialDayTariff = parsedSpecialDayTariff;
        if (parsedTaxTypes) banquet.taxTypes = parsedTaxTypes;
        if (parsedAmenities) banquet.amenities = parsedAmenities;
        if (parsedCancellationPolicy) banquet.cancellationPolicy = parsedCancellationPolicy;
        if (breakfastIncluded !== undefined) banquet.breakfastIncluded = breakfastIncluded === 'true';
        if (banquetHallSize) banquet.banquetHallSize = parseFloat(banquetHallSize);
        if (parsedFeatures) banquet.features = parsedFeatures;
        if (status) banquet.status = status;
        if (pricingDetailDescription) banquet.pricingDetailDescription = pricingDetailDescription;
        if (parsedBillable !== undefined) banquet.billable = parsedBillable;
        if (guideline) banquet.guideline = guideline;
        if (priority) banquet.priority = priority;
        // Always update `billableDate`, even if it's null
        banquet.billableDate = billableDate;

        // Save the updated banquet
        await banquet.save();

        return res.status(200).json({
            message: 'Banquet updated successfully.',
            banquet,
        });
    } catch (error) {
        console.error('Error updating banquet:', error);
        return res.status(500).json({
            message: 'Server error while updating banquet.',
            error: error.message,
        });
    }
};

//  Banquet Booking APIS Functions

const getActiveBanquets = async (req, res) => {
    try {
        const { checkIn, checkOut, from, to, attendingGuestCount, banquetType } = req.query;

        // Validate required input
        if (!checkIn || !checkOut || !from || !to || !attendingGuestCount) {
            return res.status(400).json({
                message: 'Missing required fields: checkIn, checkOut, from, to, attendingGuestCount',
            });
        }


        // Validate Dates Using Function
        const validationBookingDate = await validateBookingDates(checkIn, checkOut);

        if (!validationBookingDate.success) {
            return res.status(400).json({ message: validationBookingDate.message });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Validate date range
        if (isNaN(checkInDate) || isNaN(checkOutDate) || checkInDate > checkOutDate) {
            return res.status(400).json({ message: 'Invalid check-in or check-out dates.' });
        }

        // Parse and validate time inputs
        const [fromHours, fromMinutes] = from.split(':').map(Number);
        const [toHours, toMinutes] = to.split(':').map(Number);

        if (isNaN(fromHours) || isNaN(fromMinutes) || isNaN(toHours) || isNaN(toMinutes)) {
            return res.status(400).json({ message: 'Invalid time format for "from" or "to".' });
        }

        const guestCount = parseInt(attendingGuestCount, 10);
        if (isNaN(guestCount) || guestCount <= 0) {
            return res.status(400).json({ message: 'Invalid attending guest count.' });
        }

        // // Filter banquets by type and size
        // const filter = {
        //     isDeleted: false,
        //     maxAllowedPerRoom: { $gte: guestCount },
        // };
        const filter = {
            isDeleted: false,
            minAllowedPerRoom: { $lte: guestCount }, // Guest count is greater than or equal to minAllowedPerRoom
            maxAllowedPerRoom: { $gte: guestCount }, // Guest count is less than or equal to maxAllowedPerRoom
        };

        if (banquetType) {
            filter._id = banquetType;
        }

        const banquets = await Banquet.find(filter).populate('banquetName taxTypes amenities').sort({ banquetName: 1 });

        if (banquets.length === 0) {
            return res.status(404).json({ message: 'No banquets available for the specified criteria.' });
        }

        const availableBanquets = [];

        for (const banquet of banquets) {
            const bookingDay = checkInDate.toLocaleString('en-US', { weekday: 'long' });

            // Find all applicable pricing for the booking day
            const applicablePricing = banquet.pricingDetails.filter(pricing => pricing.days.includes(bookingDay));

            if (!applicablePricing || applicablePricing.length === 0) continue;

            let isAvailable = false; // Track availability for this banquet
            for (const pricing of applicablePricing) {
                const matchingSlots = pricing.timeSlots.filter(slot => {
                    const [slotStartHours, slotStartMinutes] = slot.start.split(':').map(Number);
                    const [slotEndHours, slotEndMinutes] = slot.end.split(':').map(Number);

                    const slotStart = slotStartHours * 60 + slotStartMinutes;
                    const slotEnd = slotEndHours * 60 + slotEndMinutes;

                    const requestedStart = fromHours * 60 + fromMinutes;
                    const requestedEnd = toHours * 60 + toMinutes;

                    return requestedStart < slotEnd && requestedEnd > slotStart; // Overlap logic
                });

                if (matchingSlots.length > 0) {
                    console.log("Matching Slots:", matchingSlots);

                    // Check for overlapping bookings for each slot
                    const overlappingBookings = await BanquetBooking.find({
                        banquetType: banquet._id,
                        isDeleted: false,
                    });

                    const isBookingTimeAvailable = !overlappingBookings.some(booking => {
                        const bookingCheckInDate = new Date(booking.bookingDates.checkIn).toISOString().split('T')[0];
                        const bookingCheckOutDate = new Date(booking.bookingDates.checkOut).toISOString().split('T')[0];

                        const requestedCheckInDate = new Date(checkInDate).toISOString().split('T')[0];
                        const requestedCheckOutDate = new Date(checkOutDate).toISOString().split('T')[0];

                        const isDateOverlap =
                            requestedCheckInDate <= bookingCheckOutDate &&
                            requestedCheckOutDate >= bookingCheckInDate;

                        if (!isDateOverlap) return false;

                        const [bookingFromHours, bookingFromMinutes] = booking.bookingTime.from.split(':').map(Number);
                        const [bookingToHours, bookingToMinutes] = booking.bookingTime.to.split(':').map(Number);

                        const bookingStart = bookingFromHours * 60 + bookingFromMinutes;
                        const bookingEnd = bookingToHours * 60 + bookingToMinutes;

                        const requestedStart = fromHours * 60 + fromMinutes;
                        const requestedEnd = toHours * 60 + toMinutes;

                        const isTimeOverlap = requestedStart < bookingEnd && requestedEnd > bookingStart;

                        return isDateOverlap && isTimeOverlap;
                    });

                    if (isBookingTimeAvailable) {
                        isAvailable = true;
                        break; // Stop checking further slots for this pricing
                    }
                }
            }

            if (isAvailable) {
                availableBanquets.push(banquet);
            }
        }

        if (availableBanquets.length === 0) {
            return res.status(404).json({ message: 'No available banquets found for the specified criteria.' });
        }

        return res.status(200).json({
            message: 'Available banquets fetched successfully.',
            data: availableBanquets,
        });
    } catch (error) {
        console.error('Error fetching available banquets:', error);
        return res.status(500).json({
            message: 'Internal server error while fetching banquets.',
            error: error.message,
        });
    }
};

const createBanquetBooking = async (req, res) => {
    try {
        // Destructure the request body
        const {
            primaryMemberId,
            invitationOfmember,
            officePhoneNumber,
            mobileNumber,
            residencePhoneNo,
            address,
            occasion,
            attendingGuests,
            banquetType,
            bookingDates,
            bookingTime,
            paymentMode
        } = req.body;

        // Validate primary member
        if (!primaryMemberId) {
            return res.status(400).json({ message: 'Primary member ID is required.' });
        }

        // Validate banquet type
        const banquet = await Banquet.findById(banquetType)
            .populate('banquetName')
            .populate('pricingDetails').populate('specialDayTariff').populate('taxTypes');
        if (!banquet) {
            return res.status(400).json({ message: 'Invalid banquet type.' });
        }

        const billable = banquet.billable;
        const billableDate = banquet.billableDate;

        // Validate booking dates
        const checkInDate = new Date(bookingDates.checkIn);
        const checkOutDate = new Date(bookingDates.checkOut);

        if (isNaN(checkInDate) || isNaN(checkOutDate)) {
            return res.status(400).json({ message: 'Invalid check-in or check-out dates.' });
        }

        // Validate booking time
        const { from, to } = bookingTime;
        if (!from || !to) {
            return res.status(400).json({ message: 'Booking time from and to are required.' });
        }

        const [fromHours, fromMinutes] = from.split(':').map(Number);
        const [toHours, toMinutes] = to.split(':').map(Number);
        if (
            isNaN(fromHours) ||
            isNaN(fromMinutes) ||
            isNaN(toHours) ||
            isNaN(toMinutes) ||
            fromHours > toHours ||
            (fromHours === toHours && fromMinutes >= toMinutes)
        ) {
            return res.status(400).json({ message: 'Invalid booking time.' });
        }

        // Calculate duration
        const durationInHours = (toHours * 60 + toMinutes - (fromHours * 60 + fromMinutes)) / 60;

        // Calculate pricing based on the day and time slots
        const bookingDay = checkInDate.toLocaleString('en-US', { weekday: 'long' });

        const applicablePricing = banquet.pricingDetails.filter(pricing => pricing.days.includes(bookingDay));

        if (!applicablePricing && applicablePricing.length === 0) {
            return res.status(400).json({ message: 'No pricing details available for the selected day.' });
        }

        let isAvailable = false;
        let finalPrice = 0;
        for (const pricing of applicablePricing) {
            const timeSlot = pricing.timeSlots.find(slot => {
                // Parse slot start and end times
                const parseTime = timeStr => {
                    const [time, modifier] = timeStr.split(' ');
                    let [hours, minutes] = time.split(':').map(Number);

                    if (modifier === 'PM' && hours !== 12) {
                        hours += 12; // Convert PM to 24-hour format
                    }
                    if (modifier === 'AM' && hours === 12) {
                        hours = 0; // Handle midnight
                    }

                    return { hours, minutes };
                };

                const { hours: slotStartHours, minutes: slotStartMinutes } = parseTime(slot.start);
                const { hours: slotEndHours, minutes: slotEndMinutes } = parseTime(slot.end);

                const slotStartTotalMinutes = slotStartHours * 60 + slotStartMinutes;
                const slotEndTotalMinutes = slotEndHours * 60 + slotEndMinutes;

                // Booking start and end times
                const bookingStartTotalMinutes = fromHours * 60 + fromMinutes;
                const bookingEndTotalMinutes = toHours * 60 + toMinutes;

                return (
                    bookingStartTotalMinutes >= slotStartTotalMinutes &&
                    bookingEndTotalMinutes <= slotEndTotalMinutes
                    // bookingStartTotalMinutes < slotEndTotalMinutes && bookingEndTotalMinutes > slotStartTotalMinutes
                );

            });

            if (timeSlot) {
                isAvailable = true;
                finalPrice = pricing.price;
                break; // Stop checking further slots for this pricing
            }
        }



        if (!isAvailable) {
            return res.status(400).json({ message: 'No pricing details available for the selected time slot.' });
        }

        // let totalAmount = applicablePricing.price;
        let totalAmount = finalPrice;

        let specialDayExtraCharge = 0;
        if (banquet.specialDayTariff && Array.isArray(banquet.specialDayTariff)) {
            banquet.specialDayTariff.forEach((specialDay) => {
                const start = new Date(specialDay.startDate);
                const end = new Date(specialDay.endDate);
                if (checkInDate >= start && checkOutDate <= end) {
                    specialDayExtraCharge += (totalAmount * specialDay.extraCharge) / 100;
                }
            });
        }

        // totalAmount += specialDayExtraCharge;


        // Calculate tax details
        let totalTaxAmount = 0;
        let taxDetails = [];
        banquet.taxTypes.forEach(tax => {
            const taxAmount = ((totalAmount + specialDayExtraCharge) * tax.percentage) / 100;
            totalTaxAmount += taxAmount;
            taxDetails.push({
                taxType: tax.name,
                taxRate: tax.percentage,
                taxAmount: taxAmount,
            });
        });

        const finalTotalAmount = totalAmount + specialDayExtraCharge + totalTaxAmount;

        // Generate a unique QR code for the booking
        const uniqueNumber = Math.floor(Math.random() * 10000000000); // Generates a random 10-digit number
        const uniqueQRCode = `QR${uniqueNumber}`; // The unique QR code string (QR + 10-digit number)
        const allDetailsQRCodeData = {
            uniqueQRCode,
            primaryMemberId,
            invitationOfmember,
            officePhoneNumber,
            mobileNumber,
            residencePhoneNo,
            address,
            occasion,
            attendingGuests,
            banquetType,
            banquetName: banquet.banquetName,
            banquetPrice: totalAmount,
            bookingDates: {
                checkIn: bookingDates.checkIn,
                checkOut: bookingDates.checkOut,
                dayStay: Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24))
            },
            bookingTime: {
                from,
                to,
                duration: durationInHours
            },
            pricingDetails: {
                totalAmount,
                specialDayExtraCharge,
                totalTaxAmount,
                final_totalAmount: finalTotalAmount,
                taxTypes: taxDetails,
            },
            paymentMode,
            paymentStatus: 'Pending',
            bookingStatus: 'Pending',
        };
        const allDetailsQRCode = await QRCodeHelper.generateQRCode(allDetailsQRCodeData);



        const bookingId = QRCodeHelper.generateBookingId();
        // Create banquet booking object
        const banquetBooking = new BanquetBooking({
            booking_id: bookingId,
            primaryMemberId,
            invitationOfmember,
            officePhoneNumber,
            mobileNumber,
            residencePhoneNo,
            address,
            occasion,
            attendingGuests,
            banquetType,
            banquetPrice: totalAmount,
            bookingDates: {
                checkIn: bookingDates.checkIn,
                checkOut: bookingDates.checkOut,
                dayStay: Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24))
            },
            bookingTime: {
                from,
                to,
                duration: durationInHours
            },
            pricingDetails: {
                totalAmount: Math.round(totalAmount),
                specialDayExtraCharge: Math.round(specialDayExtraCharge),
                totalTaxAmount: Math.round(totalTaxAmount),
                final_totalAmount: Math.round(finalTotalAmount),
                taxTypes: taxDetails,
            },
            paymentMode,
            paymentStatus: 'Pending',
            bookingStatus: 'Pending',
            allDetailsQRCode,
            uniqueQRCode,
            billable,
            billableDate

        });

        // Save banquet booking
        await banquetBooking.save();

        await createRequest(req, {
            primaryMemberId: banquetBooking.primaryMemberId,
            departmentId: banquetBooking._id,
            department: "BanquetBooking",
            status: banquetBooking.bookingStatus,
            description: "This is a Banquet Booking Request."
        });


        const admins = await Department.find({ departmentName: 'Banquets', isDeleted: false });

        // Fetch the primary member's details
        const member = await User.findById(banquetBooking.primaryMemberId).populate("parentUserId");
        if (!member) {
            return res.status(404).json({ message: "Primary member not found." });
        }

        // Send a booking confirmation email
        const memberData = await BanquetBooking.findById(banquetBooking._id)
            .populate({
                path: 'banquetType',
                populate: {
                    path: 'banquetName', // Assuming banquetName references BanquetCategory
                    model: 'BanquetCategory',
                },
            })
            .populate('primaryMemberId');


        // Send email to primary member
        let primaryMemberEmail;
        if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
            primaryMemberEmail = memberData.primaryMemberId.email;
        } else {
            primaryMemberEmail = member.parentUserId.email;
        }

        // Convert times
        const formattedFrom = QRCodeHelper.formatTimeTo12Hour(banquetBooking.bookingTime.from);
        const formattedTo = QRCodeHelper.formatTimeTo12Hour(banquetBooking.bookingTime.to);
        // Prepare template data
        const templateData = {
            uniqueQRCode: banquetBooking.uniqueQRCode,
            bookingReferenceId: banquetBooking.booking_id,
            // qrCode: allDetailsQRCode, // Base64 string for QR Code
            banquetName: memberData.banquetType.banquetName.name,
            primaryName: memberData.primaryMemberId.name,
            memberId: memberData.primaryMemberId.memberId,
            primaryEmail: memberData.primaryMemberId.email,
            primaryContact: memberData.primaryMemberId.mobileNumber,
            attendingGuests: banquetBooking.attendingGuests,
            bookingDate: banquetBooking?.bookingDates?.checkIn ? banquetBooking.bookingDates.checkIn.toDateString() : "N/A",
            from: formattedFrom,
            to: formattedTo,
            duration: banquetBooking.bookingTime.duration,
            taxTypes: memberData?.pricingDetails?.taxTypes?.length > 0
                ? memberData.pricingDetails.taxTypes.map(taxType => ({
                    taxType: taxType.taxType || "N/A",
                    taxRate: taxType.taxRate || 0,
                    taxAmount: taxType.taxAmount || 0,
                }))
                : [],
            totalAmount: banquetBooking.pricingDetails.totalAmount.toFixed(2),
            totalTaxAmount: banquetBooking.pricingDetails.totalTaxAmount.toFixed(2),
            final_totalAmount: banquetBooking.pricingDetails.final_totalAmount.toFixed(2),

        };
        console.log(templateData, "templaedate")
        const template = emailTemplates.banquetBookingReq;

        // Render template
        const htmlBody = banquetrenderTemplate(template.body, templateData);
        const subject = `Booking Request for ${templateData.banquetName}`;

        if (admins.length > 0) {
            for (const admin of admins) {
                await sendEmail(admin.email, subject, htmlBody, attachments = [], cc = null
                    // [
                    //     {
                    //         filename: "qrcode.png",
                    //         content: allDetailsQRCode.split(",")[1],
                    //         encoding: "base64",
                    //         cid: "qrCodeImage",
                    //     },
                    // ]
                );
            }

        }

        const message = `Dear ${templateData.primaryName}, Your banquet booking for ${templateData.banquetName} on ${templateData.bookingDate} at ${templateData.from} to ${templateData.to} for ${templateData.duration} hours has been sent Request. Booking Details:- Banquet Type: ${templateData.primaryName} - Number of Guests: ${templateData.attendingGuests} - Total Amount: ${templateData.final_totalAmount} BCLUB`

        await sendSMSViaPOST(templateData.primaryContact, message)

        await sendEmail(primaryMemberEmail, subject, htmlBody, attachments = [], cc = null
            //     [
            //     {
            //         filename: "qrcode.png",
            //         content: allDetailsQRCode.split(",")[1],
            //         encoding: "base64",
            //         cid: "qrCodeImage",
            //     },
            // ]
        );

        // Call the createNotification function
        await createNotification({
            title: `${memberData.banquetType.banquetName.name} - Banquet Booking Request Is Generated`,
            send_to: "User",
            push_message: "Your banquet Booking Requested Is Generated And Request Send For Club To Verification",
            department: "BanquetBooking",
            departmentId: banquetBooking._id
        });

        return res.status(201).json({
            message: 'Banquet booking created successfully.',
            banquetBooking
        });
    } catch (error) {
        console.error('Error creating banquet booking:', error);
        return res.status(500).json({
            message: 'Internal server error while creating banquet booking.',
            error: error.message
        });
    }
};


const createBanquetBookingDetails = async (req, res) => {
    try {
        // Destructure the request body
        const {
            primaryMemberId,
            invitationOfmember,
            officePhoneNumber,
            mobileNumber,
            residencePhoneNo,
            address,
            occasion,
            attendingGuests,
            banquetType,
            bookingDates,
            bookingTime,
            paymentMode
        } = req.body;

        // Validate primary member
        if (!primaryMemberId) {
            return res.status(400).json({ message: 'Primary member ID is required.' });
        }


        let primaryMemberDetails = await User.findById(primaryMemberId);
        // If the member is not primary, fetch the actual primary member
        if (primaryMemberDetails.relation !== "Primary" && primaryMemberDetails.parentUserId !== null) {
            primaryMemberDetails = await User.findById(primaryMemberDetails.parentUserId);
            if (!primaryMemberDetails) {
                return res.status(404).json({ message: "Primary member not found for the provided member." });
            }
        }

        // Check credit stop and credit limit
        if (primaryMemberDetails.creditStop) {
            return res.status(400).json({
                message: "You are currently not eligible for booking. Please contact the club."
            });
        }

        // Validate banquet type
        const banquet = await Banquet.findById(banquetType)
            .populate('banquetName')
            .populate('pricingDetails').populate('specialDayTariff').populate('taxTypes');
        if (!banquet) {
            return res.status(400).json({ message: 'Invalid banquet type.' });
        }

        // // Validate Dates Using Function
        // const validationBookingDate = await validateBookingDates(bookingDates.checkIn, bookingDates.checkOut);

        // if (!validationBookingDate.success) {
        //     return res.status(400).json({ message: validationBookingDate.message });
        // }

        // Validate booking dates
        const checkInDate = new Date(bookingDates.checkIn);
        const checkOutDate = new Date(bookingDates.checkOut);

        if (isNaN(checkInDate) || isNaN(checkOutDate)) {
            return res.status(400).json({ message: 'Invalid check-in or check-out dates.' });
        }

        // Validate booking time
        const { from, to } = bookingTime;
        if (!from || !to) {
            return res.status(400).json({ message: 'Booking time from and to are required.' });
        }

        const [fromHours, fromMinutes] = from.split(':').map(Number);
        const [toHours, toMinutes] = to.split(':').map(Number);
        if (
            isNaN(fromHours) ||
            isNaN(fromMinutes) ||
            isNaN(toHours) ||
            isNaN(toMinutes) ||
            fromHours > toHours ||
            (fromHours === toHours && fromMinutes >= toMinutes)
        ) {
            return res.status(400).json({ message: 'Invalid booking time.' });
        }

        // Calculate duration
        const durationInHours = (toHours * 60 + toMinutes - (fromHours * 60 + fromMinutes)) / 60;

        // Calculate pricing based on the day and time slots
        const bookingDay = checkInDate.toLocaleString('en-US', { weekday: 'long' });
        const applicablePricing = banquet.pricingDetails.filter(pricing => pricing.days.includes(bookingDay));

        if (!applicablePricing && applicablePricing.length === 0) {
            return res.status(400).json({ message: 'No pricing details available for the selected day.' });
        }

        let isAvailable = false;
        let finalPrice = 0;
        for (const pricing of applicablePricing) {
            const timeSlot = pricing.timeSlots.find(slot => {
                // Parse slot start and end times
                const parseTime = timeStr => {
                    const [time, modifier] = timeStr.split(' ');
                    let [hours, minutes] = time.split(':').map(Number);

                    if (modifier === 'PM' && hours !== 12) {
                        hours += 12; // Convert PM to 24-hour format
                    }
                    if (modifier === 'AM' && hours === 12) {
                        hours = 0; // Handle midnight
                    }

                    return { hours, minutes };
                };

                const { hours: slotStartHours, minutes: slotStartMinutes } = parseTime(slot.start);
                const { hours: slotEndHours, minutes: slotEndMinutes } = parseTime(slot.end);

                const slotStartTotalMinutes = slotStartHours * 60 + slotStartMinutes;
                const slotEndTotalMinutes = slotEndHours * 60 + slotEndMinutes;

                // Booking start and end times
                const bookingStartTotalMinutes = fromHours * 60 + fromMinutes;
                const bookingEndTotalMinutes = toHours * 60 + toMinutes;

                return (
                    bookingStartTotalMinutes >= slotStartTotalMinutes &&
                    bookingEndTotalMinutes <= slotEndTotalMinutes
                    // bookingStartTotalMinutes < slotEndTotalMinutes && bookingEndTotalMinutes > slotStartTotalMinutes
                );

            });

            if (timeSlot) {
                isAvailable = true;
                finalPrice = pricing.price;
                break; // Stop checking further slots for this pricing
            }
        }



        if (!isAvailable) {
            return res.status(400).json({ message: 'No pricing details available for the selected time slot.' });
        }

        // let totalAmount = applicablePricing.price;
        let totalAmount = finalPrice;


        // Calculate special day charges in percentage and add to the total amount
        let specialDayExtraCharge = 0;
        if (banquet.specialDayTariff && Array.isArray(banquet.specialDayTariff)) {
            banquet.specialDayTariff.forEach((specialDay) => {
                const start = new Date(specialDay.startDate);
                const end = new Date(specialDay.endDate);
                if (checkInDate >= start && checkOutDate <= end) {
                    specialDayExtraCharge += (totalAmount * specialDay.extraCharge) / 100;
                }
            });
        }

        // totalAmount += specialDayExtraCharge;


        // Calculate tax details
        let totalTaxAmount = 0;
        let taxDetails = [];
        banquet.taxTypes.forEach(tax => {
            const taxAmount = ((totalAmount + specialDayExtraCharge) * tax.percentage) / 100;
            totalTaxAmount += taxAmount;
            taxDetails.push({
                taxType: tax.name,
                taxRate: tax.percentage,
                taxAmount: taxAmount,
            });
        });

        const finalTotalAmount = totalAmount + specialDayExtraCharge + totalTaxAmount;

        // Check credit limit
        if (primaryMemberDetails.creditLimit > 0 && primaryMemberDetails.creditLimit < finalTotalAmount) {
            return res.status(400).json({
                message: "Your credit limit is less than the purchase amount. Please contact the club.",
            });
        }


        // Create banquet booking object
        const banquetBooking = {
            primaryMemberId,
            invitationOfmember,
            officePhoneNumber,
            mobileNumber,
            residencePhoneNo,
            address,
            occasion,
            attendingGuests,
            banquetType,
            banquetName: banquet.banquetName,
            banquetPrice: totalAmount,
            bookingDates: {
                checkIn: bookingDates.checkIn,
                checkOut: bookingDates.checkOut,
                dayStay: Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24))
            },
            bookingTime: {
                from,
                to,
                duration: durationInHours
            },
            pricingDetails: {
                totalAmount: Math.round(totalAmount),
                specialDayExtraCharge: Math.round(specialDayExtraCharge),
                totalTaxAmount: Math.round(totalTaxAmount),
                final_totalAmount: Math.round(finalTotalAmount),
                taxTypes: taxDetails,
            },
            paymentMode,
            paymentStatus: 'Pending',
            bookingStatus: 'Pending',
            images: banquet.images,
        };

        // Save banquet booking
        // await banquetBooking.save();

        return res.status(201).json({
            message: 'Banquet booking created successfully.',
            banquetBooking
        });
    } catch (error) {
        console.error('Error creating banquet booking:', error);
        return res.status(500).json({
            message: 'Internal server error while creating banquet booking.',
            error: error.message
        });
    }
};


/**
 * Get all banquet bookings
 */

const getAllBanquetBookings = async (req, res) => {
    try {
        let { page, limit, filterType, customStartDate, customEndDate, bookingStatus, userId, exportData } = req.query;

        // Convert pagination parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let filter = { isDeleted: false };

        // Add filters
        if (bookingStatus) filter.bookingStatus = bookingStatus;
        if (userId) filter.primaryMemberId = userId;

        // Handle date filters
        if (filterType) {
            const today = moment().startOf("day");

            switch (filterType) {
                case "today":
                    filter.createdAt = { $gte: today.toDate(), $lt: moment(today).endOf("day").toDate() };
                    break;
                case "last7days":
                    filter.createdAt = { $gte: moment(today).subtract(7, "days").toDate(), $lt: today.toDate() };
                    break;
                case "last30days":
                    filter.createdAt = { $gte: moment(today).subtract(30, "days").toDate(), $lt: today.toDate() };
                    break;
                case "last3months":
                    filter.createdAt = { $gte: moment(today).subtract(3, "months").toDate(), $lt: today.toDate() };
                    break;
                case "last6months":
                    filter.createdAt = { $gte: moment(today).subtract(6, "months").toDate(), $lt: today.toDate() };
                    break;
                case "last1year":
                    filter.createdAt = { $gte: moment(today).subtract(12, "months").toDate(), $lt: today.toDate() };
                    break;
                case "custom":
                    if (!customStartDate || !customEndDate) {
                        return res.status(400).json({ message: "Custom date range requires both start and end dates." });
                    }
                    filter.createdAt = {
                        $gte: moment(customStartDate, "YYYY-MM-DD").startOf("day").toDate(),
                        $lt: moment(customEndDate, "YYYY-MM-DD").endOf("day").toDate(),
                    };
                    break;
                default:
                    break;
            }
        }

        // **📌 Aggregate Total Banquet Bookings**
        const totalBookings = await BanquetBooking.countDocuments(filter);
        const totalPages = Math.ceil(totalBookings / limit);

        // **📌 Export All Data if Requested (No Pagination)**
        if (exportData === "true") {
            console.log("📥 Exporting all banquet bookings...");

            const allBookings = await BanquetBooking.find(filter)
                .populate({
                    path: "banquetType",
                    populate: {
                        path: "banquetName",
                        model: "BanquetCategory",
                    },
                })
                .populate("primaryMemberId")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                message: "All banquet bookings fetched successfully for export.",
                totalBookings,
                bookings: allBookings,
            });
        }

        // **📌 Paginated Query**
        const bookings = await BanquetBooking.find(filter)
            .populate({
                path: "banquetType",
                populate: {
                    path: "banquetName",
                    model: "BanquetCategory",
                },
            })
            .populate("primaryMemberId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // **📌 Return Paginated Response**
        return res.status(200).json({
            message: "Banquet bookings fetched successfully",
            totalBookings,
            bookings,
            pagination: {
                currentPage: page,
                totalPages,
                totalBookings,
                pageSize: limit,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching banquet bookings:", error);
        return res.status(500).json({ message: "❌ Internal server error", error: error.message });
    }
};



/**
 * Get a single booking by ID
 */
const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

        const booking = await BanquetBooking.findOne({ _id: bookingId, isDeleted: false })
            .populate({
                path: 'banquetType',
                populate: {
                    path: 'banquetName', // Assuming banquetName references BanquetCategory
                    model: 'BanquetCategory',
                },
            })
            .populate('primaryMemberId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        return res.status(200).json({
            message: "Booking details fetched successfully",
            booking,
        });
    } catch (error) {
        console.error('Error fetching booking by ID:', error);
        return res.status(500).json({
            message: 'Error retrieving booking',
            error: error.message,
        });
    }
};

/**
 * Get all bookings for the current user
 */
const getMyBookings = async (req, res) => {
    try {
        const primaryMemberId = req.user.userId; // Assuming user ID is attached to req.user
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const bookings = await BanquetBooking.find({ primaryMemberId, isDeleted: false })
            .populate({
                path: 'banquetType',
                populate: {
                    path: 'banquetName', // Assuming banquetName references BanquetCategory
                    model: 'BanquetCategory',
                },
            })
            .populate('primaryMemberId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        if (!bookings.length) {
            // return res.status(404).json({ message: 'No bookings found for this user' });
            return res.status(200).json({ bookings: [], message: 'Bookings Not Available!.' });
        }

        const totalBookings = await BanquetBooking.countDocuments({ primaryMemberId, isDeleted: false });
        const totalPages = Math.ceil(totalBookings / limit);

        return res.status(200).json({
            message: "User bookings fetched successfully",
            bookings,
            pagination: {
                totalBookings,
                totalPages,
                currentPage: Number(page),
                perPage: Number(limit),
            },
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        return res.status(500).json({
            message: 'Error retrieving your bookings',
            error: error.message,
        });
    }
};

/**
 * Soft delete a booking
 */
const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

        const booking = await BanquetBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.isDeleted) {
            return res.status(400).json({ message: 'Booking has already been deleted' });
        }

        booking.isDeleted = true;
        booking.deletedAt = new Date();
        await booking.save();

        return res.status(200).json({
            message: 'Booking soft deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return res.status(500).json({
            message: 'Error deleting booking',
            error: error.message,
        });
    }
};



const allocateBanquet = async (req, res) => {
    try {
        const { bookingId, bookingStatus } = req.body;
        const { userId, role } = req.user;

        // if (!userId || role !== 'admin') {
        //     return res.status(400).json({ message: 'Alert You are not update the details!.' });

        // }

        // Validate booking ID
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format.' });
        }

        // Validate booking status
        const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
        if (!validStatuses.includes(bookingStatus)) {
            return res.status(400).json({ message: `Invalid booking status. Valid statuses are: ${validStatuses.join(', ')}.` });
        }

        // Find the booking by ID
        const booking = await BanquetBooking.findById(bookingId)
            .populate({
                path: 'banquetType',
                populate: {
                    path: 'banquetName', // Assuming banquetName references BanquetCategory
                    model: 'BanquetCategory',
                },
            })
        // .populate('banquetType', '_id')

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        if (booking.isDeleted) {
            return res.status(400).json({ message: 'Cannot allocate a deleted booking.' });
        }

        if (booking.bookingStatus === 'Confirmed') {
            return res.status(400).json({ message: 'This Request is already Confirmed.' });
        }


        const allDetailsQRCodeData = {
            uniqueQRCode: booking.uniqueQRCode,
            primaryMemberId: booking.primaryMemberId,
            invitationOfmember: booking.invitationOfmember,
            officePhoneNumber: booking.officePhoneNumber,
            mobileNumber: booking.mobileNumber,
            residencePhoneNo: booking.residencePhoneNo,
            address: booking.address,
            occasion: booking.occasion,
            attendingGuests: booking.attendingGuests,
            banquetType: booking.banquetType ? booking.banquetType._id : '',
            banquetPrice: booking.banquetPrice,
            bookingDates: booking.bookingDates,
            bookingTime: booking.bookingTime,
            pricingDetails: booking.pricingDetails,
            paymentMode: booking.paymentMode,
            paymentStatus: booking.paymentStatus,
            bookingStatus: bookingStatus
        };

        const allDetailsQRCode = await QRCodeHelper.generateQRCode(JSON.stringify(allDetailsQRCodeData));

        let requestId = null;

        // Find the request by departmentId instead of using findById
        const findRequest = await AllRequest.findOne({ departmentId: bookingId }).exec();

        if (findRequest) {
            requestId = findRequest._id;
        }

        // Fetch the primary member's details
        const member = await User.findById(booking.primaryMemberId).populate("parentUserId");
        if (!member) {
            return res.status(404).json({ message: "Primary member not found." });
        }


        // Send a booking confirmation email
        const memberData = await BanquetBooking.findById(booking._id)
            .populate({
                path: 'banquetType',
                populate: {
                    path: 'banquetName', // Assuming banquetName references BanquetCategory
                    model: 'BanquetCategory',
                },
            })
            .populate('primaryMemberId')

        // Convert times
        const formattedFrom = QRCodeHelper.formatTimeTo12Hour(booking.bookingTime.from);
        const formattedTo = QRCodeHelper.formatTimeTo12Hour(booking.bookingTime.to);
        // Prepare template data
        const templateData = {
            uniqueQRCode: booking.uniqueQRCode,
            bookingReferenceId: booking.booking_id,
            // qrCode: allDetailsQRCode, // Base64 string for QR Code
            banquetName: memberData.banquetType.banquetName.name,
            // eventDate: event.eventDate.toDateString(),
            primaryName: memberData.primaryMemberId.name,
            memberId: memberData.primaryMemberId.memberId,
            primaryEmail: memberData.primaryMemberId.email,
            primaryContact: memberData.primaryMemberId.mobileNumber,
            attendingGuests: booking.attendingGuests,
            bookingDate: booking?.bookingDates?.checkIn ? booking.bookingDates.checkIn.toDateString() : "N/A",
            from: formattedFrom,
            to: formattedTo,
            duration: booking.bookingTime.duration,
            taxTypes: memberData?.pricingDetails?.taxTypes?.length > 0
                ? memberData.pricingDetails.taxTypes.map(taxType => ({
                    taxType: taxType.taxType || "N/A",
                    taxRate: taxType.taxRate || 0,
                    taxAmount: taxType.taxAmount || 0,
                }))
                : [],
            totalAmount: booking.pricingDetails.totalAmount.toFixed(2),
            totalTaxAmount: booking.pricingDetails.totalTaxAmount.toFixed(2),
            final_totalAmount: booking.pricingDetails.final_totalAmount.toFixed(2),

        };
        console.log(templateData, "templaedate")

        // Send email to primary member
        let primaryMemberEmail;
        if (memberData.primaryMemberId.parentUserId === null && memberData.primaryMemberId.relation === "Primary") {
            primaryMemberEmail = memberData.primaryMemberId.email;
        } else {
            primaryMemberEmail = member.parentUserId.email;
        }

        if (bookingStatus === 'Pending' || bookingStatus === 'Cancelled') {
            // Update the booking status
            booking.bookingStatus = bookingStatus;
            booking.allDetailsQRCode = allDetailsQRCode;
            await booking.save();
            // Call the createNotification function
            await createNotification({
                title: `${booking.banquetType.banquetName.name} - Banquet Booking Is Rejected`,
                send_to: "User",
                push_message: "Your banquet Booking Is Rejected For Some Details Are Not Validate!",
                department: "BanquetBooking",
                departmentId: booking._id
            });

            if (requestId !== null) {
                await updateRequest(requestId, {
                    status: bookingStatus,
                    adminResponse: "The Booking Is Cancelled Due To Some Reason"
                });
            }

            const template = emailTemplates.banquetBookingReject;

            // Render template
            const htmlBody = banquetrenderTemplate(template.body, templateData);
            const subject = banquetrenderTemplate(template.subject, templateData);

            // Send email
            await sendEmail(
                primaryMemberEmail,
                subject,
                htmlBody,
                attachments = [], cc = null
            );


            return res.status(200).json({
                message: `Booking status updated successfully to '${bookingStatus}'.`,
                booking,
                // allDetailsQRCode
            });
        }

        // Update the booking status
        booking.bookingStatus = bookingStatus;
        booking.allDetailsQRCode = allDetailsQRCode;
        await booking.save();

        if (booking.bookingStatus === 'Confirmed') {
            if (booking.billable && booking.billableDate !== null) {
                await addBilling(booking.primaryMemberId, 'Banquet', { banquetBooking: booking._id }, booking.pricingDetails.totalAmount, 0, booking.pricingDetails.totalTaxAmount, booking.pricingDetails.final_totalAmount, userId)
            }


            const template = emailTemplates.banquetBooking;

            // Render template
            const htmlBody = banquetrenderTemplate(template.body, templateData);
            const subject = banquetrenderTemplate(template.subject, templateData);

            // Send email
            await sendEmail(
                primaryMemberEmail,
                subject,
                htmlBody, attachments = [], cc = null
            );

            // Call the createNotification function
            await createNotification({
                title: `${memberData.banquetType.banquetName.name} - Banquet Booking Is ${booking.bookingStatus}`,
                send_to: "User",
                push_message: "Your banquet Booking Is Confirmed.",
                department: "BanquetBooking",
                departmentId: booking._id
            });

            if (requestId !== null) {
                updateRequest(requestId, { status: bookingStatus, adminResponse: "The Booking Is Confirmed !" })
            }
        }


        return res.status(200).json({
            message: `Booking status updated successfully to '${bookingStatus}'.`,
            booking,
            // allDetailsQRCode
        });
    } catch (error) {
        console.error('Error allocating banquet:', error);
        return res.status(500).json({
            message: 'Internal server error while allocating banquet.',
            error: error.message,
        });
    }
};

const getAllActiveBanquets = async (req, res) => {
    try {
        // Extract the 'status' query parameter from the request
        const { status } = req.query;

        // Define the filter to exclude deleted records and include status filter if provided
        const filter = { isDeleted: false };
        if (status) {
            // Ensure the status filter is handled as a boolean
            filter.status = status // Assuming status is a string ('true' or 'false')
        }

        // Fetch all banquets with related data, applying the filter and sorting by creation date
        const banquets = await Banquet.find(filter)
            .populate('banquetName') // Populate the 'banquetName' field with related data
            // .sort({ createdAt: -1 }); // Sort by creation date in descending order
            .sort({ priority: 1 });


        // Transform the banquet data to include the 'name' and formatted day-time details
        const allBanquets = banquets.map((banquet) => {
            const pricingDetails = banquet.pricingDetails.map((detail) => {
                // Extract short form of days (e.g., Mon-Sat)
                const startDay = detail.days[0].slice(0, 3); // First 3 letters of the first day
                const endDay = detail.days[detail.days.length - 1].slice(0, 3); // First 3 letters of the last day
                const shortDays = detail.days.length > 1 ? `${startDay}-${endDay}` : startDay;

                return {
                    ...detail.toObject(),
                    dayTime: `${shortDays} (${QRCodeHelper.formatTimeTo12Hour(detail.timeSlots[0].start)} to ${QRCodeHelper.formatTimeTo12Hour(detail.timeSlots[0].end)}) - Rs.${detail.price}`,
                };
            });

            return {
                ...banquet.toObject(), // Convert Mongoose document to plain object
                name: banquet.banquetName ? banquet.banquetName.name : "",
                pricingDetails, // Add the updated pricing details
            };
        });

        // Return the response with the banquets data
        return res.status(200).json({
            message: 'Banquets fetched successfully.',
            categories: allBanquets,
        });
    } catch (error) {
        // Handle errors and log them for debugging
        console.error('Error fetching banquets:', error);

        // Return an error response
        return res.status(500).json({
            message: 'Server error while fetching banquets.',
            error: error.message,
        });
    }
};



// const getSearchBanquets = async (req, res) => {
//     try {
//         // Extract the 'status' query parameter from the request
//         const { status, banquetName } = req.query;

//         // Define the filter to exclude deleted records and include status filter if provided
//         const filter = { isDeleted: false };
//         if (status) {
//             // Ensure the status filter is handled as a boolean
//             filter.status = status // Assuming status is a string ('true' or 'false')
//         }
//         if (banquetName) {
//             filter.banquetName = banquetName
//         }

//         // Fetch all banquets with related data, applying the filter and sorting by creation date
//         const banquets = await Banquet.findOne(filter)
//             .populate('banquetName') // Populate the 'banquetName' field with related data
//             .sort({ createdAt: -1 }); // Sort by creation date in descending order

//         // Transform the banquets data to include the 'name' field
//         const allBanquets = banquets.map((banquet) => ({
//             ...banquet.toObject(), // Convert the mongoose document to a plain object
//             name: banquet.banquetName ? banquet.banquetName.name : '', // Add 'name' field from the populated data
//         }));

//         // Return the response with the banquets data
//         return res.status(200).json({
//             message: 'Banquets fetched successfully.',
//             categories: allBanquets,
//         });
//     } catch (error) {
//         // Handle errors and log them for debugging
//         console.error('Error fetching banquets:', error);

//         // Return an error response
//         return res.status(500).json({
//             message: 'Server error while fetching banquets.',
//             error: error.message,
//         });
//     }
// };

const getSearchBanquets = async (req, res) => {
    try {
        // Extract the 'status' and 'banquetName' query parameters
        const { status, banquetName } = req.query;

        // Define the filter to exclude deleted records and include status filter if provided
        const filter = { isDeleted: false };
        if (status) {
            filter.status = status; // Convert string to boolean
        }
        if (banquetName) {
            filter.banquetName = banquetName;
        }

        // Fetch banquets with related data, applying the filter and sorting by creation date
        const banquets = await Banquet.find(filter)
            .populate("banquetName")
            .sort({ createdAt: -1 });

        // Transform the banquet data to include the 'name' and formatted day-time details
        const allBanquets = banquets.map((banquet) => {
            const pricingDetails = banquet.pricingDetails.map((detail) => {
                // Extract short form of days (e.g., Mon-Sat)
                const startDay = detail.days[0].slice(0, 3); // First 3 letters of the first day
                const endDay = detail.days[detail.days.length - 1].slice(0, 3); // First 3 letters of the last day
                const shortDays = detail.days.length > 1 ? `${startDay}-${endDay}` : startDay;

                return {
                    ...detail.toObject(),
                    dayTime: `${shortDays} (${QRCodeHelper.formatTimeTo12Hour(detail.timeSlots[0].start)} to ${QRCodeHelper.formatTimeTo12Hour(detail.timeSlots[0].end)}) - Rs.${detail.price}`,
                };
            });

            return {
                ...banquet.toObject(), // Convert Mongoose document to plain object
                name: banquet.banquetName ? banquet.banquetName.name : "",
                pricingDetails, // Add the updated pricing details
            };
        });

        // Return the response with the banquets data
        return res.status(200).json({
            message: "Banquets fetched successfully.",
            categories: allBanquets,
        });
    } catch (error) {
        console.error("Error fetching banquets:", error);

        // Return an error response
        return res.status(500).json({
            message: "Server error while fetching banquets.",
            error: error.message,
        });
    }
};


module.exports = {
    // Banquet Cetagory functions
    addCategory,
    getAllCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,

    // Banquet Creation Functions
    createBanquet,
    getAllBanquets,
    getBanquetById,
    deleteBanquetImage,
    deleteBanquet,
    uploadBanquetImage,
    updateBanquet,
    getBanquetEditDetailsById,
    getAllActiveBanquets,
    getSearchBanquets,

    // Banquet Booking Functions
    getActiveBanquets,
    createBanquetBooking,
    createBanquetBookingDetails,
    getAllBanquetBookings,
    getBookingById,
    getMyBookings,
    deleteBooking,
    allocateBanquet,

}