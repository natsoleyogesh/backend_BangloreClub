const {
    createAmenity,
    getAllAmenities,
    getAmenityById,
    updateAmenity,
    deleteAmenity,
    getActiveAmenities
} = require("../../controllers/masterController/amenitiesController");

module.exports = (router) => {
    router.post("/amenitie", createAmenity);
    router.get("/amenities", getAllAmenities);
    router.get("/amenitie/:id", getAmenityById);
    router.put("/amenitie/:id", updateAmenity);
    router.delete("/amenitie/:id", deleteAmenity);
    router.get("/active-amenities", getActiveAmenities)
};
