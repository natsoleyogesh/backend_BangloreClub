const ContactUs = require('../../models/contactUs');

// Add a new contact
const addContact = async (req, res) => {
    try {
        // Destructure the request body
        const { organizationName, address, phoneNumbers, fax, email, createdBy, status } = req.body;

        // Check if the organization already exists
        const existingContact = await ContactUs.findOne({ organizationName });
        if (existingContact) {
            return res.status(400).json({ message: "Organization already exists" });
        }

        // Create a new contact
        const contact = new ContactUs({
            organizationName,
            address,
            phoneNumbers,
            fax,
            email,
            createdBy,
            status,
        });

        // Save the contact
        await contact.save();

        res.status(201).json({ message: "Contact added successfully", contact });
    } catch (error) {
        res.status(500).json({ message: "Error adding contact", error: error.message });
    }
};

// Get all contacts
const getAllContacts = async (req, res) => {
    try {
        const contacts = await ContactUs.find();
        res.status(200).json({ contacts });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving contacts", error: error.message });
    }
};

// Get a contact by ID
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch contact by ID
        const contact = await ContactUs.findById(id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json({ contact });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving contact", error: error.message });
    }
};

// Update a contact (only fields provided in req.body)
const updateContact = async (req, res) => {
    try {
        const { id } = req.params;

        // Destructure the request body
        const { organizationName, address, phoneNumbers, fax, email, status } = req.body;

        // Check if organization name is being updated and already exists
        if (organizationName) {
            const existingContact = await ContactUs.findOne({ organizationName });
            if (existingContact && existingContact._id.toString() !== id) {
                return res.status(400).json({ message: "Organization name already exists" });
            }
        }

        // Update only provided fields
        const updates = {
            ...(organizationName && { organizationName }),
            ...(address && { address }),
            ...(phoneNumbers && { phoneNumbers }),
            ...(fax && { fax }),
            ...(email && { email }),
            ...(status && { status }),

        };

        // Find and update contact
        const contact = await ContactUs.findByIdAndUpdate(id, updates, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation rules are applied
        });

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json({ message: "Contact updated successfully", contact });
    } catch (error) {
        res.status(500).json({ message: "Error updating contact", error: error.message });
    }
};

// Delete a contact
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete contact
        const contact = await ContactUs.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting contact", error: error.message });
    }
};

module.exports = {
    addContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact,
};
