const { allBannerImages, totalSales } = require("../controllers/dashBoardController");
const { verifyToken } = require("../utils/common");


module.exports = (router) => {
    router.get("/banner-images", allBannerImages);
    router.get("/dashboard/total-sales", totalSales)
}