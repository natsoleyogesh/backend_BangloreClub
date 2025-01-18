const { addCategory, getAllCategory, getCategoryById, updateCategory, deleteCategory, getAllBanquets, createBanquet, getBanquetById, deleteBanquet, deleteBanquetImage, uploadBanquetImage, updateBanquet, getActiveBanquets, createBanquetBooking, createBanquetBookingDetails, getAllBanquetBookings, getBookingById, deleteBooking, getMyBookings, allocateBanquet, getBanquetEditDetailsById, getAllActiveBanquets, getSearchBanquets } = require("../controllers/banquetController");
const { verifyToken } = require("../utils/common");
const { banquetUpload } = require("../utils/upload");


module.exports = (router) => {
    // Benquet Category Routes
    router.post("/banquet-category", addCategory);
    router.get("/all-banquet-categories", getAllCategory);
    router.get("/banquet-category/:id", getCategoryById);
    router.put("/banquet-category/:id", updateCategory);
    router.delete("/banquet-category/:id", deleteCategory);


    // Bwnquet Creation Routes
    router.post("/banquet/create", banquetUpload.array('images', 5), createBanquet);
    router.get("/banquets", getAllBanquets);
    router.get("/banquet/:id", getBanquetById);
    router.put("/banquet/update-banquet/:id", updateBanquet);
    router.delete("/banquet/delete-banquet/:id", deleteBanquet);
    router.delete("/banquet/delete-image/:banquetId/:index", deleteBanquetImage);
    router.put("/banquet/upload-image/:banquetId", banquetUpload.array('images', 5), uploadBanquetImage);

    router.get("/banquet-editDetails/:id", getBanquetEditDetailsById);

    router.get("/banquet-categories", getAllActiveBanquets);

    router.get("/banquet-search", getSearchBanquets);




    // banquet Booking Routes

    router.get("/banquet-details/search", verifyToken, getActiveBanquets);
    router.post("/banquet-booking/create", createBanquetBooking);
    router.post("/banquet-booking/craete-details", createBanquetBookingDetails);
    router.get("/banquet-bookings", getAllBanquetBookings);
    router.get("/banquet-booking/:bookingId", getBookingById);
    router.delete("/banquet-booking/:bookingId", deleteBooking);
    router.get("/my-banquet-bookings", verifyToken, getMyBookings);

    router.post("/banquet-booking-allocate", verifyToken, allocateBanquet)
}