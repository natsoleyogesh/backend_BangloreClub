const { addFAQ, getAllFAQs, getFAQById, updateFAQ, deleteFAQ, getActiveFAQs } = require("../controllers/faqController");
const { verifyToken } = require("../utils/common");


module.exports = (router) => {
    router.post("/faq/create", addFAQ);
    router.get("/faqs", getAllFAQs);
    router.get("/faq/details/:id", getFAQById)
    router.put("/faq/update-faq/:id", updateFAQ)
    router.delete("/faq/delete/:id", deleteFAQ);
    router.get("/faq/active-faqs", verifyToken, getActiveFAQs);
}