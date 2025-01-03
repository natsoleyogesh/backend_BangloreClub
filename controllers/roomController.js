const Room = require("../models/room");
const RoomBooking = require('../models/roomBooking');  // Path to your RoomBooking model
const RoomWithCategory = require('../models/roomWithCategory');
const QRCodeHelper = require('../utils/helper');
const moment = require('moment');
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const { addBilling } = require("./billingController");
const { createRequest, updateRequest } = require("./allRequestController");
const AllRequest = require("../models/allRequest");
const { createNotification } = require("../utils/pushNotification");

// Add Room Function
const addRoom = async (req, res) => {
    try {
        const {
            roomName,
            roomNumber,
            floorNumber,
            roomType,
            minPrice,
            maxPrice,
            capacity,
            amenities,
            roomSize,
            bedType,
            smokingAllowed,
            petFriendly,
            accessible,
            status,
            description,
        } = req.body;
        console.log(req.body, "body")
        // Check if images are provided
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please provide room images!' });
        }

        // Get image file paths
        const images = req.files.map((file) => `/${file.path.replace(/\\/g, '/')}`);

        // Parse amenities as an array
        const parsedAmenities = Array.isArray(amenities)
            ? amenities
            : amenities.replace(/[\[\]"']/g, '').split(',').map((item) => item.trim());

        // Parse features
        const features = {
            smokingAllowed: smokingAllowed === 'true' || smokingAllowed === true,
            petFriendly: petFriendly === 'true' || petFriendly === true,
            accessible: accessible === 'true' || accessible === true,
        };

        // Construct the priceRange object
        const priceRange = {
            minPrice: parseFloat(minPrice),
            maxPrice: parseFloat(maxPrice),
        };


        let pricingDetails = []
        if (req.body.pricingDetails.length > 0) {
            pricingDetails = req.body.pricingDetails;

        }

        // Create a new Room document
        const newRoom = new Room({
            roomName,
            roomNumber: parseInt(roomNumber),
            floorNumber: parseInt(floorNumber),
            roomType,
            priceRange,
            pricingDetails,
            capacity: parseInt(capacity),
            amenities: parsedAmenities,
            roomSize: parseInt(roomSize),
            bedType,
            features,
            status,
            images,
            description,
        });

        // Save the new room to the database
        await newRoom.save();
        return res.status(201).json({ message: 'Room added successfully', room: newRoom });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error while adding room', error: error.message });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('roomType');
        return res.status(200).json({ message: 'Rooms fetched successfully', rooms });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error while fetching rooms', error: error.message });
    }
}

const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Please Provide The Room Id' });
        }
        const room = await Room.findById(id).populate('roomType');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        return res.status(200).json({ message: 'Room fetched successfully', room });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error while fetching room', error: error.message });
    }
}

// Update Room Function
const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Please provide the room ID' });
        }
        console.log(req.body, req.body.pricingDetails.length, "body")
        // Ensure the room exists before updating
        const existingRoom = await Room.findById(id);
        if (!existingRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Initialize an update object
        const updateFields = {};

        // Check and update each field if provided in req.body
        if (req.body.roomName) updateFields.roomName = req.body.roomName;
        if (req.body.roomNumber) updateFields.roomNumber = parseInt(req.body.roomNumber);
        if (req.body.floorNumber) updateFields.floorNumber = parseInt(req.body.floorNumber);
        if (req.body.roomType) updateFields.roomType = req.body.roomType;

        // Parse priceRange if minPrice or maxPrice is provided
        if (req.body.minPrice || req.body.maxPrice) {
            updateFields.priceRange = {
                minPrice: req.body.minPrice ? parseFloat(req.body.minPrice) : existingRoom.priceRange.minPrice,
                maxPrice: req.body.maxPrice ? parseFloat(req.body.maxPrice) : existingRoom.priceRange.maxPrice,
            };
        }

        // Parse pricingDetails if provided
        if (req.body.pricingDetails.length > 0) {
            updateFields.pricingDetails = req.body.pricingDetails;

        }

        if (req.body.capacity) updateFields.capacity = parseInt(req.body.capacity);

        // Parse amenities as an array
        if (req.body.amenities) {
            updateFields.amenities = Array.isArray(req.body.amenities)
                ? req.body.amenities
                : req.body.amenities.replace(/[\[\]"']/g, '').split(',').map((item) => item.trim());
        }

        if (req.body.roomSize) updateFields.roomSize = parseInt(req.body.roomSize);
        if (req.body.bedType) updateFields.bedType = req.body.bedType;

        // Parse features if provided
        // if (req.body.smokingAllowed || req.body.petFriendly || req.body.accessible) {
        updateFields.features = {
            smokingAllowed: req.body.smokingAllowed,//=== 'true' || req.body.smokingAllowed === true,
            petFriendly: req.body.petFriendly,//=== 'true' || req.body.petFriendly === true,
            accessible: req.body.accessible,// === 'true' || req.body.accessible === true,
        };
        // }

        if (req.body.status) updateFields.status = req.body.status;
        if (req.body.description) updateFields.description = req.body.description;

        // Perform the update using findByIdAndUpdate
        const updatedRoom = await Room.findByIdAndUpdate(id, { $set: updateFields }, {
            new: true, // Return the updated document
            runValidators: true, // Apply schema validation
        });

        return res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error while updating room', error: error.message });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Please Provide The Room Id' });
        }
        const deletedRoom = await Room.findByIdAndDelete(id);
        if (!deletedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting room', error: error.message });
    }
}

const deleteRoomImage = async (req, res) => {
    const { roomId, index } = req.params;

    try {
        const room = await Room.findById(roomId);
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

const uploadRoomImage = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findById(roomId);
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

const getAllAvailableRooms = async (req, res) => {
    try {
        const { roomType, fromDate, toDate } = req.query;

        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        // Base match criteria for available rooms
        const matchCriteria = {
            status: 'Available',
            isDeleted: false,
        };

        // Validate and filter by roomType if provided
        if (roomType) {
            if (!mongoose.Types.ObjectId.isValid(roomType)) {
                return res.status(400).json({ message: 'Invalid roomType ID format' });
            }
            matchCriteria.roomType = new mongoose.Types.ObjectId(roomType);
        }

        // Filter by date range if fromDate and toDate are provided
        if (from && to) {
            matchCriteria.bookedDates = {
                $not: {
                    $elemMatch: {
                        $or: [
                            { fromDate: { $lt: to }, toDate: { $gt: from } },
                        ],
                    },
                },
            };
        }

        // Fetch available rooms with aggregation
        const availableRooms = await Room.aggregate([
            { $match: matchCriteria },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'roomType',
                    foreignField: '_id',
                    as: 'roomTypeDetails',
                },
            },
            { $unwind: '$roomTypeDetails' },
            {
                $group: {
                    _id: '$roomType',
                    roomTypeName: { $first: '$roomTypeDetails.name' },
                    count: { $sum: 1 },
                    rooms: { $push: '$$ROOT' },
                },
            },
            { $sort: { roomTypeName: 1 } },
        ]);

        // Check if no rooms were found
        if (availableRooms.length === 0) {
            return res.status(404).json({ message: 'No available rooms found' });
        }

        return res.status(200).json({ message: 'Available rooms fetched successfully', data: availableRooms });
    } catch (error) {
        console.error('Error fetching available rooms:', error);
        return res.status(500).json({ message: 'Server error while fetching available rooms', error: error.message });
    }
};

// ALL BOOKING APIS FUNCTIONS
const createRoomBooking = async (req, res) => {
    try {
        // Destructure the request body
        const {
            primaryMemberId,
            memberType,
            memberDetails,
            roomCategoryCounts,
            bookingDates,
            paymentMode,
            guestContact
        } = req.body;

        // Validate totalOccupants
        const totalMembers = memberDetails.length;
        const totalOccupants = roomCategoryCounts.reduce((acc, roomCategoryCount) => acc + roomCategoryCount.memberCounts.totalOccupants, 0);

        if (totalOccupants !== totalMembers) {
            return res.status(400).json({ message: 'Total occupants do not match the number of members provided' });
        }

        // Validate guestContact for guests
        if (memberType === 'Guest of Member' && !guestContact) {
            return res.status(400).json({ message: "Please provide the guest's contact details" });
        }

        let totalAmount = 0;
        let totalTaxAmount = 0;
        let extraBedTotal = 0;
        let specialDayExtraCharge = 0;

        // Calculate the total number of days of stay
        const checkInDate = moment(bookingDates.checkIn);
        const checkOutDate = moment(bookingDates.checkOut);

        const stayDuration = checkOutDate.diff(checkInDate, 'days');

        // Check if stay duration is valid
        if (stayDuration <= 0) {
            return res.status(400).json({ message: 'Invalid booking dates. Check-out date must be after check-in date.' });
        }

        for (const roomCategoryCount of roomCategoryCounts) {
            const { roomType, roomCount, extraBedCount, memberCounts } = roomCategoryCount;

            const roomCategory = await RoomWithCategory.findById(roomType).populate('taxTypes');
            if (!roomCategory) {
                return res.status(400).json({ message: `Room type with ID ${roomType} not found.` });
            }

            // Fetch pricing details
            const pricingDetails = roomCategory.pricingDetails || [];
            const priceDetail = pricingDetails.find(p => p.guestType === memberType);

            if (!priceDetail) {
                return res.status(400).json({ message: 'Pricing details not found for this member type' });
            }

            const roomPrice = priceDetail.price;
            const extraBedCharge = roomCategory.extraBedPrice;

            // Validate pricing values
            if (isNaN(roomPrice) || roomPrice <= 0) {
                return res.status(400).json({ message: 'Invalid room price' });
            }
            if (isNaN(extraBedCharge) || extraBedCharge < 0) {
                return res.status(400).json({ message: 'Invalid extra bed charge' });
            }

            // Calculate the room's total price for the stay duration
            const roomTotalPrice = roomPrice * roomCount * stayDuration; // Multiply by stay duration
            const extraBedCategoryTotal = extraBedCount * extraBedCharge * stayDuration;
            const finalRoomAmount = roomTotalPrice + extraBedCategoryTotal

            let roomTaxAmount = 0;
            let taxTypes = [];

            roomCategory.taxTypes.forEach((tax) => {
                const taxAmount = (finalRoomAmount * tax.percentage) / 100;
                roomTaxAmount += taxAmount;
                taxTypes.push({
                    taxType: tax.name,
                    taxRate: tax.percentage,
                    taxAmount: taxAmount
                });
            });

            const categoryTotalAmount = roomTotalPrice + extraBedCategoryTotal; // Include extra bed charges
            const categoryFinalAmount = categoryTotalAmount + roomTaxAmount; // Include total tax amount

            roomCategoryCount.roomPrice = roomPrice;
            roomCategoryCount.extraBedCharge = extraBedCharge;
            roomCategoryCount.extraBedTotalCharges = extraBedCategoryTotal;
            roomCategoryCount.totalAmount = categoryTotalAmount;
            roomCategoryCount.totalTaxAmount = roomTaxAmount;
            roomCategoryCount.final_amount = categoryFinalAmount; // New field

            totalAmount += categoryTotalAmount;
            totalTaxAmount += roomTaxAmount;
            extraBedTotal += extraBedCategoryTotal;

            roomCategoryCount.taxTypes = taxTypes;
            roomCategoryCount.memberCounts = memberCounts;

            // Calculate special day extra charges
            if (roomCategory.specialDayTariff && Array.isArray(roomCategory.specialDayTariff)) {
                roomCategory.specialDayTariff.forEach((specialDay) => {
                    const { startDate, endDate, extraCharge } = specialDay;
                    const start = moment(startDate);
                    const end = moment(endDate);

                    const overlapStartDate = moment.max(checkInDate, start);
                    const overlapEndDate = moment.min(checkOutDate, end);

                    const overlapDays = overlapEndDate.diff(overlapStartDate, 'days') + 1;
                    if (overlapDays > 0) {
                        specialDayExtraCharge += extraCharge * overlapDays;
                    }
                });
            }
        }

        const finalTotalAmount = totalAmount + totalTaxAmount + specialDayExtraCharge;

        // Validate final amount
        if (isNaN(finalTotalAmount) || finalTotalAmount <= 0) {
            return res.status(400).json({ message: 'Invalid total amount' });
        }

        const finalTotalTaxAmount = totalTaxAmount;

        // Generate a unique QR code for the booking
        const uniqueNumber = Math.floor(Math.random() * 10000000000); // Generates a random 10-digit number
        const uniqueQRCode = `QR${uniqueNumber}`; // The unique QR code string (QR + 10-digit number)
        const allDetailsQRCodeData = {
            uniqueQRCode,
            primaryMemberId,
            memberType,
            memberDetails,
            guestContact,
            roomCategoryCounts,
            bookingDates: {
                dayStay: stayDuration,
                checkIn: bookingDates.checkIn,
                checkOut: bookingDates.checkOut
            },
            paymentMode,
            pricingDetails: {
                final_totalAmount: finalTotalAmount,
                final_totalTaxAmount: finalTotalTaxAmount,
                specialDayExtraCharge: specialDayExtraCharge,
                extraBedTotal: extraBedTotal
            },
            paymentStatus: 'Pending',
            bookingStatus: 'Pending',
        };
        const allDetailsQRCode = await QRCodeHelper.generateQRCode(allDetailsQRCodeData);

        // Create room booking object
        const roomBooking = new RoomBooking({
            primaryMemberId,
            memberType,
            memberDetails,
            guestContact,
            roomCategoryCounts,
            bookingDates,
            paymentMode,
            pricingDetails: {
                final_totalAmount: finalTotalAmount,
                final_totalTaxAmount: finalTotalTaxAmount,
                extraBedTotal: extraBedTotal,
                specialDayExtraCharge: specialDayExtraCharge
            },
            paymentStatus: 'Pending',
            bookingStatus: 'Pending',
            allDetailsQRCode,
            uniqueQRCode
        });

        await roomBooking.save();
        await createRequest(req, {
            primaryMemberId: roomBooking.primaryMemberId,
            departmentId: roomBooking._id,
            department: "RoomBooking",
            status: roomBooking.bookingStatus,
            description: "This is a Room Booking Request."
        });
        // Save the room booking

        return res.status(201).json({
            message: 'Room booking created successfully',
            roomBooking
        });

    } catch (error) {
        console.error('Error creating room booking:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

const createRoomBookingDetails = async (req, res) => {
    try {
        const {
            primaryMemberId,
            memberType,
            memberDetails,
            roomCategoryCounts,
            bookingDates,
            paymentMode,
            guestContact
        } = req.body;

        const totalMembers = memberDetails.length;
        const totalOccupants = roomCategoryCounts.reduce((acc, roomCategoryCount) => acc + roomCategoryCount.memberCounts.totalOccupants, 0);

        if (totalOccupants !== totalMembers) {
            return res.status(400).json({ message: 'Total occupants do not match the number of members provided' });
        }

        if (memberType === 'Guest of Member' && !guestContact) {
            return res.status(400).json({ message: "Please provide the guest's contact details" });
        }

        let totalAmount = 0;
        let totalTaxAmount = 0;
        let extraBedTotal = 0;
        let specialDayExtraCharge = 0;

        const checkInDate = moment(bookingDates.checkIn);
        const checkOutDate = moment(bookingDates.checkOut);
        const stayDuration = checkOutDate.diff(checkInDate, 'days');

        if (stayDuration <= 0) {
            return res.status(400).json({ message: 'Invalid booking dates. Check-out date must be after check-in date.' });
        }

        for (const roomCategoryCount of roomCategoryCounts) {
            const { roomType, roomCount, extraBedCount } = roomCategoryCount;

            const roomCategory = await RoomWithCategory.findById(roomType)
                .populate('categoryName') // Populate categoryName here
                .populate('taxTypes');

            if (!roomCategory) {
                return res.status(400).json({ message: `Room type with ID ${roomType} not found.` });
            }

            const pricingDetails = roomCategory.pricingDetails || [];
            const priceDetail = pricingDetails.find(p => p.guestType === memberType);

            if (!priceDetail) {
                return res.status(400).json({ message: 'Pricing details not found for this member type' });
            }

            const roomPrice = priceDetail.price;
            const extraBedCharge = roomCategory.extraBedPrice;

            if (isNaN(roomPrice) || roomPrice <= 0) {
                return res.status(400).json({ message: 'Invalid room price' });
            }
            if (isNaN(extraBedCharge) || extraBedCharge < 0) {
                return res.status(400).json({ message: 'Invalid extra bed charge' });
            }

            const roomTotalPrice = roomPrice * roomCount * stayDuration;
            const extraBedCategoryTotal = extraBedCount * extraBedCharge * stayDuration;
            const finalRoomAmount = roomTotalPrice + extraBedCategoryTotal
            let roomTaxAmount = 0;
            let taxTypes = [];

            roomCategory.taxTypes.forEach((tax) => {
                const taxAmount = ((finalRoomAmount) * tax.percentage) / 100;
                roomTaxAmount += taxAmount;
                taxTypes.push({
                    taxType: tax.name,
                    taxRate: tax.percentage,
                    taxAmount: taxAmount
                });
            });

            const categoryTotalAmount = roomTotalPrice + extraBedCategoryTotal;
            const categoryFinalAmount = categoryTotalAmount + roomTaxAmount;

            roomCategoryCount.roomPrice = roomPrice;
            roomCategoryCount.extraBedCharge = extraBedCharge;
            roomCategoryCount.extraBedTotalCharges = extraBedCategoryTotal;
            roomCategoryCount.totalAmount = categoryTotalAmount;
            roomCategoryCount.totalTaxAmount = roomTaxAmount;
            roomCategoryCount.final_amount = categoryFinalAmount;
            roomCategoryCount.categoryName = roomCategory.categoryName.name; // Include category name here
            roomCategoryCount.taxTypes = taxTypes;

            totalAmount += categoryTotalAmount;
            totalTaxAmount += roomTaxAmount;
            extraBedTotal += extraBedCategoryTotal;

            if (roomCategory.specialDayTariff && Array.isArray(roomCategory.specialDayTariff)) {
                roomCategory.specialDayTariff.forEach((specialDay) => {
                    const { startDate, endDate, extraCharge } = specialDay;
                    const start = moment(startDate);
                    const end = moment(endDate);

                    const overlapStartDate = moment.max(checkInDate, start);
                    const overlapEndDate = moment.min(checkOutDate, end);

                    const overlapDays = overlapEndDate.diff(overlapStartDate, 'days') + 1;
                    if (overlapDays > 0) {
                        specialDayExtraCharge += extraCharge * overlapDays;
                    }
                });
            }
        }

        const finalTotalAmount = totalAmount + totalTaxAmount + specialDayExtraCharge;

        if (isNaN(finalTotalAmount) || finalTotalAmount <= 0) {
            return res.status(400).json({ message: 'Invalid total amount' });
        }

        const finalTotalTaxAmount = totalTaxAmount;

        const roomBooking = {
            primaryMemberId,
            memberType,
            memberDetails,
            guestContact,
            roomCategoryCounts,
            bookingDates: {
                dayStay: stayDuration,
                checkIn: bookingDates.checkIn,
                checkOut: bookingDates.checkOut
            },
            paymentMode,
            pricingDetails: {
                final_totalAmount: finalTotalAmount,
                final_totalTaxAmount: finalTotalTaxAmount,
                specialDayExtraCharge: specialDayExtraCharge,
                extraBedTotal: extraBedTotal
            },
            paymentStatus: 'Pending',
            bookingStatus: 'Pending',
        };

        return res.status(201).json({
            message: 'Room booking details fetched successfully',
            roomBooking
        });

    } catch (error) {
        console.error('Error creating room booking:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

function calculateTotalAmount(booking) {
    let totalAmount = 0;
    let totalTaxAmount = 0;

    booking.roomCategoryCounts.forEach(roomCategoryCount => {
        const { roomPrice, roomCount, taxRate } = roomCategoryCount;
        const roomTotalPrice = roomPrice * roomCount;
        const taxAmount = (roomTotalPrice * taxRate) / 100;
        totalAmount += roomTotalPrice;
        totalTaxAmount += taxAmount;
    });

    // Add total tax amount to the final total amount
    return totalAmount + totalTaxAmount;
}

// Calculate total tax amount
function calculateTotalTaxAmount(booking) {
    let totalTaxAmount = 0;

    booking.roomCategoryCounts.forEach(roomCategoryCount => {
        const { roomPrice, roomCount, taxRate } = roomCategoryCount;
        const roomTotalPrice = roomPrice * roomCount;
        const taxAmount = (roomTotalPrice * taxRate) / 100;
        totalTaxAmount += taxAmount;
    });

    return totalTaxAmount;
}

const getAllBookings = async (req, res) => {
    try {
        const bookings = await RoomBooking.find({ isDeleted: false })
            // .populate('roomCategoryCounts.roomType') // Populate RoomWithCategory fields
            .populate({
                path: 'roomCategoryCounts.roomType',
                populate: {
                    path: 'categoryName', // Assuming banquetName references BanquetCategory
                    model: 'Category',
                },
            })
            .populate('primaryMemberId') // Populate User fields (assuming User model has these fields)
            .sort({ createdAt: -1 });  // Sort by 'createdAt' in descending order
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found' });
        }

        return res.status(200).json({ message: "Fetch All Bookings Successfully", bookings });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error retrieving bookings', error: err.message });
    }
};

const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Validate that the bookingId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

        // const booking = await RoomBooking.findById(bookingId)
        const booking = await RoomBooking.findOne({ _id: bookingId, isDeleted: false })  // Exclude soft-deleted bookings
            // .populate('roomCategoryCounts.roomType') // Populate RoomWithCategory fields
            .populate({
                path: 'roomCategoryCounts.roomType',
                populate: {
                    path: 'categoryName', // Assuming banquetName references BanquetCategory
                    model: 'Category',
                },
            })
            .populate('primaryMemberId') // Populate User fields
            .exec();

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Check if roomNumbers contains any populated data
        console.log('Populated roomNumbers:', booking.roomCategoryCounts);
        // Step 2: Get all roomCategoryCounts and their roomNumbers
        const populatedRoomCategoryCounts = await Promise.all(
            booking.roomCategoryCounts.map(async (category) => {
                // Fetch the RoomWithCategory document for the current roomType
                const roomCategory = await RoomWithCategory.findById(category.roomType);

                if (!roomCategory) {
                    return {
                        ...category.toObject(),
                        roomDetails: [],
                    };
                }

                // Map roomNumbers to their corresponding details from roomDetails
                const detailedRoomNumbers = category.roomNumbers.map((roomId) => {
                    const roomDetail = roomCategory.roomDetails.find((room) => room._id.equals(roomId));
                    return roomDetail || null; // Add room detail if found, or null if not
                });

                return {
                    ...category.toObject(),
                    roomNumbers: detailedRoomNumbers.filter((room) => room !== null), // Filter out nulls
                };
            })
        );

        // Step 3: Attach populated roomCategoryCounts to the booking object
        const response = {
            ...booking.toObject(),
            roomCategoryCounts: populatedRoomCategoryCounts,
        };


        return res.status(200).json({ mesage: "Booking Details Fetch Successfully", response });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error retrieving booking', error: err.message });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const primaryMemberId = req.user.userId; // Assuming the user is authenticated, and their ID is stored in req.user._id
        const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if no query params are provided

        const skip = (page - 1) * limit; // Skip the results for pagination

        // Step 1: Fetch bookings (without the populated roomCategoryCounts)
        const bookings = await RoomBooking.find({ primaryMemberId, isDeleted: false })
            .populate('roomCategoryCounts.roomType', '-roomDetails') // Populate RoomWithCategory fields
            .populate('primaryMemberId') // Populate User fields
            .sort({ createdAt: -1 }) // Sort by 'createdAt' in descending order
            .skip(skip) // Skip results for pagination
            .limit(Number(limit)); // Limit the number of results per page

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found for this user' });
        }

        // Step 2: Manually populate the roomCategoryCounts and their related room details
        const populatedBookings = await Promise.all(
            bookings.map(async (booking) => {
                // Step 3: Populate the roomCategoryCounts (as shown in your previous code)
                const populatedRoomCategoryCounts = await Promise.all(
                    booking.roomCategoryCounts.map(async (category) => {
                        // Fetch the RoomWithCategory document for the current roomType
                        const roomCategory = await RoomWithCategory.findById(category.roomType);

                        if (!roomCategory) {
                            return {
                                ...category.toObject(),
                                roomDetails: [],
                            };
                        }

                        // Map roomNumbers to their corresponding details from roomDetails
                        const detailedRoomNumbers = category.roomNumbers.map((roomId) => {
                            const roomDetail = roomCategory.roomDetails.find((room) => room._id.equals(roomId));
                            return roomDetail || null; // Add room detail if found, or null if not
                        });

                        return {
                            ...category.toObject(),
                            roomNumbers: detailedRoomNumbers.filter((room) => room !== null), // Filter out nulls
                        };
                    })
                );

                // Step 4: Attach populated roomCategoryCounts to the booking object
                return {
                    ...booking.toObject(),
                    roomCategoryCounts: populatedRoomCategoryCounts,
                };
            })
        );

        // Step 5: Get the total number of bookings for pagination info
        const totalBookings = await RoomBooking.countDocuments({ primaryMemberId, isDeleted: false });

        // Calculate total pages
        const totalPages = Math.ceil(totalBookings / limit);

        return res.status(200).json({
            message: "All bookings fetched successfully",
            bookings: populatedBookings,
            pagination: {
                totalBookings,
                totalPages,
                currentPage: page,
                perPage: limit,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error retrieving your bookings', error: err.message });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        // Validate that the bookingId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format' });
        }

        // Find the booking by ID
        const booking = await RoomBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if the booking is already marked as deleted
        if (booking.isDeleted) {
            return res.status(400).json({ message: 'Booking has already been deleted' });
        }

        // Perform soft delete: set 'deleted' flag to true and store deletion timestamp
        booking.isDeleted = true;
        booking.deletedAt = new Date();  // Timestamp for when it was deleted
        await booking.save();

        return res.status(200).json({ message: 'Booking soft deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error deleting booking', error: err.message });
    }
};

// // WORKING CODE BUT ROOM IS NOT STORE 
// const updateRoomAllocation = async (req, res) => {
//     try {
//         const bookingId = req.params.bookingId; // Booking ID from URL
//         const { allocatedRooms, bookingStatus } = req.body; // Data sent in the body for update (array of room allocations)
//         const { userId, role } = req.user;

//         if (!userId || role !== 'admin') {
//             return res.status(400).json({ message: 'Alert You are not update the details!.' });

//         }
//         // Validate booking status
//         const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
//         if (!validStatuses.includes(bookingStatus)) {
//             return res.status(400).json({ message: `Invalid booking status. Valid statuses are: ${validStatuses.join(', ')}.` });
//         }

//         // 1. Find the booking by ID
//         const booking = await RoomBooking.findById(bookingId);
//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }

//         if (booking.isDeleted) {
//             return res.status(400).json({ message: 'Cannot allocate a deleted booking.' });
//         }

//         if (booking.bookingStatus === 'Confirmed') {
//             return res.status(400).json({ message: 'This Request is already Confirmed.' });
//         }


//         // 2. Loop through each room allocation and validate each category
//         for (const allocation of allocatedRooms) {
//             const { roomType, allocatedRoomIds } = allocation;
//             const { checkIn, checkOut } = booking.bookingDates;

//             // Check if the room category exists in the booking's roomCategoryCounts
//             const roomCategoryCount = booking.roomCategoryCounts.find(category => category.roomType.toString() === roomType);
//             if (!roomCategoryCount) {
//                 return res.status(404).json({ message: `Room type ${roomType} not found in this booking` });
//             }

//             // 3. Fetch the room category details from the RoomWithCategory collection
//             const roomWithCategory = await RoomWithCategory.findById(roomType);
//             if (!roomWithCategory) {
//                 return res.status(404).json({ message: 'Room category not found in RoomWithCategory' });
//             }

//             let requestId = null;

//             // Find the request by departmentId instead of using findById
//             const findRequest = await AllRequest.findOne({ departmentId: bookingId }).exec();

//             if (findRequest) {
//                 requestId = findRequest._id;
//             }


//             if (bookingStatus === 'Pending' || bookingStatus === 'Cancelled') {
//                 // Update the booking status
//                 booking.bookingStatus = bookingStatus;
//                 // booking.allDetailsQRCode = allDetailsQRCode;
//                 await booking.save();
//                 // Call the createNotification function
//                 await createNotification({
//                     title: `Your Room Booking Is Rejected`,
//                     send_to: "User",
//                     push_message: "Your Room Booking Is Rejected For Some Details Are Not Validate!",
//                     department: "RoomBooking",
//                     departmentId: booking._id
//                 });


//                 if (requestId !== null) {
//                     await updateRequest(requestId, {
//                         status: bookingStatus,
//                         adminResponse: "The Booking Is Cancelled Due To Some Reason"
//                     });
//                 }

//             }

//             // 4. Check available rooms that meet the date and status requirements
//             const checkAvailabilityForDates = async (roomId) => {
//                 // Fetch all bookings for this room
//                 const bookingsForRoom = await RoomBooking.find({
//                     "roomCategoryCounts.roomNumbers": roomId,
//                     "bookingDates.checkOut": { $gt: checkIn },
//                     "bookingDates.checkIn": { $lt: checkOut },
//                     "isDeleted": false,  // Ensure deleted bookings are excluded
//                 });

//                 // If any bookings overlap, the room is not available
//                 return bookingsForRoom.length === 0;
//             };

//             // Filter rooms that match the allocated room IDs, are available, and do not have conflicts with existing bookings
//             const availableRooms = await Promise.all(
//                 roomWithCategory.roomDetails.filter(room =>
//                     room.status === 'Available' && allocatedRoomIds.includes(room._id.toString())
//                 ).map(async (room) => {
//                     const isAvailable = await checkAvailabilityForDates(room._id);
//                     return isAvailable ? room : null;
//                 })
//             );

//             // Remove unavailable rooms (null values)
//             const validAvailableRooms = availableRooms.filter(room => room !== null);

//             // 5. Check if the number of available rooms is sufficient
//             if (validAvailableRooms.length < allocatedRoomIds.length) {
//                 return res.status(400).json({ message: `Not enough rooms available for room type ${roomType} for the selected dates` });
//             }

//             // 6. Update the booking by allocating rooms
//             booking.roomCategoryCounts.forEach(category => {
//                 if (category.roomType.toString() === roomType) {
//                     console.log(`Updating room numbers for room type: ${roomType}`);
//                     console.log(`Allocated rooms: ${allocatedRoomIds}`);
//                     category.roomNumbers = allocatedRoomIds;
//                 }
//             });
//         }

//         booking.bookingStatus = bookingStatus;

//         // Save the updated booking
//         await booking.save();
//         if (booking.bookingStatus === 'Confirmed') {
//             const subtotal = booking.pricingDetails.final_totalTaxAmount - booking.pricingDetails.final_totalAmount;

//             await addBilling(booking.primaryMemberId, 'Room', { roomBooking: booking._id }, subtotal, 0, booking.pricingDetails.final_totalTaxAmount, booking.pricingDetails.final_totalAmount, userId)

//             await createNotification({
//                 title: `Your Room Booking Is Confirmed`,
//                 send_to: "User",
//                 push_message: "Your Room Booking Is Confirmed Please Pay The Amount!",
//                 department: "RoomBooking",
//                 departmentId: booking._id
//             });

//             if (requestId !== null) {
//                 updateRequest(requestId, { status: bookingStatus, adminResponse: "The Booking Is Confirmed !" })
//             }

//         }

//         return res.status(200).json({ message: 'Room allocation updated successfully', booking });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

const updateRoomAllocation = async (req, res) => {
    try {
        const bookingId = req.params.bookingId; // Booking ID from URL
        const { allocatedRooms, bookingStatus } = req.body; // Allocated rooms and booking status from the request body
        const { userId, role } = req.user; // User information from the request

        // Check if the user has admin privileges
        if (!userId || role !== 'admin') {
            return res.status(400).json({ message: 'Unauthorized: You do not have permission to update the booking.' });
        }

        // Validate the booking status
        const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
        if (!validStatuses.includes(bookingStatus)) {
            return res.status(400).json({ message: `Invalid booking status. Valid statuses are: ${validStatuses.join(', ')}.` });
        }

        // Find the booking by ID
        const booking = await RoomBooking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Check if the booking is deleted
        if (booking.isDeleted) {
            return res.status(400).json({ message: 'Cannot update a deleted booking.' });
        }

        // Check if the booking is already confirmed
        if (booking.bookingStatus === 'Confirmed') {
            return res.status(400).json({ message: 'This booking is already confirmed.' });
        }

        if (bookingStatus === 'Pending' || bookingStatus === 'Cancelled') {
            // Update the booking status
            booking.bookingStatus = bookingStatus;
            // booking.allDetailsQRCode = allDetailsQRCode;
            await booking.save();
            // Call the createNotification function
            // await createNotification({
            //     title: `${booking.banquetType.banquetName.name}Banquet Booking Is Rejected`,
            //     send_to: "User",
            //     push_message: "Your banquet Booking Is Rejected For Some Details Are Not Validate!",
            //     department: "BanquetBooking",
            //     departmentId: booking._id
            // });

            // if (requestId !== null) {
            //     await updateRequest(requestId, {
            //         status: bookingStatus,
            //         adminResponse: "The Booking Is Cancelled Due To Some Reason"
            //     });
            // }
        }

        // Process the allocated rooms
        for (const allocation of allocatedRooms) {
            const { roomType, allocatedRoomIds } = allocation;
            const { checkIn, checkOut } = booking.bookingDates;

            // Check if the room category exists in the booking
            const roomCategoryCount = booking.roomCategoryCounts.find(category => category.roomType.toString() === roomType);
            if (!roomCategoryCount) {
                return res.status(404).json({ message: `Room type ${roomType} not found in this booking.` });
            }

            // Fetch the room category details
            const roomWithCategory = await RoomWithCategory.findById(roomType);
            if (!roomWithCategory) {
                return res.status(404).json({ message: 'Room category not found in RoomWithCategory.' });
            }

            // Validate room availability for the given dates
            const checkRoomAvailability = async (roomId) => {
                const overlappingBookings = await RoomBooking.find({
                    "roomCategoryCounts.roomNumbers": roomId,
                    "bookingDates.checkOut": { $gt: checkIn },
                    "bookingDates.checkIn": { $lt: checkOut },
                    "isDeleted": false, // Exclude deleted bookings
                });

                return overlappingBookings.length === 0;
            };

            const availableRooms = await Promise.all(
                roomWithCategory.roomDetails
                    .filter(room => allocatedRoomIds.includes(room._id.toString()))
                    .map(async (room) => {
                        const isAvailable = await checkRoomAvailability(room._id);
                        return isAvailable ? room : null;
                    })
            );

            const validAvailableRooms = availableRooms.filter(room => room !== null);

            // Check if the required number of rooms is available
            if (validAvailableRooms.length < allocatedRoomIds.length) {
                return res.status(400).json({
                    message: `Not enough rooms available for room type ${roomType} for the selected dates.`,
                });
            }

            // Update the allocated rooms in the booking
            booking.roomCategoryCounts.forEach(category => {
                if (category.roomType.toString() === roomType) {
                    category.roomNumbers = allocatedRoomIds;
                }
            });
        }

        // Update the booking status
        booking.bookingStatus = bookingStatus;

        // Save the updated booking
        await booking.save();

        if (bookingStatus === 'Confirmed') {
            // Add billing details if the booking is confirmed
            const subtotal = booking.pricingDetails.final_totalAmount - booking.pricingDetails.final_totalTaxAmount;
            await addBilling(
                booking.primaryMemberId,
                'Room',
                { roomBooking: booking._id },
                subtotal,
                0,
                booking.pricingDetails.final_totalTaxAmount,
                booking.pricingDetails.final_totalAmount,
                userId
            );

            // Create a notification for the user
            await createNotification({
                title: `Your Room Booking Is Confirmed`,
                send_to: "User",
                push_message: "Your Room Booking is confirmed. Please proceed with the payment.",
                department: "RoomBooking",
                departmentId: booking._id,
            });
        } else if (bookingStatus === 'Cancelled') {
            // Create a cancellation notification for the user
            await createNotification({
                title: `Your Room Booking Is Rejected`,
                send_to: "User",
                push_message: "Your Room Booking has been rejected due to invalid details.",
                department: "RoomBooking",
                departmentId: booking._id,
            });
        }

        return res.status(200).json({ message: 'Room allocation updated successfully.', booking });
    } catch (error) {
        console.error('Error updating room allocation:', error);
        return res.status(500).json({
            message: 'An error occurred while updating room allocation.',
            error: error.message,
        });
    }
};



// const updateRoomAllocation = async (req, res) => {
//     try {
//         const bookingId = req.params.bookingId; // Booking ID from URL
//         const { allocatedRooms } = req.body; // Data sent in the body for update (array of room allocations)

//         // 1. Find the booking by ID
//         const booking = await RoomBooking.findById(bookingId);
//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }

//         // 2. Loop through each room allocation and validate each category
//         for (const allocation of allocatedRooms) {
//             const { roomType, allocatedRoomIds } = allocation;
//             const { checkIn, checkOut } = booking.bookingDates;

//             // Check if the room category exists in the booking's roomCategoryCounts
//             const roomCategoryCount = booking.roomCategoryCounts.find(category => category.roomType.toString() === roomType);
//             if (!roomCategoryCount) {
//                 return res.status(404).json({ message: `Room type ${roomType} not found in this booking` });
//             }

//             // 3. Fetch the room category details from the RoomWithCategory collection
//             const roomWithCategory = await RoomWithCategory.findById(roomType);
//             if (!roomWithCategory) {
//                 return res.status(404).json({ message: 'Room category not found in RoomWithCategory' });
//             }

//             // 4. Check available rooms that meet the date and status requirements
//             const checkAvailabilityForDates = async (roomId) => {
//                 const bookingsForRoom = await RoomBooking.find({
//                     "roomCategoryCounts.roomNumbers": roomId,
//                     "bookingDates.checkOut": { $gt: checkIn },
//                     "bookingDates.checkIn": { $lt: checkOut },
//                     "isDeleted": false,  // Ensure deleted bookings are excluded
//                 });
//                 return bookingsForRoom.length === 0;
//             };

//             // Filter rooms that match the allocated room IDs, are available, and do not have conflicts with existing bookings
//             const availableRooms = await Promise.all(
//                 roomWithCategory.roomDetails.filter(room =>
//                     room.status === 'Available' && allocatedRoomIds.includes(room._id.toString())
//                 ).map(async (room) => {
//                     const isAvailable = await checkAvailabilityForDates(room._id);
//                     return isAvailable ? room : null;
//                 })
//             );

//             // Remove unavailable rooms (null values)
//             const validAvailableRooms = availableRooms.filter(room => room !== null);

//             // 5. Check if the number of available rooms is sufficient
//             if (validAvailableRooms.length < allocatedRoomIds.length) {
//                 return res.status(400).json({ message: `Not enough rooms available for room type ${roomType} for the selected dates` });
//             }

//             // 6. Update the booking by allocating rooms
//             booking.roomCategoryCounts.forEach(category => {
//                 if (category.roomType.toString() === roomType) {
//                     // Logging to ensure roomNumbers is being updated correctly
//                     console.log(`Updating room numbers for room type: ${roomType}`);
//                     console.log(`Allocated rooms: ${allocatedRoomIds}`);
//                     category.roomNumbers = allocatedRoomIds;
//                 }
//             });
//         }

//         // Log the updated booking object to check room allocation changes
//         console.log("Updated booking object:", booking.roomCategoryCounts);

//         // Save the updated booking
//         await booking.save();

//         res.status(200).json({ message: 'Room allocation updated successfully', booking });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// };


// const findRooms = async (req, res) => {
//     const { roomCategoryCounts, bookingDates } = req.body;

//     if (!roomCategoryCounts || !bookingDates) {
//         return res.status(400).json({ error: "Missing required data" });
//     }

//     const { checkIn, checkOut } = bookingDates;

//     if (!checkIn || !checkOut) {
//         return res.status(400).json({ error: "Invalid booking dates" });
//     }

//     try {
//         // Fetch all RoomWithCategory based on requested roomCategoryCounts
//         const categoryIds = roomCategoryCounts.map((count) => count.roomType);
//         const roomCategories = await RoomWithCategory.find({ _id: { $in: categoryIds } });

//         // Fetch all RoomBooking records that overlap with the requested booking dates
//         const overlappingBookings = await RoomBooking.find({
//             "bookingDates.checkIn": { $lt: new Date(checkOut) },
//             "bookingDates.checkOut": { $gt: new Date(checkIn) },
//         });

//         // Create a map of booked room IDs during the requested booking dates
//         const bookedRoomIds = new Set();
//         overlappingBookings.forEach((booking) => {
//             booking.roomCategoryCounts.forEach((category) => {
//                 category.roomNumbers.forEach((roomId) => {
//                     bookedRoomIds.add(roomId.toString());
//                 });
//             });
//         });

//         // Prepare the response for available rooms
//         const availableRoomsResponse = [];

//         for (const requestedCategory of roomCategoryCounts) {
//             const roomCategory = roomCategories.find(
//                 (category) => category._id.toString() === requestedCategory.roomType
//             );

//             if (!roomCategory) {
//                 return res.status(404).json({
//                     error: `Room category not found for ID: ${requestedCategory.roomType}`,
//                 });
//             }

//             // Filter available rooms for the current category
//             const availableRooms = roomCategory.roomDetails.filter(
//                 (room) => !bookedRoomIds.has(room._id.toString()) && room.status === "Available"
//             );

//             // Check if enough rooms are available
//             if (availableRooms.length < requestedCategory.roomCount) {
//                 return res.status(400).json({
//                     error: `Not enough rooms available for category: ${roomCategory.categoryName}`,
//                     required: requestedCategory.roomCount,
//                     available: availableRooms.length,
//                 });
//             }

//             // Add available rooms for the current category to the response
//             availableRoomsResponse.push({
//                 roomType: roomCategory.categoryName,
//                 availableRooms: availableRooms.slice(0, requestedCategory.roomCount),
//             });
//         }

//         // Return the available rooms response
//         res.status(200).json({
//             message: "Available rooms fetched successfully",
//             availableRooms: availableRoomsResponse,
//         });
//     } catch (error) {
//         console.error("Error finding available rooms:", error);
//         res.status(500).json({ error: "An error occurred while finding available rooms" });
//     }
// }


const findRooms = async (req, res) => {
    const { bookingId } = req.params;

    if (!bookingId) {
        return res.status(400).json({ error: "Booking ID is required" });
    }

    try {
        // Fetch the RoomBooking details using the bookingId
        const booking = await RoomBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        const { roomCategoryCounts, bookingDates } = booking;

        if (!roomCategoryCounts || !bookingDates) {
            return res.status(400).json({ error: "Room category counts or booking dates are missing in the booking data" });
        }

        const { checkIn, checkOut } = bookingDates;

        if (!checkIn || !checkOut) {
            return res.status(400).json({ error: "Invalid booking dates" });
        }

        // Fetch all RoomWithCategory based on roomCategoryCounts
        const categoryIds = roomCategoryCounts.map((count) => count.roomType);
        const roomCategories = await RoomWithCategory.find({ _id: { $in: categoryIds } }).populate("categoryName");

        // Fetch all RoomBooking records that overlap with the booking's dates
        const overlappingBookings = await RoomBooking.find({
            "bookingDates.checkIn": { $lt: new Date(checkOut) },
            "bookingDates.checkOut": { $gt: new Date(checkIn) },
        });

        // Create a set of booked room IDs during the requested booking dates
        const bookedRoomIds = new Set();
        overlappingBookings.forEach((overlapBooking) => {
            overlapBooking.roomCategoryCounts.forEach((category) => {
                category.roomNumbers.forEach((roomId) => {
                    bookedRoomIds.add(roomId.toString());
                });
            });
        });

        // Prepare the response for available rooms
        const availableRoomsResponse = [];

        for (const requestedCategory of roomCategoryCounts) {
            const roomCategory = roomCategories.find(
                (category) => category._id.toString() === requestedCategory.roomType.toString()
            );

            if (!roomCategory) {
                return res.status(404).json({
                    error: `Room category not found for ID: ${requestedCategory.roomType}`,
                });
            }

            // Filter available rooms for the current category
            const availableRooms = roomCategory.roomDetails.filter(
                (room) => !bookedRoomIds.has(room._id.toString()) && room.status === "Available"
            );

            // Check if enough rooms are available
            if (availableRooms.length < requestedCategory.roomCount) {
                return res.status(400).json({
                    error: `Not enough rooms available for category: ${roomCategory.categoryName}`,
                    required: requestedCategory.roomCount,
                    available: availableRooms.length,
                });
            }

            // Add available rooms for the current category to the response
            availableRoomsResponse.push({
                roomTypeName: roomCategory.categoryName.name,
                roomType: roomCategory._id,
                availableRooms: availableRooms.slice(0, requestedCategory.roomCount).map((room) => ({
                    roomId: room._id,
                    roomNumber: room.roomNumber,
                })),
            });
        }

        // Return the available rooms response
        res.status(200).json({
            message: "Available rooms fetched successfully",
            availableRooms: availableRoomsResponse,
        });
    } catch (error) {
        console.error("Error finding available rooms:", error);
        res.status(500).json({ error: "An error occurred while finding available rooms" });
    }
};



module.exports = {
    addRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    deleteRoomImage,
    uploadRoomImage,
    getAllAvailableRooms,
    // ALL BOOKINGS FUNCTIONS
    createRoomBooking,
    getAllBookings,
    getBookingById,
    getMyBookings,
    deleteBooking,
    updateRoomAllocation,
    createRoomBookingDetails,
    findRooms
}

