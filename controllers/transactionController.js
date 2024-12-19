const mongoose = require('mongoose');
const Transaction = require('../models/transaction'); // Import the Transaction model
const Billing = require('../models/billings'); // Assuming the Billing model is in the models folder

const moment = require('moment');
// Create a new transaction
const createTransaction = async (req, res) => {
    const {
        memberId,
        billingId,
        paymentMethod,
        taxAmount,
        other_service_charge,
        paymentAmount,
        transactionId,
        paymentStatus
    } = req.body;

    try {
        // Create a new transaction
        const transaction = new Transaction({
            memberId,
            billingId,
            paymentMethod: paymentMethod ? paymentMethod : '',
            taxAmount,
            other_service_charge,
            paymentAmount,
            transactionId,
            paymentStatus,
            status: 'Pending'  // Initial status
        });

        await transaction.save();

        // If paymentStatus is "Success", update the corresponding Billing record
        if (paymentStatus === 'Success') {
            await Billing.findByIdAndUpdate(
                billingId,
                { paymentStatus: 'Paid' },
                { new: true }
            );
        }

        return res.status(201).json({
            message: 'Transaction created successfully.',
            transaction
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const getAllTransactions = async (req, res) => {
    try {

        const transactions = await Transaction.find({ isDeleted: false })
            .populate('memberId')
            .populate('billingId')
            .sort({ createdAt: -1 }); // Sort by creation date, most recent first

        return res.status(200).json({
            message: 'Transactions fetched successfully.',
            transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const getTransactionById = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch the transaction with the populated fields
        const transaction = await Transaction.findById(id)
            .populate('memberId') // Populate memberId (User)
            .populate({
                path: 'billingId',
                populate: [
                    {
                        path: 'serviceDetails.roomBooking',
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
                        path: 'serviceDetails.banquetBooking',
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
                        path: 'serviceDetails.eventBooking',
                        model: 'eventBooking', // Populate eventBooking
                        populate: [
                            {
                                path: 'eventId', // Populate roomType inside roomCategoryCounts
                                model: 'Event',
                            }
                        ]
                    }
                ]
            })
            .where('isDeleted').equals(false) // Ensure the transaction is not deleted
            .setOptions({ strictPopulate: false }); // Allow population of paths that aren't explicitly defined in the schema


        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        return res.status(200).json({
            message: 'Transaction fetched successfully.',
            transaction
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};




const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        // Soft delete the transaction by setting `isDeleted` to true and adding `deletedAt`
        transaction.isDeleted = true;
        transaction.deletedAt = new Date();

        await transaction.save();

        return res.status(200).json({
            message: 'Transaction soft deleted successfully.',
            transaction
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const {
        paymentMethod,
        taxAmount,
        other_service_charge,
        paymentAmount,
        paymentStatus,
        status
    } = req.body;

    try {
        const transaction = await Transaction.findById(id).where('isDeleted').equals(false);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        // Update the transaction fields with the new values
        transaction.paymentMethod = paymentMethod || transaction.paymentMethod;
        transaction.taxAmount = taxAmount || transaction.taxAmount;
        transaction.other_service_charge = other_service_charge || transaction.other_service_charge;
        transaction.paymentAmount = paymentAmount || transaction.paymentAmount;
        transaction.paymentStatus = paymentStatus || transaction.paymentStatus;
        transaction.status = status || transaction.status;

        await transaction.save();

        return res.status(200).json({
            message: 'Transaction updated successfully.',
            transaction
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const getAllFilterTransactions = async (req, res) => {
    const { type, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Parse the page and limit parameters as integers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Default filter conditions
    let filter = {};
    const currentDate = moment();

    try {
        // Check if both startDate and endDate are provided
        if (startDate && endDate) {
            let start = moment(startDate, 'YYYY-MM-DD');
            let end = moment(endDate, 'YYYY-MM-DD');

            // Ensure that the startDate is not after the endDate
            if (start.isAfter(end)) {
                // Handle reverse date selection: Swap them or show error
                return res.status(400).json({ message: 'Start date cannot be after end date.' });
            }

            // Validate that the date range is not greater than 12 months
            const dateDiffInMonths = end.diff(start, 'months');
            if (dateDiffInMonths > 12) {
                return res.status(400).json({ message: 'Please select a time period of less than one year.' });
            }

            // Apply the date filter for the custom range
            filter.paymentDate = {
                $gte: start.startOf('day').toDate(),  // Start of the day for startDate
                $lt: end.endOf('day').toDate()        // End of the day for endDate
            };
        }

        // Determine the filter based on 'type' and optional date range
        switch (type) {
            case 'current':
                // Current month filter
                filter.paymentDate = {
                    $gte: moment().startOf('month').toDate(),
                    $lt: moment().endOf('month').toDate()
                };
                break;
            case 'history':
                // All transactions (no date filter)
                break;
            case 'lastMonth':
                // Last month filter
                filter.paymentDate = {
                    $gte: moment().subtract(1, 'month').startOf('month').toDate(),
                    $lt: moment().subtract(1, 'month').endOf('month').toDate()
                };
                break;
            case 'lastWeek':
                // Last week filter
                filter.paymentDate = {
                    $gte: moment().subtract(1, 'week').startOf('week').toDate(),
                    $lt: moment().subtract(1, 'week').endOf('week').toDate()
                };
                break;
            case 'last30Days':
                // Last 30 days filter
                filter.paymentDate = {
                    $gte: moment().subtract(30, 'days').toDate(),
                    $lt: moment().toDate()
                };
                break;
            case 'lastThreeMonths':
                // Last 3 months filter
                filter.paymentDate = {
                    $gte: moment().subtract(3, 'months').startOf('month').toDate(),
                    $lt: moment().toDate()
                };
                break;
            case 'lastSixMonths':
                // Last 6 months filter
                filter.paymentDate = {
                    $gte: moment().subtract(6, 'months').startOf('month').toDate(),
                    $lt: moment().toDate()
                };
                break;
            case 'custom':
                // Custom date range filter (already handled above)
                if (!(startDate && endDate)) {
                    return res.status(400).json({ message: 'Please provide both startDate and endDate for custom filter.' });
                }
                break;
            default:
                return res.status(400).json({ message: 'Invalid filter type provided.' });
        }

        // Get the total count of the filtered transactions
        const totalTransactions = await Transaction.countDocuments(filter);

        // Calculate the skip value for pagination
        const skip = (pageNumber - 1) * pageSize;

        // Fetch the transactions with pagination
        const transactions = await Transaction.find(filter)
            .skip(skip)  // Skip the first (pageNumber - 1) * pageSize documents
            .limit(pageSize)  // Limit to the page size
            .populate('billingId')  // Populate memberId (User)
            .where('isDeleted').equals(false);  // Ensure transactions are not deleted

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalTransactions / pageSize);

        // Return the transactions with pagination metadata
        return res.status(200).json({
            message: 'Transactions fetched successfully.',
            pagination: {
                currentPage: pageNumber,
                totalPages: totalPages,
                totalTransactions: totalTransactions,
                pageSize: pageSize
            },
            transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    deleteTransaction,
    updateTransaction,
    getAllFilterTransactions,
}
