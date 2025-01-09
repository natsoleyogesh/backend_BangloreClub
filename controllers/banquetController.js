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
        const { status } = req.query;

        // Build query based on status if provided
        let query = {};
        if (status) {
            // Directly convert the status string to a boolean
            query.status = status
        }

        const categories = (await BanquetCategory.find(query)).reverse();
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

// const updateCategory = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updates = req.body;

//         // Filter the updates to include only the fields provided in the request body
//         const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
//             if (updates[key] !== undefined) {
//                 acc[key] = updates[key];
//             }
//             return acc;
//         }, {});

//         // Update the category with the filtered updates
//         const updatedCategory = await BanquetCategory.findByIdAndUpdate(id, filteredUpdates, {
//             new: true, // Return the updated document
//             runValidators: true, // Ensure validation rules are applied
//         });

//         if (!updatedCategory) {
//             return res.status(404).json({ message: 'Category not found.' });
//         }

//         res.json({ message: 'Category updated successfully.', category: updatedCategory });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error while updating category.' });
//     }
// }

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
            checkInTime,
            checkOutTime,
            maxAllowedPerRoom,
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
            pricingDetailDescription
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

        // Create new banquet instance
        const newBanquet = new Banquet({
            banquetName,
            description: description || '',
            checkInTime,
            checkOutTime,
            maxAllowedPerRoom,
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
            pricingDetailDescription
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

        // Define the filter to exclude deleted records
        const filter = { isDeleted: false };

        // Fetch all banquets with related data
        const banquets = await Banquet.find(filter)
            .populate('banquetName') // Populate specific fields
            .populate('taxTypes') // Populate taxTypes
            .populate('amenities') // Populate amenities
            .sort({ createdAt: -1 }); // Sort by creation date

        return res.status(200).json({
            message: 'Banquets fetched successfully.',
            data: banquets,
        });
    } catch (error) {
        console.error('Error fetching banquets:', error);
        return res.status(500).json({
            message: 'Server error while fetching banquets.',
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
            checkInTime,
            checkOutTime,
            maxAllowedPerRoom,
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

        // Update only provided fields
        if (banquetName) banquet.banquetName = banquetName;
        if (description) banquet.description = description;
        if (checkInTime) banquet.checkInTime = checkInTime;
        if (checkOutTime) banquet.checkOutTime = checkOutTime;
        if (maxAllowedPerRoom) banquet.maxAllowedPerRoom = maxAllowedPerRoom;
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

        // Filter banquets by type and size
        const filter = {
            isDeleted: false,
            maxAllowedPerRoom: { $gte: guestCount },
        };

        if (banquetType) {
            filter._id = banquetType;
        }

        const banquets = await Banquet.find(filter).populate('banquetName taxTypes amenities').sort({ banquetName: 1 });

        if (banquets.length === 0) {
            return res.status(404).json({ message: 'No banquets available for the specified criteria.' });
        }

        // Filter available banquets based on pricing details and bookings
        const availableBanquets = [];

        for (const banquet of banquets) {
            const bookingDay = checkInDate.toLocaleString('en-US', { weekday: 'long' });

            // Check if the check-in day matches banquet pricing details
            const applicablePricing = banquet.pricingDetails.find(pricing => pricing.days.includes(bookingDay));

            if (!applicablePricing) continue;

            // Check if the time slots are available
            const isTimeSlotAvailable = applicablePricing.timeSlots.some(slot => {
                const [slotStartHours, slotStartMinutes] = slot.start.split(':').map(Number);
                const [slotEndHours, slotEndMinutes] = slot.end.split(':').map(Number);

                const slotStart = slotStartHours * 60 + slotStartMinutes;
                const slotEnd = slotEndHours * 60 + slotEndMinutes;

                const requestedStart = fromHours * 60 + fromMinutes;
                const requestedEnd = toHours * 60 + toMinutes;

                return requestedStart >= slotStart && requestedEnd <= slotEnd;
            });

            if (!isTimeSlotAvailable) continue;


            console.log(checkInDate, checkOutDate, "utcformat")
            // Check for overlapping bookings
            const overlappingBookings = await BanquetBooking.find({
                banquetType: banquet._id,
                // 'bookingDates.checkIn': { $lt: endOfCheckOut },
                // 'bookingDates.checkOut': { $gt: startOfCheckIn },
                isDeleted: false,
            });

            const isBookingTimeAvailable = !overlappingBookings.some(booking => {
                console.log("Booking CheckIn:", booking.bookingDates.checkIn, "Booking CheckOut:", booking.bookingDates.checkOut);

                // Convert booking dates to only date parts for comparison
                const bookingCheckInDate = new Date(booking.bookingDates.checkIn).toISOString().split('T')[0];
                const bookingCheckOutDate = new Date(booking.bookingDates.checkOut).toISOString().split('T')[0];

                const requestedCheckInDate = new Date(checkInDate).toISOString().split('T')[0];
                const requestedCheckOutDate = new Date(checkOutDate).toISOString().split('T')[0];

                // Check if dates overlap
                const isDateOverlap =
                    requestedCheckInDate <= bookingCheckOutDate &&
                    requestedCheckOutDate >= bookingCheckInDate;

                if (!isDateOverlap) {
                    return false; // Skip if the dates do not overlap
                }

                // Extract time components and compare
                const [bookingFromHours, bookingFromMinutes] = booking.bookingTime.from.split(':').map(Number);
                const [bookingToHours, bookingToMinutes] = booking.bookingTime.to.split(':').map(Number);

                const bookingStart = bookingFromHours * 60 + bookingFromMinutes;
                const bookingEnd = bookingToHours * 60 + bookingToMinutes;

                const requestedStart = fromHours * 60 + fromMinutes;
                const requestedEnd = toHours * 60 + toMinutes;

                // Check if time ranges overlap
                const isTimeOverlap = requestedStart < bookingEnd && requestedEnd > bookingStart;

                console.log("Date Overlap:", isDateOverlap, "Time Overlap:", isTimeOverlap);

                return isDateOverlap && isTimeOverlap; // Return true only if both date and time overlap
            });

            if (isBookingTimeAvailable) {
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
        const applicablePricing = banquet.pricingDetails.find(pricing => pricing.days.includes(bookingDay));

        if (!applicablePricing) {
            return res.status(400).json({ message: 'No pricing details available for the selected day.' });
        }

        const timeSlot = applicablePricing.timeSlots.find(slot => {
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
            );
        });


        if (!timeSlot) {
            return res.status(400).json({ message: 'No pricing details available for the selected time slot.' });
        }

        // const totalAmount = applicablePricing.price * durationInHours;
        let totalAmount = applicablePricing.price;


        // // Calculate special day charges if applicable
        // let specialDayExtraCharge = 0;
        // if (banquet.specialDayTariff && Array.isArray(banquet.specialDayTariff)) {
        //     banquet.specialDayTariff.forEach(specialDay => {
        //         const start = new Date(specialDay.startDate);
        //         const end = new Date(specialDay.endDate);
        //         if (checkInDate >= start && checkOutDate <= end) {
        //             specialDayExtraCharge += specialDay.extraCharge;
        //         }
        //     });
        // }

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

        totalAmount += specialDayExtraCharge;


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

        const finalTotalAmount = totalAmount + totalTaxAmount;

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
            bookingStatus: 'Pending'
        };
        const allDetailsQRCode = await QRCodeHelper.generateQRCode(allDetailsQRCodeData);



        // Create banquet booking object
        const banquetBooking = new BanquetBooking({
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
                totalAmount,
                specialDayExtraCharge,
                totalTaxAmount,
                final_totalAmount: finalTotalAmount,
                taxTypes: taxDetails,
            },
            paymentMode,
            paymentStatus: 'Pending',
            bookingStatus: 'Pending',
            allDetailsQRCode,
            uniqueQRCode
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
        const admins = await Admin.find({ role: 'admin', isDeleted: false });
        if (admins.length > 0) {


            // Send a booking confirmation email
            const memberData = await BanquetBooking.findById(banquetBooking._id)
                .populate({
                    path: 'banquetType',
                    populate: {
                        path: 'banquetName', // Assuming banquetName references BanquetCategory
                        model: 'BanquetCategory',
                    },
                })
                .populate('primaryMemberId')

            // Convert times
            const formattedFrom = QRCodeHelper.formatTimeTo12Hour(banquetBooking.bookingTime.from);
            const formattedTo = QRCodeHelper.formatTimeTo12Hour(banquetBooking.bookingTime.to);
            // Prepare template data
            const templateData = {
                uniqueQRCode: banquetBooking.uniqueQRCode,
                qrCode: allDetailsQRCode, // Base64 string for QR Code
                banquetName: memberData.banquetType.banquetName.name,
                // eventDate: event.eventDate.toDateString(),
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
            const template = emailTemplates.banquetBooking;

            // Render template
            const htmlBody = banquetrenderTemplate(template.body, templateData);
            const subject = `Booking Request for ${templateData.banquetName}`;


            for (const admin of admins) {
                await sendEmail(admin.email, subject, htmlBody, [
                    {
                        filename: "qrcode.png",
                        content: allDetailsQRCode.split(",")[1],
                        encoding: "base64",
                        cid: "qrCodeImage",
                    },
                ]);
            }

        }

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

        // Validate banquet type
        const banquet = await Banquet.findById(banquetType)
            .populate('banquetName')
            .populate('pricingDetails').populate('specialDayTariff').populate('taxTypes');
        if (!banquet) {
            return res.status(400).json({ message: 'Invalid banquet type.' });
        }

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
        const applicablePricing = banquet.pricingDetails.find(pricing => pricing.days.includes(bookingDay));

        if (!applicablePricing) {
            return res.status(400).json({ message: 'No pricing details available for the selected day.' });
        }


        const timeSlot = applicablePricing.timeSlots.find(slot => {
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
            );
        });


        if (!timeSlot) {
            return res.status(400).json({ message: 'No pricing details available for the selected time slot.' });
        }

        let totalAmount = applicablePricing.price;

        // // Calculate special day charges if applicable
        // let specialDayExtraCharge = 0;
        // if (banquet.specialDayTariff && Array.isArray(banquet.specialDayTariff)) {
        //     banquet.specialDayTariff.forEach(specialDay => {
        //         const start = new Date(specialDay.startDate);
        //         const end = new Date(specialDay.endDate);
        //         if (checkInDate >= start && checkOutDate <= end) {
        //             specialDayExtraCharge += specialDay.extraCharge;
        //         }
        //     });
        // }

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

        totalAmount += specialDayExtraCharge;


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

        const finalTotalAmount = totalAmount + totalTaxAmount;


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
                totalAmount,
                specialDayExtraCharge,
                totalTaxAmount,
                final_totalAmount: finalTotalAmount,
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

        const { filterType, customStartDate, customEndDate, bookingStatus, userId } = req.query;

        let filter = { isDeleted: false };

        // Add paymentStatus to filter if provided
        if (bookingStatus) {
            filter.bookingStatus = bookingStatus;
        }
        if (userId) {
            filter.primaryMemberId = userId;
        }

        // Handle date filters
        if (filterType) {
            const today = moment().startOf('day');

            switch (filterType) {
                case 'today':
                    filter.createdAt = { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() };
                    break;
                case 'last7days':
                    filter.createdAt = { $gte: moment(today).subtract(7, 'days').toDate(), $lt: today.toDate() };
                    break;
                case 'last30days':
                    filter.createdAt = { $gte: moment(today).subtract(30, 'days').toDate(), $lt: today.toDate() };
                    break;
                case 'last3months':
                    filter.createdAt = { $gte: moment(today).subtract(3, 'months').toDate(), $lt: today.toDate() };
                    break;
                case 'last6months':
                    filter.createdAt = { $gte: moment(today).subtract(6, 'months').toDate(), $lt: today.toDate() };
                    break;
                case 'last1year':
                    filter.createdAt = { $gte: moment(today).subtract(1, 'year').toDate(), $lt: today.toDate() };
                    break;
                case 'custom':
                    if (!customStartDate || !customEndDate) {
                        return res.status(400).json({ message: 'Custom date range requires both start and end dates.' });
                    }
                    filter.createdAt = {
                        $gte: moment(customStartDate, 'YYYY-MM-DD').startOf('day').toDate(),
                        $lt: moment(customEndDate, 'YYYY-MM-DD').endOf('day').toDate(),
                    };
                    break;
                default:
                    break; // No filter applied if no valid filterType
            }
        }

        const bookings = await BanquetBooking.find(filter)
            .populate({
                path: 'banquetType',
                populate: {
                    path: 'banquetName', // Assuming banquetName references BanquetCategory
                    model: 'BanquetCategory',
                },
            })
            .populate('primaryMemberId')
            .sort({ createdAt: -1 });

        if (!bookings.length) {
            return res.status(404).json({ message: 'No bookings found' });
        }

        return res.status(200).json({
            message: "Fetched all bookings successfully",
            bookings,
        });
    } catch (error) {
        console.error('Error fetching banquet bookings:', error);
        return res.status(500).json({
            message: 'Error retrieving bookings',
            error: error.message,
        });
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
            return res.status(404).json({ message: 'No bookings found for this user' });
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

        if (!userId || role !== 'admin') {
            return res.status(400).json({ message: 'Alert You are not update the details!.' });

        }

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

        if (bookingStatus === 'Pending' || bookingStatus === 'Cancelled') {
            // Update the booking status
            booking.bookingStatus = bookingStatus;
            booking.allDetailsQRCode = allDetailsQRCode;
            await booking.save();
            // Call the createNotification function
            await createNotification({
                title: `${booking.banquetType.banquetName.name}Banquet Booking Is Rejected`,
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
            await addBilling(booking.primaryMemberId, 'Banquet', { banquetBooking: booking._id }, booking.pricingDetails.totalAmount, 0, booking.pricingDetails.totalTaxAmount, booking.pricingDetails.final_totalAmount, userId)

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
                qrCode: allDetailsQRCode, // Base64 string for QR Code
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
            const template = emailTemplates.banquetBooking;

            // Render template
            const htmlBody = banquetrenderTemplate(template.body, templateData);
            const subject = banquetrenderTemplate(template.subject, templateData);

            // Send email
            await sendEmail(
                memberData.primaryMemberId.email,
                subject,
                htmlBody,
                [
                    {
                        filename: "qrcode.png",
                        content: allDetailsQRCode.split(",")[1],
                        encoding: "base64",
                        cid: "qrCodeImage",
                    },
                ]
            );

            // Call the createNotification function
            await createNotification({
                title: `${memberData.banquetType.banquetName.name}Banquet Booking Is ${booking.bookingStatus}`,
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
            .sort({ createdAt: -1 }); // Sort by creation date in descending order

        // Transform the banquets data to include the 'name' field
        const allBanquets = banquets.map((banquet) => ({
            ...banquet.toObject(), // Convert the mongoose document to a plain object
            name: banquet.banquetName ? banquet.banquetName.name : '', // Add 'name' field from the populated data
        }));

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