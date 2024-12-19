const mongoose = require('mongoose');
const Billing = require('../models/billings'); // Assuming the Billing model is in the models folder

// Helper function to generate invoice number
const generateInvoiceNumber = async () => {
    // Get the latest invoice by sorting based on invoiceNumber in descending order
    const lastInvoice = await Billing.findOne().sort({ invoiceNumber: -1 }).limit(1);
    const lastInvoiceNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('/')[2]) : 0; // Extract the last sequence number
    const nextInvoiceNumber = lastInvoiceNumber + 1;
    const date = new Date();

    // Generate the new invoice number based on current date and next sequence number
    const invoicePrefix = `INV/${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}/${String(nextInvoiceNumber).padStart(4, '0')}`;
    return invoicePrefix;
};

// Helper function to calculate the due date based on the billing cycle (1-3 months)
const calculateDueDate = (createdAt) => {
    const dueDate = new Date(createdAt);
    // Add a random number of months between 1 and 3
    const monthsToAdd = Math.floor(Math.random() * 3) + 1;
    dueDate.setMonth(dueDate.getMonth() + monthsToAdd);
    return dueDate;
};

// Function to add a new billing record
const addBilling = async (memberId, serviceType, serviceDetails, subTotal, discountAmount, taxAmount, totalAmount, createdBy) => {
    try {
        const invoiceNumber = await generateInvoiceNumber(); // Generate invoice number
        const createdAt = new Date(); // Get the current date as the creation date
        const dueDate = calculateDueDate(createdAt); // Calculate the due date based on billing cycle

        const billing = new Billing({
            memberId,
            invoiceNumber,
            invoiceDate: createdAt,
            dueDate,
            serviceType,
            serviceDetails,
            subTotal,
            discountAmount,
            taxAmount,
            totalAmount,
            paymentStatus: 'Due', // Default payment status
            createdBy,
            createdAt
        });

        // Save the billing record to the database
        await billing.save();
        return billing;
    } catch (error) {
        console.error('Error adding billing record:', error);
        throw new Error('Error while adding billing record');
    }
};

// Controller function to create a billing record via API
const createBilling = async (req, res) => {
    try {
        const {
            memberId,
            serviceType,
            serviceDetails,
            subTotal,
            discountAmount,
            taxAmount,
            totalAmount,
            createdBy
        } = req.body;

        // Add the billing record using the helper function
        const billing = await addBilling(memberId, serviceType, serviceDetails, subTotal, discountAmount, taxAmount, totalAmount, createdBy);

        return res.status(201).json({
            message: 'Billing record created successfully.',
            billing
        });
    } catch (error) {
        console.error('Error in creating billing record:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// Get all billing records
const getAllBillings = async (req, res) => {
    try {
        const billings = await Billing.find({ isDeleted: false, deletedAt: null })
            .populate('memberId')
            .populate('serviceDetails')
            .sort({ createdAt: -1 }); // Sort by creation date
        return res.status(200).json({
            message: 'Billings fetched successfully.',
            billings
        });
    } catch (error) {
        console.error('Error fetching billings:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get a billing record by ID
const getBillingById = async (req, res) => {
    try {
        const { id } = req.params;
        const billing = await Billing.findById(id)
            .populate('memberId')
            .populate('serviceDetails');
        if (!billing) {
            return res.status(404).json({ message: 'Billing record not found.' });
        }
        return res.status(200).json({
            message: 'Billing record fetched successfully.',
            billing
        });
    } catch (error) {
        console.error('Error fetching billing by ID:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// getBillingById

const getBillingByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const billing = await Billing.findById(id)
            .populate('memberId')
            .populate('serviceDetails')
            .populate({
                path: 'serviceDetails',
                populate: [
                    {
                        path: 'roomBooking',
                        model: 'RoomBooking', // Assuming roomBooking is referenced in billing
                        populate: [
                            {
                                path: 'roomCategoryCounts.roomType', // Populate roomType inside roomCategoryCounts
                                model: 'RoomWithCategory',
                                populate: [
                                    {
                                        path: 'categoryName', // Populate categoryName inside RoomWithCategory
                                        model: 'Category' // Category model
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        path: 'banquetBooking',
                        model: 'BanquetBooking', // Populate banquetBooking
                        populate: [
                            {
                                path: 'banquetType', // Populate roomType inside roomCategoryCounts
                                model: 'banquet',
                                populate: [
                                    {
                                        path: 'banquetName', // Populate categoryName inside RoomWithCategory
                                        model: 'BanquetCategory' // Category model
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        path: 'eventBooking',
                        model: 'eventBooking', // Populate eventBooking
                        populate: [
                            {
                                path: 'eventId', // Populate roomType inside roomCategoryCounts
                                model: 'Event',
                            }
                        ]
                    }
                ]
            });
        if (!billing) {
            return res.status(404).json({ message: 'Billing record not found.' });
        }
        return res.status(200).json({
            message: 'Billing record fetched successfully.',
            billing
        });
    } catch (error) {
        console.error('Error fetching billing by ID:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Soft delete a billing record
const deleteBilling = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the billing record by ID and update it to mark as deleted
        const billing = await Billing.findByIdAndUpdate(
            id,
            {
                deletedAt: new Date(), // Set deletedAt timestamp
                isDeleted: true // Optionally update the status to 'Cancelled'
            },
            { new: true } // Return the updated document
        );

        if (!billing) {
            return res.status(404).json({ message: 'Billing record not found.' });
        }

        return res.status(200).json({
            message: 'Billing record marked as deleted successfully.',
            billing
        });
    } catch (error) {
        console.error('Error soft deleting billing record:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// Update a billing record

const updateBillingFunc = async (id, paymentStatus, status) => {
    try {
        const billing = await Billing.findByIdAndUpdate(
            id,
            {
                paymentStatus,
                status,
                updatedAt: Date.now()
            },
            { new: true } // Return the updated document
        );

        if (!billing) {
            return res.status(404).json({ message: 'Billing record not found.' });
        }

        return billing;
    } catch (error) {
        console.error('Error adding billing record:', error);
        throw new Error('Error while adding billing record');
    }
}

const updateBilling = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            paymentStatus, status
        } = req.body;

        const billing = await updateBillingFunc(id, paymentStatus, status);

        return res.status(200).json({
            message: 'Billing record updated successfully.',
            billing
        });
    } catch (error) {
        console.error('Error updating billing record:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// // Get active billing records with paymentStatus 'Due', pagination, and total outstanding amount

const getActiveBill = async (req, res) => {
    try {
        const { userId } = req.user; // Extract user ID from the authenticated user

        // Destructure query parameters for pagination
        const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

        // Convert to numbers
        const pageNumber = parseInt(page);
        const pageLimit = parseInt(limit);

        // Validate page and limit
        if (isNaN(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ message: 'Invalid page number' });
        }
        if (isNaN(pageLimit) || pageLimit < 1) {
            return res.status(400).json({ message: 'Invalid limit value' });
        }

        // Calculate the skip value for pagination
        const skip = (pageNumber - 1) * pageLimit;

        // Query to find all active bills for the specific memberId with paymentStatus 'Due'
        const bills = await Billing.find({ memberId: userId, paymentStatus: 'Due', isDeleted: false })
            .skip(skip) // Skip records for pagination
            .limit(pageLimit) // Limit number of records
            .sort({ createdAt: -1 }); // Optionally, sort by createdAt in descending order

        // Aggregate pipeline to calculate total outstanding amount
        const totalOutstandingAmount = await Billing.aggregate([
            {
                $match: {
                    memberId: new mongoose.Types.ObjectId(userId),  // Ensure memberId is treated as an ObjectId
                    // paymentStatus: 'Due',
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalOutstandingAmount: { $sum: '$totalAmount' }
                }
            }
        ]);
        const totalAmount = totalOutstandingAmount[0] ? totalOutstandingAmount[0].totalOutstandingAmount : 0;

        // Prepare response object
        const response = {
            message: "Total Outstanding & All Bills!",
            bills,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(
                    await Billing.countDocuments({ memberId: userId, paymentStatus: 'Due', isDeleted: false }) /
                    pageLimit
                ),
                totalRecords: await Billing.countDocuments({ memberId: userId, paymentStatus: 'Due', isDeleted: false }),
                recordsPerPage: pageLimit
            },
            totalOutstandingAmount: totalAmount
        };

        // Send response
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching active bills:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



module.exports = {
    createBilling,
    addBilling,
    updateBilling,
    updateBillingFunc,
    getAllBillings,
    getBillingById,
    deleteBilling,
    getActiveBill,
    getBillingByIdAdmin,
};
