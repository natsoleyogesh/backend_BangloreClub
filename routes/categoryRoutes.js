const { addCategory, getAllCategory, getCategoryById, updateCategory, deleteCategory } = require("../controllers/categoryController");


module.exports = (router) => {
    router.post("/category/create", addCategory);
    router.get("/category/all-categories", getAllCategory);
    router.get("/category/:id", getCategoryById);
    router.put("/category/update-category/:id", updateCategory);
    router.delete("/category/delete-category/:id", deleteCategory);
}