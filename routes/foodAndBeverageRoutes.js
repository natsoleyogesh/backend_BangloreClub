const { addFoodAndBeverage, getAllFoodAndBeverages, getFoodAndBeverageById, updateFoodAndBeverage, deleteFoodAndBeverage, getActiveFoodAndBeverages, getEditFoodAndBeverageById, deleteFoodAndBeveragesImage, uploadFoodAndBeveragesImage } = require("../controllers/foodAndBeverageController");
const { verifyToken } = require("../utils/common");
const { FBupload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/foodAndBeverage/create", FBupload.any(), addFoodAndBeverage);
    router.get("/foodAndBeverages", getAllFoodAndBeverages);
    router.get("/foodAndBeverage/details/:id", getFoodAndBeverageById);
    router.get("/foodAndBeverage/edit/:id", getEditFoodAndBeverageById)
    router.put("/foodAndBeverage/update-foodAndBeverage/:id", FBupload.any(), updateFoodAndBeverage);
    router.delete("/foodAndBeverage/deleteimage/:id/:index", deleteFoodAndBeveragesImage);
    router.put("/foodAndBeverage/upload-images/:id", FBupload.any(), uploadFoodAndBeveragesImage);

    router.delete("/foodAndBeverage/delete/:id", deleteFoodAndBeverage);
    router.get("/foodAndBeverage/active-foodAndBeverages", verifyToken, getActiveFoodAndBeverages);
}