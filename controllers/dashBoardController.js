const Event = require("../models/event"); // Assuming Event model is in the models folder
const Offer = require("../models/offers"); // Assuming Offer model is in the models folder
const ClubNotice = require("../models/clubNotice"); // Assuming ClubNotice model is in the models folder
const Billing = require("../models/billings");


const allBannerImages = async (req, res) => {
    try {
        const currentDateTime = new Date(); // Get the current date and time

        // Fetch non-expired events with `showBanner: true`
        const events = await Event.find(
            {
                showBanner: true,
                eventEndDate: { $gte: currentDateTime }, // Check if eventEndDate is not expired
            },
            { eventImage: 1, showBanner: 1 }
        );

        // Fetch non-expired offers with `showBanner: true`
        const offers = await Offer.find(
            {
                showBanner: true,
                endDate: { $gte: currentDateTime }, // Check if endDate is not expired
            },
            { bannerImage: 1, showBanner: 1 }
        );

        // Fetch non-expired club notices with `showBanner: true`
        const clubNotices = await ClubNotice.find(
            {
                showBanner: true,
                expiredDate: { $gte: currentDateTime }, // Check if expiredDate is not expired
            },
            { bannerImage: 1, showBanner: 1 }
        );

        // Transform the data to include model name
        const eventBanners = events.map((event) => ({
            _id: event._id,
            image: event.eventImage,
            showBanner: event.showBanner,
            model: "Event",
        }));

        const offerBanners = offers.map((offer) => ({
            _id: offer._id,
            image: offer.bannerImage,
            showBanner: offer.showBanner,
            model: "Offer",
        }));

        const clubNoticeBanners = clubNotices.map((notice) => ({
            _id: notice._id,
            image: notice.bannerImage,
            showBanner: notice.showBanner,
            model: "ClubNotice",
        }));

        // Combine all banners into a single array
        const bannerImages = [...eventBanners, ...offerBanners, ...clubNoticeBanners];

        res.status(200).json({
            success: true,
            message: "Banner images fetched successfully.",
            data: bannerImages,
        });
    } catch (error) {
        console.error("Error fetching banner images:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message,
        });
    }
};

const totalSales = async (req, res) => {
    try {
        // Aggregate total sales grouped by serviceType
        const totalSales = await Billing.aggregate([
            {
                $match: {
                    isDeleted: false, // Exclude deleted records
                    status: { $in: ['Active', 'Paid'] } // Only include active/paid statuses
                }
            },
            {
                $group: {
                    _id: '$serviceType', // Group by serviceType
                    totalSales: { $sum: '$totalAmount' }, // Calculate total sales
                    count: { $sum: 1 } // Count number of invoices
                }
            }
        ]);

        // Format the response
        const formattedSales = {
            Room: 0,
            Banquet: 0,
            Event: 0
        };

        totalSales.forEach((service) => {
            formattedSales[service._id] = Math.round(service.totalSales);
        });

        res.status(200).json({
            success: true,
            message: 'Total sales retrieved successfully.',
            data: formattedSales
        });
    } catch (error) {
        console.error('Error fetching total sales:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve total sales.',
            error: error.message
        });
    }
}

module.exports = {
    allBannerImages,
    totalSales
}
