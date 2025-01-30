const RoomGuidelineOrCondition = require("../models/roomGuidline");

// Create or Update Room Guideline
const configureRoomGuideline = async (req, res) => {
    try {
        const { guidlineDescription, roomConditionDescription } = req.body;

        // const { role } = req.user;

        // if (role !== "admin") {
        //     return res.status(400).json({ message: "You Are Not Authenticate Admin" });
        // }

        // Validate input fields
        if (!guidlineDescription || !roomConditionDescription) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if a Room Guideline configuration already exists
        const existingConfig = await RoomGuidelineOrCondition.findOne();
        if (existingConfig) {
            // Update existing configuration
            existingConfig.guidlineDescription = guidlineDescription;
            existingConfig.roomConditionDescription = roomConditionDescription;

            await existingConfig.save();

            return res.status(200).json({ message: "Room Guideline updated successfully", roomGuideline: existingConfig });
        }

        // Create a new Room Guideline configuration
        const newConfig = new RoomGuidelineOrCondition({
            guidlineDescription,
            roomConditionDescription,
            createdBy: req.user.userId, // Assuming `req.user` contains the authenticated admin's details
        });

        await newConfig.save();
        return res.status(201).json({ message: "Room Guideline created successfully", roomGuideline: newConfig });
    } catch (error) {
        console.error("Error configuring room guideline:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


// Get Room Guideline by a specific field
const getRoomGuideline = async (req, res) => {
    try {
        // Get search parameters from the request
        const { guidlineDescription, roomConditionDescription } = req.query;

        // Build the query object dynamically based on the parameters provided
        let query = {};
        if (guidlineDescription) query.guidlineDescription = guidlineDescription;
        if (roomConditionDescription) query.roomConditionDescription = roomConditionDescription;

        // Find the first match using the query object
        const roomGuideline = await RoomGuidelineOrCondition.findOne(query);

        // If no guideline is found, return a 404 response
        if (!roomGuideline) {
            return res.status(404).json({ success: false, message: "Room Guideline not found" });
        }

        // Return the found room guideline
        res.status(200).json({
            success: true,
            data: roomGuideline,
        });
    } catch (error) {
        console.error("Error retrieving room guideline:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};



module.exports = {
    configureRoomGuideline,
    getRoomGuideline
}