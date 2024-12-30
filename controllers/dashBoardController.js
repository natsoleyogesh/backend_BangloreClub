const Event = require("../models/event"); // Assuming Event model is in the models folder
const Offer = require("../models/offers"); // Assuming Offer model is in the models folder
const ClubNotice = require("../models/clubNotice"); // Assuming ClubNotice model is in the models folder


const allBannerImages = async (req, res) => {
    try {
        // Fetch records with `showBanner: true` from each model
        const events = await Event.find({ showBanner: true }, { eventImage: 1, showBanner: 1 });
        const offers = await Offer.find({ showBanner: true }, { bannerImage: 1, showBanner: 1 });
        const clubNotices = await ClubNotice.find({ showBanner: true }, { fileUrl: 1, showBanner: 1 });

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
}

module.exports = {
    allBannerImages
}
