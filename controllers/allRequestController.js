
// controllers/requestController.js

const AllRequest = require('../models/allRequest');
const moment = require("moment"); // Install via npm: `npm install moment`

/**
 * Create a new request.
 */
const createRequest = async (req, { primaryMemberId, departmentId, department, status, description }) => {
    try {
        if (!['All'].includes(department) && !departmentId) {
            throw new Error('Department ID is required for the specified department.');
        }

        const request = new AllRequest({
            primaryMemberId,
            departmentId,
            department,
            status,
            description,
        });

        await request.save();
        // Emit the event to connected clients
        const io = req.app.get("io"); // Retrieve `io` instance from the Express app
        io.emit("new-request", request);
        return {
            message: 'Request saved successfully.',
            request,
        };
    } catch (error) {
        console.error('Error in createRequest:', error.message);
        throw error;
    }
};

const saveRequest = async (req, res) => {
    try {
        const { primaryMemberId, status, description, department, departmentId } = req.body;

        if (!primaryMemberId || !departmentId) {
            return res.status(400).json({
                message: 'Both "primaryMemberId" and "departmentId" are required.',
            });
        }

        // Call the createNotification function
        const response = await createRequest({
            primaryMemberId,
            departmentId,
            department,
            status, // Include if department-specific notifications require a reference
            description
        });

        // Respond to the client with the result
        return res.status(201).json(response);
    } catch (error) {
        console.error('Error in saveRequest:', error.message);
        return res.status(500).json({
            message: 'Failed to save request.',
            error: error.message,
        });
    }
};


/**
 * Get all requests with optional filters.
 */
const getAllRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let { page, limit } = req.query;

        // Convert query parameters to numbers, set defaults if not provided
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10; // Default limit: 10 users per page

        // Calculate the number of users to skip
        const skip = (page - 1) * limit;

        const filter = {
            isDeleted: false
        }
        if (status) {
            filter.status = status;
        }

        // Fetch total number of users
        const totalRequest = await AllRequest.countDocuments(filter);


        const requests = await AllRequest.find(filter)
            .populate('primaryMemberId', 'name email memberId')
            .populate('departmentId')
            .sort({ createdAt: -1 }) // Sort by creation date
            .skip(skip)
            .limit(limit)
            .exec();

        // Calculate total pages
        const totalPages = Math.ceil(totalRequest / limit);

        // return requests;
        return res.status(200).json({
            message: "All Requests",
            requests,
            pagination: {
                currentPage: page,
                totalPages,
                totalRequest,
                pageSize: limit,
            }
        });
    } catch (error) {
        console.error('Error in saveRequest:', error);
        return res.status(500).json({
            message: 'Failed to save request.',
            error: error.message,
        });
    }
};

/**
 * Update only the status and adminResponse of a request by ID.
 */
const updateRequest = async (requestId, { status, adminResponse }) => {
    try {
        const updateData = {};
        if (status) updateData.status = status;
        if (adminResponse) updateData.adminResponse = adminResponse;

        const request = await AllRequest.findByIdAndUpdate(requestId, updateData, {
            new: true,
            runValidators: true,
        });
        if (!request) {
            throw new Error('Request not found.');
        }
        return request;
    } catch (error) {
        console.error('Error in updateRequest:', error.message);
        throw error;
    }
};


/**
 * Delete a request (soft delete).
 */
const deleteRequest = async (req, res) => {
    try {
        const { requestId } = req.params
        const request = await AllRequest.findByIdAndUpdate(requestId, { isDeleted: true }, { new: true });
        if (!request) {
            return res.status(400).json({
                message: 'Request Not Found!',

            });
        }
        return res.status(200).json({
            message: "Request Delete Successfully",
            // request
        });
    } catch (error) {
        console.error('Error in saveRequest:', error);
        return res.status(500).json({
            message: 'Failed to save request.',
            error: error.message,
        });
    }
};

/**
 * Get request by ID.
 */
const getRequestById = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await AllRequest.findOne({ _id: requestId, isDeleted: false })
            .populate('primaryMemberId')
            .populate('departmentId')
            .exec();
        if (!request) {

            return res.status(400).json({
                message: 'Request Not Found!',
            });
        }
        return res.status(200).json({
            message: "Request Details Fetch Successfully",
            request
        });
    } catch (error) {
        console.error('Error in saveRequest:', error);
        return res.status(500).json({
            message: 'Failed to save request.',
            error: error.message,
        });
    }
};

const getAllUserRequest = async (req, res) => {
    try {
        // Validate user ID
        const { userId } = req.user;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        // Fetch requests for the user with status 'Confirmed' or 'Cancelled'
        const allRequests = await AllRequest.find({
            primaryMemberId: userId,
            status: { $in: ["Confirmed", "Cancelled"] },
            isDeleted: false,
        })
            .sort({ updatedAt: -1 }) // Sort by updatedAt descending
            .populate("departmentId") // Populate department details if needed
            .populate('primaryMemberId', 'name email profilePicture memberId')
            .lean();

        // Transform the response
        const transformedRequests = allRequests.map((request) => {
            let message = "";
            if (request.status === "Confirmed") {
                message = `APPROVED - Your ${request.department} request is approved. Please make the payment immediately.`;
            } else if (request.status === "Cancelled") {
                message = `REJECTED - Your ${request.department} request is rejected.`;
            }

            // Calculate timeAgo using moment
            const timeAgo = moment(request.updatedAt).fromNow();

            return {
                id: request._id,
                primaryMemberId: request.primaryMemberId,
                department: request.department,
                description: request.description,
                status: request.status,
                adminResponse: request.adminResponse,
                message: message || null,
                timeAgo: timeAgo,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
            };
        });

        // Send response
        res.status(200).json({
            success: true,
            message: "Requests fetched successfully.",
            data: transformedRequests,
        });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
}

module.exports = {
    createRequest,
    saveRequest,
    getAllRequests,
    updateRequest,
    deleteRequest,
    getRequestById,
    getAllUserRequest
}
