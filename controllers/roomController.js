const Room = require("../models/room");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs")

// // Helper function to parse pricing details
// const parsePricingDetails = (body) => {
//     const pricingDetails = [];
//     const guestTypes = body['pricingDetails[guestType]'];
//     const prices = body['pricingDetails[price]'];
//     const descriptions = body['pricingDetails[description]'];

//     if (Array.isArray(guestTypes)) {
//         // Multiple pricing details provided
//         guestTypes.forEach((guestType, index) => {
//             if (guestType && prices[index] !== undefined) {
//                 pricingDetails.push({
//                     guestType,
//                     price: parseFloat(prices[index]),
//                     description: descriptions[index] || '',
//                 });
//             }
//         });
//     } else if (guestTypes) {
//         // Single pricing detail provided
//         pricingDetails.push({
//             guestType: guestTypes,
//             price: parseFloat(prices),
//             description: descriptions || '',
//         });
//     }

//     return pricingDetails;
// };

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


module.exports = {
    addRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    deleteRoomImage,
    uploadRoomImage,
    getAllAvailableRooms
}