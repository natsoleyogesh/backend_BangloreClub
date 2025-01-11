const { addAffiliatedClub, getAllAffiliatedClubs, getAffiliatedClubById, deleteAffiliatedClub, updateAffiliatedClub } = require("../controllers/affiliatedClubController");
const { xslUpload } = require("../utils/upload");

module.exports = (router) => {
    router.post("/upload-affiliated-clubs", xslUpload.single('file'), addAffiliatedClub);
    router.get("/all-affiliated-clubs", getAllAffiliatedClubs);
    router.get("/affiliated-club/:id", getAffiliatedClubById);
    router.delete("/affiliated-club/:id", deleteAffiliatedClub);
    router.put("/update-affiliated-club/:id", updateAffiliatedClub);
};
