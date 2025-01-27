const { addContact, getAllContacts, getContactById, updateContact, deleteContact } = require("../../controllers/settings/contactUsController");
const { verifyToken } = require("../../utils/common");

module.exports = (router) => {
    router.post("/contact", verifyToken, addContact);
    router.get("/contacts", getAllContacts);
    router.get("/contact/:id", getContactById);
    router.put("/contact/:id", updateContact);
    router.delete("/contact/:id", deleteContact);

};
