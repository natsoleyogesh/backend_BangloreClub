
// controllers/requestController.js

const AllRequest = require('../models/allRequest');

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
        const filter = {
            isDeleted: false
        }
        if (status) {
            filter.status = status;
        }
        const requests = await AllRequest.find(filter)
            .populate('primaryMemberId', 'name email')
            .populate('departmentId')
            .sort({ createdAt: -1 }) // Sort by creation date
            .exec();
        // return requests;
        return res.status(200).json({
            message: "All Requests",
            requests
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

module.exports = {
    createRequest,
    saveRequest,
    getAllRequests,
    updateRequest,
    deleteRequest,
    getRequestById,
}
