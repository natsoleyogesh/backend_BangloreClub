const { addRoomWithCategory,
    getAllRoomWithCategories,
    getRoomWithCategoryById,
    deleteRoomWithCategory,
    updateRoomWithCategory,
    getActiveRoomsWithCategory,
    deleteRoomWithCaegoryImage,
    uploadRoomWithCaegoryImage } = require("../controllers/roomWithCategoryController");
const { verifyToken } = require("../utils/common");
const { roomUpload } = require("../utils/upload");

module.exports = (router) => {
    router.post("/roomwithcategory/create", roomUpload.array('images', 5), addRoomWithCategory);
    router.get("/roomwithcategorys", getAllRoomWithCategories);
    router.get("/roomwithcategory/:id", getRoomWithCategoryById);
    router.put("/roomwithcategory/update-roomwithcategory/:id", updateRoomWithCategory);
    router.delete("/roomwithcategory/delete-roomwithcategory/:id", deleteRoomWithCategory);
    router.delete("/roomwithcategory/delete-image/:categoryId/:index", deleteRoomWithCaegoryImage);
    router.put("/roomwithcategory/upload-image/:categoryId", roomUpload.array('images', 5), uploadRoomWithCaegoryImage);
    router.get("/roomwithcategorys/search", verifyToken, getActiveRoomsWithCategory);
}