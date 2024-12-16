const { default: mongoose } = require("mongoose");
const BanquetCategory = require("../models/banquetCategory");
const Banquet = require("../models/banquets");
const BanquetBooking = require("../models/banquetBooking");
const path = require("path");
const fs = require("fs");
const QRCodeHelper = require('../utils/helper');

// Banquet Category APIs Functions

const addCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        // Check if category already exists
        const existingCategory = await BanquetCategory.findOne({ name, status, isDeleted: false });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists.' });
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
}

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

        if (isNaN(checkInDate) || isNaN(checkOutDate) || checkInDate > checkOutDate) {
            return res.status(400).json({ message: 'Invalid check-in or check-out dates.' });
        }

        const [fromHours, fromMinutes] = from.split(':').map(Number);
        const [toHours, toMinutes] = to.split(':').map(Number);

        if (isNaN(fromHours) || isNaN(fromMinutes) || isNaN(toHours) || isNaN(toMinutes)) {
            return res.status(400).json({ message: 'Invalid time format for "from" or "to".' });
        }

        const guestCount = parseInt(attendingGuestCount, 10);
        if (isNaN(guestCount) || guestCount <= 0) {
            return res.status(400).json({ message: 'Invalid attending guest count.' });
        }

        // Filter by banquet size and type
        const filter = {
            isDeleted: false,
            banquetHallSize: { $gte: guestCount }, // Ensure banquet hall can accommodate the guests
        };

        if (banquetType) {
            filter.banquetName = banquetType; // Filter by banquetType if provided
        }

        const banquets = await Banquet.find(filter)
            .populate('banquetName')
            .populate('taxTypes')
            .populate('amenities')
            .sort({ banquetName: 1 });

        if (banquets.length === 0) {
            return res.status(404).json({ message: 'No banquets available for the specified criteria.' });
        }

        // Check for overlapping bookings
        const availableBanquets = [];

        for (const banquet of banquets) {
            const overlappingBookings = await BanquetBooking.find({
                banquetType: banquet._id,
                'bookingDates.checkIn': { $lte: checkOutDate }, // Overlap check for dates
                'bookingDates.checkOut': { $gte: checkInDate },
                isDeleted: false,
            });

            const isTimeSlotAvailable = !overlappingBookings.some((booking) => {
                const [bookingFromHours, bookingFromMinutes] = booking.bookingTime.from.split(':').map(Number);
                const [bookingToHours, bookingToMinutes] = booking.bookingTime.to.split(':').map(Number);

                const bookingFromTotalMinutes = bookingFromHours * 60 + bookingFromMinutes;
                const bookingToTotalMinutes = bookingToHours * 60 + bookingToMinutes;

                const fromTotalMinutes = fromHours * 60 + fromMinutes;
                const toTotalMinutes = toHours * 60 + toMinutes;

                // Check for overlapping time slots on the same date
                return (
                    (fromTotalMinutes < bookingToTotalMinutes && toTotalMinutes > bookingFromTotalMinutes) &&
                    booking.bookingDates.checkIn.toISOString().slice(0, 10) === checkInDate.toISOString().slice(0, 10)
                );
            });

            if (isTimeSlotAvailable) {
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
        const totalAmount = applicablePricing.price;


        // Calculate special day charges if applicable
        let specialDayExtraCharge = 0;
        if (banquet.specialDayTariff && Array.isArray(banquet.specialDayTariff)) {
            banquet.specialDayTariff.forEach(specialDay => {
                const start = new Date(specialDay.startDate);
                const end = new Date(specialDay.endDate);
                if (checkInDate >= start && checkOutDate <= end) {
                    specialDayExtraCharge += specialDay.extraCharge;
                }
            });
        }

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

        const totalAmount = applicablePricing.price;

        // Calculate special day charges if applicable
        let specialDayExtraCharge = 0;
        if (banquet.specialDayTariff && Array.isArray(banquet.specialDayTariff)) {
            banquet.specialDayTariff.forEach(specialDay => {
                const start = new Date(specialDay.startDate);
                const end = new Date(specialDay.endDate);
                if (checkInDate >= start && checkOutDate <= end) {
                    specialDayExtraCharge += specialDay.extraCharge;
                }
            });
        }

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
        const bookings = await BanquetBooking.find({ isDeleted: false })
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
        const booking = await BanquetBooking.findById(bookingId).populate('banquetType', '_id')

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

        if (bookingStatus === 'Pending' || bookingStatus === 'Cancelled') {
            // Update the booking status
            booking.bookingStatus = bookingStatus;
            booking.allDetailsQRCode = allDetailsQRCode;
            await booking.save();
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