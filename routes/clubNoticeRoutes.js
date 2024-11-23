const { addNotice, getAllNotices, clubNoticeDetails, updateClubNotice, deletedNotice, getActiveNotices } = require("../controllers/clubNoticeController");
const { verifyToken } = require("../utils/common");
const { noticeUpload } = require("../utils/upload");


module.exports = (router) => {
    router.post("/notice/create", noticeUpload.single("fileUrl"), addNotice);
    router.get("/notices", getAllNotices);
    router.get("/notice/details/:id", clubNoticeDetails)
    router.put("/notice/update-notice/:id", noticeUpload.single("fileUrl"), updateClubNotice)
    router.delete("/notice/delete/:id", deletedNotice);
    router.get("/notice/active-notices", verifyToken, getActiveNotices);
}