const { allBannerImages } = require("../controllers/dashBoardController");
const { verifyToken } = require("../utils/common");


module.exports = (router) => {
    router.get("/banner-images", allBannerImages);

}