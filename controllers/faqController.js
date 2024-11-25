const ClubFAQ = require("../models/faq");


const addFAQ = async (req, res) => {
    try {
        const { question, answer, category, status, isExpandable } = req.body;

        // Check for duplicate FAQ
        const existingFAQ = await ClubFAQ.findOne({ question });
        if (existingFAQ) {
            return res.status(400).json({
                message: "FAQ with this question already exists.",
            });
        }

        const newFAQ = new ClubFAQ({
            question,
            answer,
            category,
            status,
            isExpandable
        });

        const savedFAQ = await newFAQ.save();
        res.status(201).json({
            message: "FAQ added successfully.",
            faq: savedFAQ,
        });
    } catch (error) {
        console.error("Error adding FAQ:", error);
        res.status(500).json({
            message: "Failed to add FAQ.",
            error: error.message,
        });
    }
};

const updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, category, status, isExpandable } = req.body;

        // Check if the question already exists (excluding the current FAQ)
        if (question) {
            const existingFAQ = await ClubFAQ.findOne({ question, _id: { $ne: id } });
            if (existingFAQ) {
                return res.status(400).json({
                    message: "A FAQ with this question already exists.",
                });
            }
        }

        const updatedFAQ = await ClubFAQ.findByIdAndUpdate(
            id,
            { question, answer, category, status, isExpandable },
            { new: true } // Return the updated document
        );

        if (!updatedFAQ) {
            return res.status(404).json({ message: "FAQ not found." });
        }

        res.status(200).json({
            message: "FAQ updated successfully.",
            faq: updatedFAQ,
        });
    } catch (error) {
        console.error("Error updating FAQ:", error);
        res.status(500).json({
            message: "Failed to update FAQ.",
            error: error.message,
        });
    }
};


const getAllFAQs = async (req, res) => {
    try {
        const faqs = await ClubFAQ.find().sort({ createdAt: -1 }); // Fetch all FAQs sorted by creation date
        res.status(200).json({
            message: "FAQs fetched successfully.",
            faqs,
        });
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        res.status(500).json({
            message: "Failed to fetch FAQs.",
            error: error.message,
        });
    }
};


const getFAQById = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await ClubFAQ.findById(id);

        if (!faq) {
            return res.status(404).json({ message: "FAQ not found." });
        }

        res.status(200).json({
            message: "FAQ fetched successfully.",
            faq,
        });
    } catch (error) {
        console.error("Error fetching FAQ by ID:", error);
        res.status(500).json({
            message: "Failed to fetch FAQ.",
            error: error.message,
        });
    }
};

const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFAQ = await ClubFAQ.findByIdAndDelete(id);

        if (!deletedFAQ) {
            return res.status(404).json({ message: "FAQ not found." });
        }

        res.status(200).json({
            message: "FAQ deleted successfully.",
            faq: deletedFAQ,
        });
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        res.status(500).json({
            message: "Failed to delete FAQ.",
            error: error.message,
        });
    }
};


const getActiveFAQs = async (req, res) => {
    try {
        const activeFAQs = await ClubFAQ.find({ status: "Active" }).sort({ createdAt: -1 }); // Fetch only active FAQs
        res.status(200).json({
            message: "Active FAQs fetched successfully.",
            faqs: activeFAQs,
        });
    } catch (error) {
        console.error("Error fetching active FAQs:", error);
        res.status(500).json({
            message: "Failed to fetch active FAQs.",
            error: error.message,
        });
    }
};


module.exports = {
    addFAQ,
    updateFAQ,
    getAllFAQs,
    getFAQById,
    deleteFAQ,
    getActiveFAQs
}