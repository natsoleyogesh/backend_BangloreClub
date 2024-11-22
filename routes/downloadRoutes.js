const { addDownload, getAllDownloads, downloadDetails, updateDownload, deletedDownload, getActiveDownloads } = require("../controllers/downloadController");
const { verifyToken } = require("../utils/common");
const { downloadUpload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/download/create", downloadUpload.single("fileUrl"), addDownload);
    router.get("/downloads", getAllDownloads);
    router.get("/download/details/:id", downloadDetails)
    router.put("/download/update-download/:id", downloadUpload.single("fileUrl"), updateDownload)
    router.delete("/download/delete/:id", deletedDownload);
    router.get("/download/active-downloads", verifyToken, getActiveDownloads);
}