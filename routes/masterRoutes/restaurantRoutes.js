const {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getActiveRestaurants
} = require("../../controllers/masterController/restaurantController");

module.exports = (router) => {
    router.post("/restaurant", createRestaurant);
    router.get("/restaurants", getAllRestaurants);
    router.get("/restaurant/:id", getRestaurantById);
    router.put("/restaurant/:id", updateRestaurant);
    router.delete("/restaurant/:id", deleteRestaurant);
    router.get("/active-restaurants", getActiveRestaurants)
};
