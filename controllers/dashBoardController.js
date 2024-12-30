const Event = require("../models/event"); // Assuming Event model is in the models folder
const Offer = require("../models/offers"); // Assuming Offer model is in the models folder
const ClubNotice = require("../models/clubNotice"); // Assuming ClubNotice model is in the models folder


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
            { fileUrl: 1, showBanner: 1 }
        );

        // Transform the data to include model name
        const eventBanners = events.map((event) => ({
            image: event.eventImage,
            showBanner: event.showBanner,
            model: "Event",
        }));

        const offerBanners = offers.map((offer) => ({
            image: offer.bannerImage,
            showBanner: offer.showBanner,
            model: "Offer",
        }));

        const clubNoticeBanners = clubNotices.map((notice) => ({
            image: notice.fileUrl,
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

module.exports = {
    allBannerImages
}
