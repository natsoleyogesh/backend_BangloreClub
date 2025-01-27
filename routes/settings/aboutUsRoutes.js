const { addAbout, getAllAbout, getAboutById, updateAbout, deleteAbout } = require("../../controllers/settings/AboutUsController");
const { verifyToken } = require("../../utils/common");

module.exports = (router) => {
    router.post("/about", addAbout);
    router.get("/abouts", getAllAbout);
    router.get("/about/:id", getAboutById);
    router.put("/about/:id", updateAbout);
    router.delete("/about/:id", deleteAbout);
};
