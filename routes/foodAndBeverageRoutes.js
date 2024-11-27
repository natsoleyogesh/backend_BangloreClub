const { addFoodAndBeverage, getAllFoodAndBeverages, getFoodAndBeverageById, updateFoodAndBeverage, deleteFoodAndBeverage, getActiveFoodAndBeverages } = require("../controllers/foodAndBeverageController");
const { verifyToken } = require("../utils/common");
const { FBupload } = require("../utils/upload");


module.exports = (router) => {
    // router.post("/foodAndBeverage/create", FBupload.fields([{ name: "bannerImage", maxCount: 1 }, { name: "subCategoryImages_*" }, { name: "menuFile_*" },]), addFoodAndBeverage);
    router.post("/foodAndBeverage/create", FBupload.any(), addFoodAndBeverage);
    router.get("/foodAndBeverages", getAllFoodAndBeverages);
    router.get("/foodAndBeverage/details/:id", getFoodAndBeverageById)
    // router.put("/foodAndBeverage/update-foodAndBeverage/:id", FBupload.fields([{ name: "bannerImage", maxCount: 1 }, { name: "subCategoryImages_*" }, { name: "menuFile_*" },]), updateFoodAndBeverage);
    router.put("/foodAndBeverage/update-foodAndBeverage/:id", FBupload.any(), updateFoodAndBeverage);
    router.delete("/foodAndBeverage/delete/:id", deleteFoodAndBeverage);
    router.get("/foodAndBeverage/active-foodAndBeverages", verifyToken, getActiveFoodAndBeverages);
}