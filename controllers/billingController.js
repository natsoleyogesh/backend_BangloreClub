const mongoose = require('mongoose');
const Billing = require('../models/billings'); // Assuming the Billing model is in the models folder
const moment = require('moment');
const RoomBooking = require('../models/roomBooking');
const BanquetBooking = require('../models/banquetBooking');
const EventBooking = require('../models/eventBooking');
const User = require('../models/user');

const xlsx = require('xlsx');
const fs = require('fs');
const ConsolidatedBilling = require('../models/offlineBill');

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


// // Get all billing records
// const getAllBillings = async (req, res) => {
//     try {

//         const { filterType, customStartDate, customEndDate, paymentStatus, userId } = req.query; // Extract filter type and custom date range from query

//         let filter = { isDeleted: false };

//         // Add paymentStatus to filter if provided
//         if (paymentStatus) {
//             filter.paymentStatus = paymentStatus;
//         }
//         if (userId) {
//             filter.memberId = userId
//         }

//         // Handle date filters
//         if (filterType) {
//             const today = moment().startOf('day');

//             switch (filterType) {
//                 case 'today':
//                     filter.createdAt = { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() };
//                     break;
//                 case 'last7days':
//                     filter.createdAt = { $gte: moment(today).subtract(7, 'days').toDate(), $lt: today.toDate() };
//                     break;
//                 case 'last30days':
//                     filter.createdAt = { $gte: moment(today).subtract(30, 'days').toDate(), $lt: today.toDate() };
//                     break;
//                 case 'last3months':
//                     filter.createdAt = { $gte: moment(today).subtract(3, 'months').toDate(), $lt: today.toDate() };
//                     break;
//                 case 'last6months':
//                     filter.createdAt = { $gte: moment(today).subtract(6, 'months').toDate(), $lt: today.toDate() };
//                     break;
//                 case 'last1year':
//                     filter.createdAt = { $gte: moment(today).subtract(1, 'year').toDate(), $lt: today.toDate() };
//                     break;
//                 case 'custom':
//                     if (!customStartDate || !customEndDate) {
//                         return res.status(400).json({ message: 'Custom date range requires both start and end dates.' });
//                     }
//                     filter.createdAt = {
//                         // $gte: moment(customStartDate, 'YYYY-MM-DD').startOf('day').toDate(),
//                         // $lt: moment(customEndDate, 'YYYY-MM-DD').endOf('day').toDate()
//                         $lt: moment(customStartDate, 'YYYY-MM-DD').endOf('day').toDate(),
//                         $gte: moment(customEndDate, 'YYYY-MM-DD').startOf('day').toDate()
//                     };
//                     break;
//                 default:
//                     break; // No filter applied if no valid filterType
//             }
//         }

//         // Query to find bills based on the filter
//         // const billings = await Billing.find({ isDeleted: false, deletedAt: null })
//         const billings = await Billing.find(filter)
//             .populate('memberId')
//             .populate('serviceDetails')
//             .sort({ createdAt: -1 }); // Sort by creation date
//         return res.status(200).json({
//             message: 'Billings fetched successfully.',
//             billings
//         });
//     } catch (error) {
//         console.error('Error fetching billings:', error);
//         return res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };

const getAllBillings = async (req, res) => {
    try {
        const { filterType, customStartDate, customEndDate, paymentStatus, userId } = req.query;

        let filter = { isDeleted: false };

        // Add paymentStatus to filter if provided
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }
        if (userId) {
            filter.memberId = userId;
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

        // Query to find bills based on the filter
        const billings = await Billing.find(filter)
            .populate('memberId')
            .populate('serviceDetails.roomBooking')
            .populate('serviceDetails.banquetBooking')
            .populate('serviceDetails.eventBooking')
            .sort({ createdAt: -1 }); // Sort by creation date

        // Calculate totals
        const totalOutstanding = billings.reduce((sum, billing) => sum + (billing.totalAmount || 0), 0);
        const totalPaid = billings.reduce(
            (sum, billing) => sum + (billing.paymentStatus === 'Paid' ? billing.totalAmount : 0),
            0
        );
        const totalOfflinePaid = billings.reduce(
            (sum, billing) => sum + (billing.paymentStatus === 'Paid Offline' ? billing.totalAmount : 0),
            0
        );
        const totalDue = billings.reduce(
            (sum, billing) => sum + (billing.paymentStatus === 'Due' ? billing.totalAmount : 0),
            0
        );

        // Return the response with totals
        return res.status(200).json({
            message: 'Billings fetched successfully.',
            totals: {
                totalOutstanding, // Total of all records
                totalPaid,        // Total of Paid records
                totalOfflinePaid, // Total of Offline Paid records
                totalDue          // Total of Due records
            },
            billings,
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
            throw new Error('Billing record not found.');
        }

        return billing;
    } catch (error) {
        console.error('Error adding billing record:', error);
        throw error; // Throw the error to be handled by the calling function
    }
}

const updateBilling = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            paymentStatus, status
        } = req.body;

        const billing = await updateBillingFunc(id, paymentStatus, status);

        // Check if paymentStatus is 'PaidOffline' and update the respective booking
        if (paymentStatus === 'Paid Offline') {
            const { serviceType, serviceDetails, memberId, totalAmount } = billing;

            if (serviceType === 'Room' && serviceDetails.roomBooking) {
                await RoomBooking.findByIdAndUpdate(serviceDetails.roomBooking, { paymentStatus: 'Completed' });
            } else if (serviceType === 'Banquet' && serviceDetails.banquetBooking) {
                await BanquetBooking.findByIdAndUpdate(serviceDetails.banquetBooking, { paymentStatus: 'Completed' });
            } else if (serviceType === 'Event' && serviceDetails.eventBooking) {
                await EventBooking.findByIdAndUpdate(serviceDetails.eventBooking, { paymentStatus: 'Completed' });
            }


            // let primaryMemberDetails = await User.findById(memberId);
            // // If the member is not primary, fetch the actual primary member
            // if (primaryMemberDetails.relation !== "Primary" && primaryMemberDetails.parentUserId !== null) {
            //     primaryMemberDetails = await User.findById(primaryMemberDetails.parentUserId);
            //     if (!primaryMemberDetails) {
            //         return res.status(404).json({ message: "Primary member not found for the provided member." });
            //     }
            // }

            // primaryMemberDetails.creditLimit = primaryMemberDetails.creditLimit + totalAmount;

            // await primaryMemberDetails.save();
        }

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
                    paymentStatus: "Due", // Only include bills with paymentStatus as "Due"
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


const getMemberBill = async (req, res) => {
    try {
        const { userId } = req.params; // Extract user ID and payment status from request parameters
        const { filterType, customStartDate, customEndDate, paymentStatus } = req.query; // Extract filter type and custom date range from query

        let filter = { memberId: userId, isDeleted: false };

        // Add paymentStatus to filter if provided
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
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
                        // $gte: moment(customStartDate, 'YYYY-MM-DD').startOf('day').toDate(),
                        // $lt: moment(customEndDate, 'YYYY-MM-DD').endOf('day').toDate()
                        $lt: moment(customStartDate, 'YYYY-MM-DD').endOf('day').toDate(),
                        $gte: moment(customEndDate, 'YYYY-MM-DD').startOf('day').toDate()
                    };
                    break;
                default:
                    break; // No filter applied if no valid filterType
            }
        }

        // Query to find bills based on the filter
        const bills = await Billing.find(filter).sort({ createdAt: -1 });

        // Aggregate pipeline to calculate total outstanding amount
        const totalOutstandingAmount = await Billing.aggregate([
            {
                $match: {
                    memberId: new mongoose.Types.ObjectId(userId), // Ensure memberId is treated as an ObjectId
                    isDeleted: false,
                    // ...(filter.paymentStatus ? { paymentStatus: filter.paymentStatus } : {}),
                    paymentStatus: "Due",
                    ...(filter.createdAt ? { createdAt: filter.createdAt } : {}) // Apply date filter in aggregation if applicable
                }
            },
            {
                $group: {
                    _id: 'null', // Group by payment status
                    totalOutstandingAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalAmount = totalOutstandingAmount[0] ? totalOutstandingAmount[0].totalOutstandingAmount : 0;


        // Prepare response object
        const response = {
            message: "Total Outstanding & Filtered Bills!",
            bills,
            totalOutstandingAmount: totalAmount
        };

        // Send response
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching bills:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// OFFLINE BILL UPLOAD 

// Helper function to generate invoice number
const generateOfflineInvoiceNumber = async () => {
    const lastInvoice = await ConsolidatedBilling.findOne().sort({ invoiceNumber: -1 }).limit(1);
    const lastInvoiceNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('/')[2]) : 0;
    const nextInvoiceNumber = lastInvoiceNumber + 1;
    const date = new Date();
    const invoicePrefix = `OFFINV/${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}/${String(nextInvoiceNumber).padStart(4, '0')}`;
    return invoicePrefix;
};
// Parse TRANSMONTH and ensure it's set to the first day of the month in UTC
const parseTransactionMonth = (transactionMonth) => {
    try {
        const [month, year] = transactionMonth.trim().split('-'); // Extract month and year
        const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getMonth(); // Get month index (0-based)
        return new Date(Date.UTC(year, monthIndex, 1)); // Set to the first day of the month in UTC
    } catch (error) {
        console.error('Error parsing TRANSMONTH:', error.message);
        return null;
    }
};

// API to upload consolidated bills
const uploadConsolidatedBill = async (req, res) => {
    try {
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        for (const row of data) {
            const memberAccNo = row['MEMBERACCNO'];
            const serviceType = row['LEDGER'];
            const debitAmount = parseFloat(row['DEBITAMOUNT']) || 0;
            const creditAmount = parseFloat(row['CREDITAMOUNT']) || 0;

            // Parse TRANSMONTH
            let transactionMonth = parseTransactionMonth(row['TRANSMONTH']);
            if (!transactionMonth) {
                console.warn(`Skipping row due to invalid TRANSMONTH: ${row['TRANSMONTH']}`);
                continue;
            }
            // Set the transactionMonth to UTC
            transactionMonth = new Date(Date.UTC(transactionMonth.getUTCFullYear(), transactionMonth.getUTCMonth(), transactionMonth.getUTCDate()));
            // Find the member
            const member = await User.findOne({ memberId: memberAccNo });
            if (!member) {
                console.warn(`Member with account number ${memberAccNo} not found.`);
                continue;
            }

            // Find or create a consolidated billing entry
            let billing = await ConsolidatedBilling.findOne({
                memberId: member._id,
                transactionMonth
            });

            if (!billing) {
                billing = new ConsolidatedBilling({
                    memberId: member._id,
                    memberShipId: memberAccNo,
                    transactionMonth,
                    serviceTypeEntries: []
                });
            }

            // Handle service type entries
            const serviceEntryIndex = billing.serviceTypeEntries.findIndex(entry => entry.serviceType === serviceType);
            if (serviceEntryIndex !== -1) {
                const existingEntry = billing.serviceTypeEntries[serviceEntryIndex];
                existingEntry.totalDebit += debitAmount;
                existingEntry.totalCredit += creditAmount;
                existingEntry.total = existingEntry.totalDebit - existingEntry.totalCredit;
            } else {
                billing.serviceTypeEntries.push({
                    serviceType,
                    totalDebit: debitAmount,
                    totalCredit: creditAmount,
                    total: debitAmount - creditAmount
                });
            }

            // Update overall total amount
            billing.totalAmount = billing.serviceTypeEntries.reduce(
                (sum, entry) => sum + entry.total,
                0
            );

            // Generate and set invoice number, invoice date, and due date
            billing.invoiceNumber = billing.invoiceNumber || await generateOfflineInvoiceNumber();
            // billing.invoiceDate = transactionMonth; // Set to the first day of the transaction month
            // const dueDate = new Date(transactionMonth);
            billing.invoiceDate = transactionMonth; // Explicitly set to the same as transactionMonth
            const dueDate = new Date(transactionMonth);
            dueDate.setMonth(dueDate.getMonth() + 3); // Add 3 months for due date
            billing.dueDate = dueDate;

            // Update payment status based on totalDebit
            billing.paymentStatus = billing.totalAmount === 0 ? 'Paid Offline' : 'Due';

            // Save the consolidated billing entry
            await billing.save();
        }

        // Delete the uploaded file
        fs.unlinkSync(filePath);

        return res.status(201).json({ message: 'File processed and consolidated data saved successfully.' });
    } catch (error) {
        console.error('Error processing file:', error);
        return res.status(500).json({ error: error.message });
    }
};

// API to get all consolidated billings with filters
const getAllBillingsWithFilters = async (req, res) => {
    try {
        const { userId, paymentStatus, transactionMonth } = req.query;

        // Initialize the filter object
        let filter = { isDeleted: false };

        // Add filters based on the query parameters
        if (userId) {
            filter.memberId = userId;
        }
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }
        if (transactionMonth) {
            // Parse the transactionMonth to ensure it matches the correct format
            const parsedTransactionMonth = parseTransactionMonth(transactionMonth);
            if (parsedTransactionMonth) {
                filter.transactionMonth = parsedTransactionMonth;
            } else {
                return res.status(400).json({ message: 'Invalid transactionMonth format.' });
            }
        }

        // Query the ConsolidatedBilling model with the applied filters
        const billings = await ConsolidatedBilling.find(filter)
            .populate('memberId') // Populate relevant member fields
            .sort({ transactionMonth: -1 }); // Sort by transactionMonth in descending order

        // // Check if any billings were found
        // if (billings.length === 0) {
        //     return res.status(404).json({ message: 'No billings found.' });
        // }

        // Calculate totals
        const totalOutstanding = billings.reduce((sum, billing) => sum + (billing.totalAmount || 0), 0);
        const totalPaid = billings.reduce(
            (sum, billing) => sum + (billing.paymentStatus === 'Paid' ? billing.totalAmount : 0),
            0
        );
        const totalOfflinePaid = billings.reduce(
            (sum, billing) => sum + (billing.paymentStatus === 'Paid Offline' ? billing.totalAmount : 0),
            0
        );
        const totalDue = billings.reduce(
            (sum, billing) => sum + (billing.paymentStatus === 'Due' ? billing.totalAmount : 0),
            0
        );


        // Return the response with filtered data
        return res.status(200).json({
            message: 'Billings fetched successfully.',
            totals: {
                totalOutstanding, // Total of all records
                totalPaid,        // Total of Paid records
                totalOfflinePaid, // Total of Offline Paid records
                totalDue          // Total of Due records
            },
            billings
        });
    } catch (error) {
        console.error('Error fetching billings:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// Get a billing record by ID
const getOfflineBillingById = async (req, res) => {
    try {
        const { id } = req.params;
        const billing = await ConsolidatedBilling.findById(id)
            .populate('memberId')
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
const deleteOfflineBilling = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the billing record by ID and update it to mark as deleted
        const billing = await ConsolidatedBilling.findByIdAndUpdate(
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


// // Get active billing records with paymentStatus 'Due', pagination, and total outstanding amount

const getOfflineActiveBill = async (req, res) => {
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
        const bills = await ConsolidatedBilling.find({ memberId: userId, paymentStatus: 'Due', isDeleted: false })
            .skip(skip) // Skip records for pagination
            .limit(pageLimit) // Limit number of records
            .sort({ createdAt: -1 }); // Optionally, sort by createdAt in descending order

        // Aggregate pipeline to calculate total outstanding amount
        const totalOutstandingAmount = await ConsolidatedBilling.aggregate([
            {
                $match: {
                    memberId: new mongoose.Types.ObjectId(userId),  // Ensure memberId is treated as an ObjectId
                    // paymentStatus: 'Due',
                    paymentStatus: "Due", // Only include bills with paymentStatus as "Due"
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
            message: "Total Outstanding & All Offline Bills!",
            bills,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(
                    await ConsolidatedBilling.countDocuments({ memberId: userId, paymentStatus: 'Due', isDeleted: false }) /
                    pageLimit
                ),
                totalRecords: await ConsolidatedBilling.countDocuments({ memberId: userId, paymentStatus: 'Due', isDeleted: false }),
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

const updateOfflineBillingFunc = async (id, paymentStatus, status) => {
    try {
        const billing = await ConsolidatedBilling.findByIdAndUpdate(
            id,
            {
                paymentStatus,
                status,
                updatedAt: Date.now()
            },
            { new: true } // Return the updated document
        );

        if (!billing) {
            throw new Error('Billing record not found.');
        }

        return billing;
    } catch (error) {
        console.error('Error adding billing record:', error);
        throw error; // Throw the error to be handled by the calling function
    }
}

const updateOfflineBilling = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            paymentStatus, status
        } = req.body;

        const billing = await updateOfflineBillingFunc(id, paymentStatus, status);

        // Check if paymentStatus is 'PaidOffline' and update the respective booking
        // if (paymentStatus === 'Paid Offline') {
        //     const { serviceType, serviceDetails, memberId, totalAmount } = billing;

        //     if (serviceType === 'Room' && serviceDetails.roomBooking) {
        //         await RoomBooking.findByIdAndUpdate(serviceDetails.roomBooking, { paymentStatus: 'Completed' });
        //     } else if (serviceType === 'Banquet' && serviceDetails.banquetBooking) {
        //         await BanquetBooking.findByIdAndUpdate(serviceDetails.banquetBooking, { paymentStatus: 'Completed' });
        //     } else if (serviceType === 'Event' && serviceDetails.eventBooking) {
        //         await EventBooking.findByIdAndUpdate(serviceDetails.eventBooking, { paymentStatus: 'Completed' });
        //     }


        // let primaryMemberDetails = await User.findById(memberId);
        // // If the member is not primary, fetch the actual primary member
        // if (primaryMemberDetails.relation !== "Primary" && primaryMemberDetails.parentUserId !== null) {
        //     primaryMemberDetails = await User.findById(primaryMemberDetails.parentUserId);
        //     if (!primaryMemberDetails) {
        //         return res.status(404).json({ message: "Primary member not found for the provided member." });
        //     }
        // }

        // primaryMemberDetails.creditLimit = primaryMemberDetails.creditLimit + totalAmount;

        // await primaryMemberDetails.save();
        // }

        return res.status(200).json({
            message: 'Billing record updated successfully.',
            billing
        });
    } catch (error) {
        console.error('Error updating billing record:', error);
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
    getMemberBill,

    //    OFFFLINE BILLING FUNCTIONS
    uploadConsolidatedBill,
    getAllBillingsWithFilters,
    getOfflineBillingById,
    deleteOfflineBilling,
    getOfflineActiveBill,
    updateOfflineBilling,
};
