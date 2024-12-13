const RoomWithCategory = require('../models/roomWithCategory');  // Import the model
const path = require("path");
const fs = require("fs");
const RoomBooking = require('../models/roomBooking');

const addRoomWithCategory = async (req, res) => {
    try {
        const {
            categoryName,
            description,
            checkInTime,
            checkOutTime,
            maxAllowedPerRoom,
            roomDetails,
            priceRange,
            pricingDetails,
            pricingDetailDescription,
            extraBedPrice,
            specialDayTariff,
            taxTypes,
            amenities,
            cancellationPolicy,
            breakfastIncluded,
            roomSize,
            bedType,
            features,
            status,
        } = req.body;

        // Validate price range
        const updatepricing = JSON.parse(priceRange);
        if (updatepricing.minPrice < 0 || updatepricing.maxPrice < 0) {
            return res.status(400).json({ message: 'Price range cannot be negative' });
        }
        const parsedPriceRange = {
            minPrice: parseFloat(updatepricing.minPrice),
            maxPrice: parseFloat(updatepricing.maxPrice),
        };

        // Validate pricing details
        if (!Array.isArray(pricingDetails) || pricingDetails.length === 0) {
            return res.status(400).json({ message: 'Pricing details must be an array and cannot be empty' });
        }
        const parsedPricingDetails = pricingDetails.map(detail => ({
            guestType: detail.guestType,
            price: parseFloat(detail.price),
            description: detail.description || '',
        }));

        const parsedSpecialDayDetails = specialDayTariff.map(detail => {
            // Ensure valid default values in case some fields are missing
            return {
                special_day_name: detail.special_day_name || '',
                startDate: detail.startDate ? new Date(detail.startDate) : null,  // Handling potential undefined values
                endDate: detail.endDate ? new Date(detail.endDate) : null,  // Handling potential undefined values
                extraCharge: detail.extraCharge ? parseFloat(detail.extraCharge) : 0,  // Default to 0 if not a valid number
            };
        });


        // Validate room details
        if (!Array.isArray(roomDetails) || roomDetails.length === 0) {
            return res.status(400).json({ message: 'Room details must be an array and cannot be empty' });
        }

        // Validate each room detail
        for (const room of roomDetails) {
            if (!room.roomNumber || !room.status) {
                return res.status(400).json({ message: 'Each room must have a roomNumber and status' });
            }
            if (!['Available', 'Booked', 'Under Maintenance'].includes(room.status)) {
                return res.status(400).json({ message: `Invalid status for room ${room.roomNumber}. Valid statuses are: Available, Booked, Under Maintenance.` });
            }
        }

        // Count available rooms
        const availableRoomCount = roomDetails.filter(room => room.status === 'Available').length;
        const totalAvailableRoom = parseFloat(req.body.totalAvailableRoom);
        if (totalAvailableRoom !== availableRoomCount) {
            return res.status(400).json({
                message: 'The totalAvailableRoom count does not match the number of available rooms in roomDetails',
            });
        }

        // Handle image file paths
        const images = req.files ? req.files.map(file => `/${file.path.replace(/\\/g, '/')}`) : [];


        // Handle tax types and amenities as arrays of ObjectIds
        const parsedTaxTypes = Array.isArray(taxTypes) ? taxTypes : taxTypes.split(',').map(id => id.trim());
        const parsedAmenities = Array.isArray(amenities) ? amenities : amenities.split(',').map(id => id.trim());

        // Handle features (boolean fields)
        const parsedFeatures = {
            smokingAllowed: Boolean(features.smokingAllowed),
            petFriendly: Boolean(features.petFriendly),
            accessible: Boolean(features.accessible),
        };

        const updateCancellation = JSON.parse(cancellationPolicy);

        // Validate cancellation policy
        const validCancellationPolicy = updateCancellation ? {
            before7Days: updateCancellation.before7Days || 0,
            between7To2Days: updateCancellation.between7To2Days || 25,
            between48To24Hours: updateCancellation.between48To24Hours || 50,
            lessThan24Hours: updateCancellation.lessThan24Hours || 100,
        } : {};

        // Create new RoomWithCategory instance
        const newRoomWithCategory = new RoomWithCategory({
            categoryName,
            description: description || '',
            checkInTime,
            checkOutTime,
            maxAllowedPerRoom,
            roomDetails,
            priceRange: parsedPriceRange,
            pricingDetails: parsedPricingDetails,
            pricingDetailDescription: pricingDetailDescription || '',
            extraBedPrice: parseFloat(extraBedPrice) || 0,
            specialDayTariff: parsedSpecialDayDetails || [],
            taxTypes: parsedTaxTypes,
            amenities: parsedAmenities,
            cancellationPolicy: validCancellationPolicy,
            breakfastIncluded: breakfastIncluded || false,
            roomSize: parseFloat(roomSize),
            bedType,
            features: parsedFeatures,
            status: status || 'Active',
            images,
        });

        // Save the new room category
        await newRoomWithCategory.save();

        return res.status(201).json({ message: 'Room category added successfully', roomWithCategory: newRoomWithCategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error while adding room category', error: error.message });
    }
};


const getAllRoomWithCategories = async (req, res) => {
    try {
        // Fetch all room categories, excluding deleted ones by default
        const { includeDeleted } = req.query; // Optional query parameter to include deleted records
        const filter = includeDeleted === 'true' ? {} : { isDeleted: false };

        const roomWithCategories = await RoomWithCategory.find(filter)
            .populate('categoryName')
            .populate('taxTypes')
            .populate('amenities')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Room categories fetched successfully',
            data: roomWithCategories,
        });
    } catch (error) {
        console.error('Error fetching room categories:', error);
        return res.status(500).json({ message: 'Server error while fetching room categories', error: error.message });
    }
};

const getRoomWithCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const roomWithCategory = await RoomWithCategory.findById(id)
            .populate('categoryName')
            .populate('taxTypes')
            .populate('amenities');

        if (!roomWithCategory || roomWithCategory.isDeleted) {
            return res.status(404).json({ message: 'Room category not found or has been deleted' });
        }

        return res.status(200).json({
            message: 'Room category fetched successfully',
            data: roomWithCategory,
        });
    } catch (error) {
        console.error('Error fetching room category by ID:', error);
        return res.status(500).json({ message: 'Server error while fetching room category', error: error.message });
    }
};

const deleteRoomWithCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const roomWithCategory = await RoomWithCategory.findById(id);

        if (!roomWithCategory || roomWithCategory.isDeleted) {
            return res.status(404).json({ message: 'Room category not found or already deleted' });
        }

        roomWithCategory.isDeleted = true; // Mark as deleted
        await roomWithCategory.save();

        return res.status(200).json({
            message: 'Room category deleted successfully',
            data: roomWithCategory,
        });
    } catch (error) {
        console.error('Error deleting room category:', error);
        return res.status(500).json({ message: 'Server error while deleting room category', error: error.message });
    }
};

// const updateRoomWithCategory = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             categoryName,
//             code,
//             description,
//             priceRange,
//             pricingDetails,
//             capacity,
//             amenities,  // No validation, just parse as it is
//             roomSize,
//             bedType,
//             features,
//             status,
//             roomDetails,
//             taxRate,
//             totalAvailableRoom,  // From the request body
//             primaryMemberPrice,
//             guestPrice
//         } = req.body;

//         // Find the room category by ID
//         const roomWithCategory = await RoomWithCategory.findById(id);

//         if (!roomWithCategory || roomWithCategory.isDeleted) {
//             return res.status(404).json({ message: 'Room category not found or has been deleted' });
//         }

//         // Validate and parse the priceRange
//         if (priceRange && (priceRange.minPrice < 0 || priceRange.maxPrice < 0)) {
//             return res.status(400).json({ message: 'Price range cannot be negative' });
//         }
//         const parsedPriceRange = priceRange ? {
//             minPrice: parseFloat(priceRange.minPrice),
//             maxPrice: parseFloat(priceRange.maxPrice),
//         } : roomWithCategory.priceRange;

//         const parsedTax = taxRate ? parseFloat(taxRate) : roomWithCategory.taxRate;
//         const primaryMemberParsedPrice = primaryMemberPrice ? parseFloat(primaryMemberPrice) : roomWithCategory.primaryMemberPrice;
//         const guestParsedPrice = guestPrice ? parseFloat(guestPrice) : roomWithCategory.guestPrice;

//         // Validate and parse pricingDetails
//         const parsedPricingDetails = pricingDetails && Array.isArray(pricingDetails) && pricingDetails.length > 0
//             ? pricingDetails.map(detail => ({
//                 guestType: detail.guestType,
//                 price: parseFloat(detail.price),
//                 description: detail.description || '',
//             }))
//             : roomWithCategory.pricingDetails;

//         // Parse amenities (no validation, just store the array or comma-separated string)
//         const parsedAmenities = amenities ?
//             (Array.isArray(amenities) ? amenities : amenities.split(',').map(item => item.trim()))
//             : roomWithCategory.amenities;

//         // Parse features (booleans for smokingAllowed, petFriendly, accessible)
//         const parsedFeatures = features ? {
//             smokingAllowed: Boolean(features.smokingAllowed),
//             petFriendly: Boolean(features.petFriendly),
//             accessible: Boolean(features.accessible),
//         } : roomWithCategory.features;

//         // Validate roomDetails array
//         if (roomDetails && (!Array.isArray(roomDetails) || roomDetails.length === 0)) {
//             return res.status(400).json({ message: 'Room details must be provided as an array' });
//         }

//         // Validate that each room has a roomNumber and status
//         if (roomDetails) {
//             for (const room of roomDetails) {
//                 if (!room.roomNumber || !room.status) {
//                     return res.status(400).json({ message: 'Each room must have a roomNumber and status' });
//                 }
//                 if (!['Available', 'Booked', 'Under Maintenance'].includes(room.status)) {
//                     return res.status(400).json({ message: `Invalid status for room ${room.roomNumber}. Valid statuses are: Available, Booked, Under Maintenance.` });
//                 }
//             }
//         }

//         // Count the number of rooms with status 'Available'
//         const availableRoomCount = roomDetails ? roomDetails.filter(room => room.status === 'Available').length : roomWithCategory.totalAvailableRoom;

//         // Check if totalAvailableRoom provided in the request matches the count of available rooms
//         if (totalAvailableRoom !== undefined && totalAvailableRoom !== availableRoomCount) {
//             return res.status(400).json({
//                 message: 'The totalAvailableRoom count does not match the number of available rooms in roomDetails',
//             });
//         }


//         // Update the room category fields
//         roomWithCategory.categoryName = categoryName || roomWithCategory.categoryName;
//         roomWithCategory.code = code || roomWithCategory.code;
//         roomWithCategory.description = description || roomWithCategory.description;
//         roomWithCategory.priceRange = parsedPriceRange;
//         roomWithCategory.pricingDetails = parsedPricingDetails;
//         roomWithCategory.capacity = capacity !== undefined ? parseInt(capacity) : roomWithCategory.capacity;
//         roomWithCategory.amenities = parsedAmenities;
//         roomWithCategory.roomSize = roomSize !== undefined ? parseInt(roomSize) : roomWithCategory.roomSize;
//         roomWithCategory.bedType = bedType || roomWithCategory.bedType;
//         roomWithCategory.features = parsedFeatures;
//         roomWithCategory.status = status || roomWithCategory.status;
//         roomWithCategory.roomDetails = roomDetails || roomWithCategory.roomDetails;
//         roomWithCategory.totalAvailableRoom = availableRoomCount;
//         roomWithCategory.taxRate = parsedTax;
//         roomWithCategory.primaryMemberPrice = primaryMemberParsedPrice;
//         roomWithCategory.guestPrice = guestParsedPrice;

//         // Save the updated room category
//         await roomWithCategory.save();

//         // Return success message
//         return res.status(200).json({
//             message: 'Room category updated successfully',
//             roomWithCategory,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Server error while updating room category', error: error.message });
//     }
// };


// const getActiveRoomsWithCategory = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search = '', minAvailableRooms = 1 } = req.query;  // Default to 1 for minAvailableRooms
//         const skip = (page - 1) * limit;

//         // Build search criteria
//         const searchCriteria = {
//             isDeleted: false,
//             totalAvailableRoom: { $gte: minAvailableRooms },  // Filter rooms with at least minAvailableRooms
//         };

//         // Fetch rooms with category matching the criteria
//         const roomsWithCategory = await RoomWithCategory.find(searchCriteria)
//             .skip(skip)
//             .limit(limit)
//             .sort({ 'categoryName': 1 });  // Sort alphabetically by categoryName (you can modify this as needed)

//         // Get the total number of matching rooms for pagination metadata
//         const totalRooms = await RoomWithCategory.countDocuments(searchCriteria);

//         // Calculate total pages
//         const totalPages = Math.ceil(totalRooms / limit);

//         if (roomsWithCategory.length === 0) {
//             return res.status(200).json({
//                 message: 'No active rooms with category found',
//                 data: [],
//                 pagination: {
//                     // totalRooms,
//                     totalPages,
//                     currentPage: parseInt(page),
//                     limit: parseInt(limit),
//                 },
//             });
//         }

//         return res.status(200).json({
//             message: 'Active rooms with category fetched successfully',
//             data: roomsWithCategory,
//             pagination: {
//                 // totalRooms,
//                 totalPages,
//                 currentPage: parseInt(page),
//                 limit: parseInt(limit),
//             },
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Server error while fetching active rooms with category', error: error.message });
//     }
// };

// const getActiveRoomsWithCategory = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, checkIn, checkOut, roomCount } = req.query;

//         // Validate input
//         if (!checkIn || !checkOut || !roomCount) {
//             return res.status(400).json({ message: 'Missing required fields: checkIn, checkOut, roomCount' });
//         }

//         const skip = (page - 1) * limit;

//         // Parse dates
//         const checkInDate = new Date(checkIn);
//         const checkOutDate = new Date(checkOut);

//         // Build the search criteria for RoomWithCategory (checking if room count is available)
//         const searchCriteria = {
//             isDeleted: false,
//             totalAvailableRoom: { $gte: roomCount },  // Ensure enough rooms are available
//         };

//         // Fetch room categories with the availability filter
//         const roomsWithCategory = await RoomWithCategory.find(searchCriteria)
//             .skip(skip)
//             .limit(limit)
//             .sort({ 'categoryName': 1 });

//         if (roomsWithCategory.length === 0) {
//             return res.status(200).json({
//                 message: 'No available rooms found for the specified dates',
//                 data: [],
//                 pagination: {
//                     totalPages: 0,
//                     currentPage: parseInt(page),
//                     limit: parseInt(limit),
//                 },
//             });
//         }

//         // Filter out rooms that are already booked during the requested dates
//         const availableRooms = [];

//         for (let category of roomsWithCategory) {
//             const bookedRooms = await RoomBooking.find({
//                 'roomCategoryCounts.roomType': category._id,
//                 'bookingDates.checkIn': { $lt: checkOutDate },  // Booked before checkOut
//                 'bookingDates.checkOut': { $gt: checkInDate }, // Booked after checkIn
//                 isDeleted: false,
//             });

//             const bookedRoomCount = bookedRooms.reduce((acc, booking) => {
//                 const roomCategory = booking.roomCategoryCounts.find(r => r.roomType.toString() === category._id.toString());
//                 return acc + (roomCategory ? roomCategory.roomCount : 0);
//             }, 0);

//             // Check if available rooms >= required roomCount
//             if (category.totalAvailableRoom - bookedRoomCount >= roomCount) {
//                 availableRooms.push(category);
//             }
//         }

//         // Calculate pagination details
//         const totalRooms = availableRooms.length;
//         const totalPages = Math.ceil(totalRooms / limit);

//         return res.status(200).json({
//             message: 'Available rooms fetched successfully',
//             data: availableRooms,
//             pagination: {
//                 totalRooms,
//                 totalPages,
//                 currentPage: parseInt(page),
//                 limit: parseInt(limit),
//             },
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             message: 'Server error while fetching available rooms',
//             error: error.message,
//         });
//     }
// };

//llllllllllllllllllllllllllllllllllllllllllllllllllll

// const updateRoomWithCategory = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             categoryName,
//             description,
//             checkInTime,
//             checkOutTime,
//             maxAllowedPerRoom,
//             roomDetails,
//             priceRange,
//             pricingDetails,
//             pricingDetailDescription,
//             extraBedPrice,
//             specialDayTariff,
//             taxTypes,
//             amenities,
//             cancellationPolicy,
//             breakfastIncluded,
//             roomSize,
//             bedType,
//             features,
//             status,
//         } = req.body;

//         // Find the room category by ID

//         const roomWithCategory = await RoomWithCategory.findById(id);

//         if (!roomWithCategory || roomWithCategory.isDeleted) {
//             return res.status(404).json({ message: 'Room category not found or has been deleted' });
//         }

//         // Validate price range
//         if (priceRange && (priceRange.minPrice < 0 || priceRange.maxPrice < 0)) {
//             return res.status(400).json({ message: 'Price range cannot be negative' });
//         }
//         const parsedPriceRange = {
//             minPrice: parseFloat(priceRange.minPrice),
//             maxPrice: parseFloat(priceRange.maxPrice),
//         };

//         // Validate pricing details
//         if (!Array.isArray(pricingDetails) || pricingDetails.length === 0) {
//             return res.status(400).json({ message: 'Pricing details must be an array and cannot be empty' });
//         }
//         const parsedPricingDetails = pricingDetails.map(detail => ({
//             guestType: detail.guestType,
//             price: parseFloat(detail.price),
//             description: detail.description || '',
//         }));

//         const parsedSpecialDayDetails = specialDayTariff.map(detail => ({
//             special_day_name: detail.special_day_name || '',
//             startDate: detail.startDate ? new Date(detail.startDate) : null,
//             endDate: detail.endDate ? new Date(detail.endDate) : null,
//             extraCharge: detail.extraCharge ? parseFloat(detail.extraCharge) : 0,
//         }));

//         // Validate room details
//         if (!Array.isArray(roomDetails) || roomDetails.length === 0) {
//             return res.status(400).json({ message: 'Room details must be an array and cannot be empty' });
//         }

//         for (const room of roomDetails) {
//             if (!room.roomNumber || !room.status) {
//                 return res.status(400).json({ message: 'Each room must have a roomNumber and status' });
//             }
//             if (!['Available', 'Booked', 'Under Maintenance'].includes(room.status)) {
//                 return res.status(400).json({ message: `Invalid status for room ${room.roomNumber}. Valid statuses are: Available, Booked, Under Maintenance.` });
//             }
//         }

//         // Count available rooms
//         const availableRoomCount = roomDetails.filter(room => room.status === 'Available').length;
//         const totalAvailableRoom = parseFloat(req.body.totalAvailableRoom);
//         if (totalAvailableRoom !== availableRoomCount) {
//             return res.status(400).json({
//                 message: 'The totalAvailableRoom count does not match the number of available rooms in roomDetails',
//             });
//         }

//         // Handle image file paths
//         // const images = req.files ? req.files.map(file => `uploads/rooms/${file.path.replace(/\\/g, '/')}`) : [];

//         // Handle tax types and amenities as arrays of ObjectIds
//         const parsedTaxTypes = Array.isArray(taxTypes) ? taxTypes : taxTypes.split(',').map(id => id.trim());
//         const parsedAmenities = Array.isArray(amenities) ? amenities : amenities.split(',').map(id => id.trim());

//         // Handle features (boolean fields)
//         const parsedFeatures = {
//             smokingAllowed: Boolean(features.smokingAllowed),
//             petFriendly: Boolean(features.petFriendly),
//             accessible: Boolean(features.accessible),
//         };

//         // Validate cancellation policy
//         const validCancellationPolicy = cancellationPolicy ? {
//             before7Days: cancellationPolicy.before7Days || 0,
//             between7To2Days: cancellationPolicy.between7To2Days || 25,
//             between48To24Hours: cancellationPolicy.between48To24Hours || 50,
//             lessThan24Hours: cancellationPolicy.lessThan24Hours || 100,
//         } : {};

//         // Update the room category fields
//         roomWithCategory.categoryName = categoryName || roomWithCategory.categoryName;
//         roomWithCategory.description = description || roomWithCategory.description;
//         roomWithCategory.checkInTime = checkInTime || roomWithCategory.checkInTime;
//         roomWithCategory.checkOutTime = checkOutTime || roomWithCategory.checkOutTime;
//         roomWithCategory.maxAllowedPerRoom = maxAllowedPerRoom || roomWithCategory.maxAllowedPerRoom;
//         roomWithCategory.roomDetails = roomDetails || roomWithCategory.roomDetails;
//         roomWithCategory.priceRange = parsedPriceRange;
//         roomWithCategory.pricingDetails = parsedPricingDetails;
//         roomWithCategory.pricingDetailDescription = pricingDetailDescription || roomWithCategory.pricingDetailDescription;
//         roomWithCategory.extraBedPrice = parseFloat(extraBedPrice) || roomWithCategory.extraBedPrice;
//         roomWithCategory.specialDayTariff = parsedSpecialDayDetails || roomWithCategory.specialDayTariff;
//         roomWithCategory.taxTypes = parsedTaxTypes;
//         roomWithCategory.amenities = parsedAmenities;
//         roomWithCategory.cancellationPolicy = validCancellationPolicy;
//         roomWithCategory.breakfastIncluded = breakfastIncluded || roomWithCategory.breakfastIncluded;
//         roomWithCategory.roomSize = parseFloat(roomSize) || roomWithCategory.roomSize;
//         roomWithCategory.bedType = bedType || roomWithCategory.bedType;
//         roomWithCategory.features = parsedFeatures;
//         roomWithCategory.status = status || roomWithCategory.status;
//         // roomWithCategory.images = images.length > 0 ? images : roomWithCategory.images;

//         // Save the updated room category
//         await roomWithCategory.save();

//         // Return success message
//         return res.status(200).json({
//             message: 'Room category updated successfully',
//             roomWithCategory,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Server error while updating room category', error: error.message });
//     }
// };
const updateRoomWithCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            categoryName,
            description,
            checkInTime,
            checkOutTime,
            maxAllowedPerRoom,
            roomDetails,
            priceRange,
            pricingDetails,
            pricingDetailDescription,
            extraBedPrice,
            specialDayTariff,
            taxTypes,
            amenities,
            cancellationPolicy,
            breakfastIncluded,
            roomSize,
            bedType,
            features,
            status,
        } = req.body;

        // Find the room category by ID
        const roomWithCategory = await RoomWithCategory.findById(id);

        if (!roomWithCategory || roomWithCategory.isDeleted) {
            return res.status(404).json({ message: 'Room category not found or has been deleted' });
        }

        // Validate price range
        if (priceRange && (priceRange.minPrice < 0 || priceRange.maxPrice < 0)) {
            return res.status(400).json({ message: 'Price range cannot be negative' });
        }
        const parsedPriceRange = priceRange ? {
            minPrice: parseFloat(priceRange.minPrice),
            maxPrice: parseFloat(priceRange.maxPrice),
        } : undefined;

        // Validate pricing details
        const parsedPricingDetails = pricingDetails && Array.isArray(pricingDetails) && pricingDetails.length > 0 ? pricingDetails.map(detail => ({
            guestType: detail.guestType,
            price: parseFloat(detail.price),
            description: detail.description || '',
        })) : undefined;

        // Parse special day tariff
        const parsedSpecialDayDetails = specialDayTariff && Array.isArray(specialDayTariff) ? specialDayTariff.map(detail => ({
            special_day_name: detail.special_day_name || '',
            startDate: detail.startDate ? new Date(detail.startDate) : null,
            endDate: detail.endDate ? new Date(detail.endDate) : null,
            extraCharge: detail.extraCharge ? parseFloat(detail.extraCharge) : 0,
        })) : undefined;

        // Validate room details
        const parsedRoomDetails = roomDetails && Array.isArray(roomDetails) && roomDetails.length > 0 ? roomDetails : undefined;

        const availableRoomCount = parsedRoomDetails ? parsedRoomDetails.filter(room => room.status === 'Available').length : 0;
        const totalAvailableRoom = req.body.totalAvailableRoom ? parseFloat(req.body.totalAvailableRoom) : undefined;

        if (totalAvailableRoom && totalAvailableRoom !== availableRoomCount) {
            return res.status(400).json({
                message: 'The totalAvailableRoom count does not match the number of available rooms in roomDetails',
            });
        }

        // Handle tax types and amenities
        const parsedTaxTypes = taxTypes ? (Array.isArray(taxTypes) ? taxTypes : taxTypes.split(',').map(id => id.trim())) : undefined;
        const parsedAmenities = amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(id => id.trim())) : undefined;

        // Handle features (boolean fields)
        const parsedFeatures = features ? {
            smokingAllowed: Boolean(features.smokingAllowed),
            petFriendly: Boolean(features.petFriendly),
            accessible: Boolean(features.accessible),
        } : undefined;

        // Validate and parse cancellation policy
        const validCancellationPolicy = cancellationPolicy ? {
            before7Days: cancellationPolicy.before7Days || 0,
            between7To2Days: cancellationPolicy.between7To2Days || 25,
            between48To24Hours: cancellationPolicy.between48To24Hours || 50,
            lessThan24Hours: cancellationPolicy.lessThan24Hours || 100,
        } : undefined;

        // Only update the fields provided in the request body
        if (categoryName) roomWithCategory.categoryName = categoryName;
        if (description) roomWithCategory.description = description;
        if (checkInTime) roomWithCategory.checkInTime = checkInTime;
        if (checkOutTime) roomWithCategory.checkOutTime = checkOutTime;
        if (maxAllowedPerRoom) roomWithCategory.maxAllowedPerRoom = maxAllowedPerRoom;
        if (parsedRoomDetails) roomWithCategory.roomDetails = parsedRoomDetails;
        if (parsedPriceRange) roomWithCategory.priceRange = parsedPriceRange;
        if (parsedPricingDetails) roomWithCategory.pricingDetails = parsedPricingDetails;
        if (pricingDetailDescription) roomWithCategory.pricingDetailDescription = pricingDetailDescription;
        if (extraBedPrice) roomWithCategory.extraBedPrice = parseFloat(extraBedPrice);
        if (parsedSpecialDayDetails) roomWithCategory.specialDayTariff = parsedSpecialDayDetails;
        if (parsedTaxTypes) roomWithCategory.taxTypes = parsedTaxTypes;
        if (parsedAmenities) roomWithCategory.amenities = parsedAmenities;
        if (validCancellationPolicy) roomWithCategory.cancellationPolicy = validCancellationPolicy;
        if (breakfastIncluded) roomWithCategory.breakfastIncluded = breakfastIncluded;
        if (roomSize) roomWithCategory.roomSize = parseFloat(roomSize);
        if (bedType) roomWithCategory.bedType = bedType;
        if (parsedFeatures) roomWithCategory.features = parsedFeatures;
        if (status) roomWithCategory.status = status;

        // Save the updated room category
        await roomWithCategory.save();

        // Return success message
        return res.status(200).json({
            message: 'Room category updated successfully',
            roomWithCategory,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error while updating room category', error: error.message });
    }
};



const getActiveRoomsWithCategory = async (req, res) => {
    try {
        const { checkIn, checkOut, roomCount } = req.query;

        // Validate input
        if (!checkIn || !checkOut || !roomCount) {
            return res.status(400).json({ message: 'Missing required fields: checkIn, checkOut, roomCount' });
        }

        // if (roomCount > 2) {
        //     return res.status(400).json({ message: 'Not Applicable greater than 2 rooms Booking!' });
        // }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (isNaN(checkInDate) || isNaN(checkOutDate) || checkInDate >= checkOutDate) {
            return res.status(400).json({ message: 'Invalid check-in or check-out dates' });
        }

        const roomCountNumber = parseInt(roomCount, 10);
        if (isNaN(roomCountNumber) || roomCountNumber <= 0) {
            return res.status(400).json({ message: 'Invalid room count' });
        }

        // Step 1: Find room categories with available rooms
        const roomsWithCategory = await RoomWithCategory.find({
            isDeleted: false,
            // totalAvailableRoom: { $gte: roomCountNumber },
        })
            .populate('categoryName')
            .populate('taxTypes')
            .populate('amenities')
            .sort({ categoryName: 1 });

        if (roomsWithCategory.length === 0) {
            return res.status(404).json({ message: 'No rooms available for the specified criteria' });
        }

        // Step 2: Filter rooms by checking bookings
        const availableRooms = [];

        for (const category of roomsWithCategory) {
            // Find overlapping bookings for this category
            const overlappingBookings = await RoomBooking.find({
                'roomCategoryCounts.roomType': category._id,
                'bookingDates.checkIn': { $lt: checkOutDate },
                'bookingDates.checkOut': { $gt: checkInDate },
                isDeleted: false,
            });

            // Calculate total booked rooms for this category
            const bookedRoomCount = overlappingBookings.reduce((count, booking) => {
                const categoryBooking = booking.roomCategoryCounts.find(
                    (r) => r.roomType.toString() === category._id.toString()
                );
                return count + (categoryBooking ? categoryBooking.roomCount : 0);
            }, 0);

            // Check if sufficient rooms are available
            // if (category.totalAvailableRoom - bookedRoomCount >= roomCountNumber) {
            if (category.totalAvailableRoom - bookedRoomCount > 0) {
                availableRooms.push(category);
            }
        }

        if (availableRooms.length === 0) {
            return res.status(404).json({ message: 'No available rooms found for the specified dates' });
        }

        return res.status(200).json({
            message: 'Available rooms fetched successfully',
            data: availableRooms,
        });
    } catch (error) {
        console.error('Error fetching available rooms:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



const deleteRoomWithCaegoryImage = async (req, res) => {
    const { categoryId, index } = req.params;

    try {
        const room = await RoomWithCategory.findById(categoryId);
        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }

        // Check if the index is valid
        if (index < 0 || index >= room.images.length) {
            return res.status(400).json({ message: "Invalid image index." });
        }

        // Get the image path and remove it from the array
        const imagePath = room.images[index];
        room.images.splice(index, 1);

        // Delete the image file from the server
        const filePath = path.join(__dirname, "..", imagePath);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Failed to delete image file:", err);
            }
        });

        await room.save();
        return res.status(200).json({ message: "Image deleted successfully." });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to delete image.", error });
    }
};


const uploadRoomWithCaegoryImage = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const room = await RoomWithCategory.findById(categoryId);
        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }

        // Check if images are provided
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please provide room images!" });
        }

        // Get image file paths and ensure cross-platform compatibility
        const imagePaths = req.files.map((file) => `/${file.path.replace(/\\/g, '/')}`);

        // Add the new image paths to the room's images array
        room.images.push(...imagePaths);

        // Save the updated room data
        await room.save();

        return res.status(200).json({ message: "Images uploaded successfully.", images: imagePaths });
    } catch (error) {
        console.error("Error uploading images:", error);
        return res.status(500).json({ message: "Failed to upload images.", error: error.message });
    }
};


module.exports = {
    addRoomWithCategory,
    getAllRoomWithCategories,
    getRoomWithCategoryById,
    deleteRoomWithCategory,
    updateRoomWithCategory,
    getActiveRoomsWithCategory,
    deleteRoomWithCaegoryImage,
    uploadRoomWithCaegoryImage
};
