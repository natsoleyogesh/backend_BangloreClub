const { addOffer, getAllOffers, getOfferById, updateOffer, deleteOffer, getActiveOffers, getEditOfferById } = require("../controllers/offerController");
const { verifyToken } = require("../utils/common");
const { offerupload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/offer/create", offerupload.single("bannerImage"), addOffer);
    router.get("/offers", getAllOffers);
    router.get("/offer/details/:id", getOfferById);
    router.get("/offer/edit-details/:id", getEditOfferById)

    router.put("/offer/update-offer/:id", offerupload.single("bannerImage"), updateOffer)
    router.delete("/offer/delete/:id", deleteOffer);
    router.get("/offer/active-offers", verifyToken, getActiveOffers);
}