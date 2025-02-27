// const HOD = require("../models/clubHods");


// const addHOD = async (req, res) => {
//     try {
//         const { name, designation, department, contactNumber, status } = req.body;

//         // Check if file was uploaded
//         const image = req.file ? `/uploads/hods/${req.file.filename}` : "";

//         // Create a new HOD entry
//         const newHOD = new HOD({
//             name,
//             designation,
//             department,
//             contactNumber,
//             image,
//             status,
//         });

//         // Save the HOD to the database
//         await newHOD.save();

//         return res.status(201).json({ message: "HOD added successfully", hod: newHOD });
//     } catch (error) {
//         console.error("Error adding HOD:", error);
//         return res.status(500).json({ message: "Error adding HOD", error: error.message });
//     }
// };

// const updateHOD = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, designation, department, contactNumber, status } = req.body;

//         // Check if file was uploaded
//         const image = req.file ? `/uploads/hods/${req.file.filename}` : "";

//         // Prepare the update object dynamically
//         const updates = {};
//         if (name) updates.name = name;
//         if (designation) updates.designation = designation;
//         if (department) updates.department = department;
//         if (contactNumber) updates.contactNumber = contactNumber;
//         if (status) updates.status = status;
//         if (image) updates.image = image; // Update profile image only if uploaded

//         // Find and update the HOD
//         const updatedHOD = await HOD.findByIdAndUpdate(id, updates, { new: true });

//         if (!updatedHOD) {
//             return res.status(404).json({ message: "HOD not found" });
//         }

//         return res.status(200).json({ message: "HOD updated successfully", hod: updatedHOD });
//     } catch (error) {
//         console.error("Error updating HOD:", error);
//         return res.status(500).json({ message: "Error updating HOD", error: error.message });
//     }
// };

// const getAllHODs = async (req, res) => {
//     try {
//         const data = await HOD.find();
//         const hods = await data.reverse()
//         return res.status(200).json({ message: "HODs fetched successfully", hods });
//     } catch (error) {
//         console.error("Error fetching HODs:", error);
//         return res.status(500).json({ message: "Error fetching HODs", error: error.message });
//     }
// };

// const getHODById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const hod = await HOD.findById(id);

//         if (!hod) {
//             return res.status(404).json({ message: "HOD not found" });
//         }

//         return res.status(200).json({ message: "HOD fetched successfully", hod });
//     } catch (error) {
//         console.error("Error fetching HOD by ID:", error);
//         return res.status(500).json({ message: "Error fetching HOD by ID", error: error.message });
//     }
// };


// const deleteHOD = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const deletedHOD = await HOD.findByIdAndDelete(id);

//         if (!deletedHOD) {
//             return res.status(404).json({ message: "HOD not found" });
//         }

//         return res.status(200).json({ message: "HOD deleted successfully" });
//     } catch (error) {
//         console.error("Error deleting HOD:", error);
//         return res.status(500).json({ message: "Error deleting HOD", error: error.message });
//     }
// };

// const getActiveHODs = async (req, res) => {
//     try {
//         // Find all HODs with status "Active"
//         const activeHODs = await HOD.find({ status: "Active" });

//         if (activeHODs.length === 0) {
//             return res.status(404).json({ message: "No active HODs found" });
//         }

//         return res.status(200).json({ message: "Active HODs fetched successfully", hods: activeHODs });
//     } catch (error) {
//         console.error("Error fetching active HODs:", error);
//         return res.status(500).json({ message: "Error fetching active HODs", error: error.message });
//     }
// };


// module.exports = {
//     addHOD,
//     updateHOD,
//     getAllHODs,
//     getHODById,
//     deleteHOD,
//     getActiveHODs
// }



const HOD = require("../models/clubHods");
const User = require("../models/user");
const Department = require("../models/department");
const { toTitleCase } = require("../utils/common");
const { default: mongoose } = require("mongoose");

const addHOD = async (req, res) => {
    try {
        const { name, designation, departmentId, contactNumber, email, status } = req.body;
        const normalizedName = toTitleCase(name);


        const existingEmail = await HOD.findOne({ email: email, isDeleted: false });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email Is already exists.' });
        }

        // Check if file was uploaded
        const image = req.file ? `/uploads/hods/${req.file.filename}` : "";

        const department = await Department.findById(departmentId);
        if (!department) return res.status(404).json({ message: "Department not found" });
        // Create a new HOD entry
        const newHOD = new HOD({
            name: name,
            designation,
            department: departmentId,
            contactNumber,
            email,
            image,
            status,
        });

        // Save the HOD to the database
        await newHOD.save();

        return res.status(201).json({ message: "HOD added successfully", hod: newHOD });
    } catch (error) {
        console.error("Error adding HOD:", error);
        return res.status(500).json({ message: "Error adding HOD", error: error.message });
    }
};



const getAllHODs = async (req, res) => {
    try {
        // Fetch HODs and populate user and department details
        const data = await HOD.find({ status: "Active" })
            .populate('department', 'departmentName'); // Populating department name

        // Map the data for the desired response format
        const hods = data.reverse().map(hod => ({
            _id: hod._id,
            departmentId: hod.department._id,
            designation: hod.designation,
            name: hod.name,
            contactNumber: hod.contactNumber,
            email: hod.email,
            image: hod.image,
            department: hod.department ? hod.department.departmentName : 'N/A', // Handle missing department
            status: hod.status,
            createdAt: hod.createdAt,
            updatedAt: hod.updatedAt,
        }));

        return res.status(200).json({ message: "HODs fetched successfully", hods });
    } catch (error) {
        console.error("Error fetching HODs:", error);
        return res.status(500).json({ message: "Error fetching HODs", error: error.message });
    }
};

// const getAllHODs = async (req, res) => {
//     try {
//         let { page, limit } = req.query;

//         // Convert pagination parameters
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;
//         const skip = (page - 1) * limit;

//         // Get total count of HODs
//         const totalHODs = await HOD.countDocuments();

//         // Fetch paginated HODs and populate department details
//         const data = await HOD.find()
//             .populate("department", "departmentName")
//             .sort({ createdAt: -1 }) // Sort by newest first
//             .skip(skip)
//             .limit(limit);

//         // Format HOD data
//         const hods = data.map(hod => ({
//             _id: hod._id,
//             departmentId: hod.department?._id || null,
//             designation: hod.designation,
//             name: hod.name,
//             contactNumber: hod.contactNumber,
//             email: hod.email,
//             image: hod.image,
//             department: hod.department?.departmentName || "N/A", // Handle missing department
//             status: hod.status,
//             createdAt: hod.createdAt,
//             updatedAt: hod.updatedAt,
//         }));

//         return res.status(200).json({
//             message: "HODs fetched successfully",
//             hods,
//             pagination: {
//                 currentPage: page,
//                 totalPages: Math.ceil(totalHODs / limit),
//                 totalHODs,
//                 pageSize: limit,
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching HODs:", error);
//         return res.status(500).json({
//             message: "Error fetching HODs",
//             error: error.message,
//         });
//     }
// };


const getAllHODsInAdmin = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Convert pagination parameters
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count of HODs
        const totalHODs = await HOD.countDocuments();

        // Fetch paginated HODs and populate department details
        const data = await HOD.find()
            .populate("department", "departmentName")
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        // Format HOD data
        const hods = data.map(hod => ({
            _id: hod._id,
            departmentId: hod.department?._id || null,
            designation: hod.designation,
            name: hod.name,
            contactNumber: hod.contactNumber,
            email: hod.email,
            image: hod.image,
            department: hod.department?.departmentName || "N/A", // Handle missing department
            status: hod.status,
            createdAt: hod.createdAt,
            updatedAt: hod.updatedAt,
        }));

        return res.status(200).json({
            message: "HODs fetched successfully",
            hods,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalHODs / limit),
                totalHODs,
                pageSize: limit,
            },
        });
    } catch (error) {
        console.error("Error fetching HODs:", error);
        return res.status(500).json({
            message: "Error fetching HODs",
            error: error.message,
        });
    }
};


const getActiveHODs = async (req, res) => {
    try {
        // Fetch HODs and populate user and department details
        const data = await HOD.find({ status: "Active" })
            .populate('department', 'departmentName'); // Populating department name

        // Map the data for the desired response format
        const hods = data.reverse().map(hod => ({
            _id: hod._id,
            departmentId: hod.department._id,
            designation: hod.designation,
            name: hod.name,
            contactNumber: hod.contactNumber,
            email: hod.email,
            image: hod.image,
            department: hod.department ? hod.department.departmentName : 'N/A', // Handle missing department
            status: hod.status,
            createdAt: hod.createdAt,
            updatedAt: hod.updatedAt,
        }));

        return res.status(200).json({ message: "HODs fetched successfully", hods });
    } catch (error) {
        console.error("Error fetching HODs:", error);
        return res.status(500).json({ message: "Error fetching HODs", error: error.message });
    }
};


const getHODById = async (req, res) => {
    const { id } = req.params;

    try {
        // Find HOD by ID and populate user and department details
        const hod = await HOD.findById(id)
            .populate('department', 'departmentName');

        if (!hod) return res.status(404).json({ message: "HOD not found" });

        return res.status(200).json({
            message: "HOD fetched successfully",
            hod: {
                _id: hod._id,
                departmentId: hod.department._id,
                designation: hod.designation,
                name: hod.name,
                contactNumber: hod.contactNumber,
                email: hod.email,
                image: hod.image,
                department: hod.department ? hod.department.departmentName : 'N/A',
                status: hod.status,
                createdAt: hod.createdAt,
                updatedAt: hod.updatedAt
            }
        });
    } catch (error) {
        console.error("Error fetching HOD:", error);
        return res.status(500).json({ message: "Error fetching HOD", error: error.message });
    }
};


// const updateHOD = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, designation, departmentId, contactNumber, email, status } = req.body;

//         const updates = {};

//         if (email) {

//             const existingEmail = await HOD.findOne({
//                 email,
//                 _id: { $ne: id }, // Exclude the current document by ID
//             });

//             if (existingEmail) {
//                 return res.status(400).json({ message: 'A Email Is already exists.' });
//             }

//             // Add normalized title to updates
//             updates.email = email;
//         }

//         // Check if file was uploaded
//         let image;
//         if (req.file) {
//             image = req.file ? `/uploads/hods/${req.file.filename}` : "";
//         }

//         // Validate if department exists
//         if (departmentId) {

//             const department = await Department.findById(departmentId);
//             if (!department) return res.status(404).json({ message: "Department not found" });
//         }

//         // Prepare the update object dynamically

//         if (name) updates.name = name;
//         if (designation) updates.designation = designation;
//         if (departmentId) updates.department = departmentId;
//         if (contactNumber) updates.contactNumber = contactNumber;
//         if (status) updates.status = status;
//         if (image) updates.image = image; // Update profile image only if uploaded

//         // Find and update the HOD
//         const updatedHOD = await HOD.findByIdAndUpdate(id, updates, { new: true });

//         if (!updatedHOD) {
//             return res.status(404).json({ message: "HOD not found" });
//         }

//         return res.status(200).json({ message: "HOD updated successfully", hod: updatedHOD });
//     } catch (error) {
//         console.error("Error updating HOD:", error);
//         return res.status(500).json({ message: "Error updating HOD", error: error.message });
//     }
// };

const updateHOD = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, designation, departmentId, contactNumber, email, status } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid HOD ID" });
        }

        let updates = {};
        
        // Check if HOD exists before updating
        const existingHOD = await HOD.findById(id);
        if (!existingHOD) {
            return res.status(404).json({ message: "HOD not found" });
        }

        // Email validation: Check if email is actually being updated
        if (email && email !== existingHOD.email) {
            const existingEmail = await HOD.findOne({ email, _id: { $ne: id } });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already exists." });
            }
            updates.email = email;
        }

        // File upload handling
        if (req.file) {
            updates.image = `/uploads/hods/${req.file.filename}`;
        }

        // Validate department existence if departmentId is changed
        if (departmentId && departmentId !== existingHOD.department) {
            const department = await Department.findById(departmentId);
            if (!department) return res.status(404).json({ message: "Department not found" });
            updates.department = departmentId;
        }

        // Dynamically update fields if they exist in the request
        if (name) updates.name = name;
        if (designation) updates.designation = designation;
        if (contactNumber) updates.contactNumber = contactNumber;
        if (status) updates.status = status;

        // Perform update
        const updatedHOD = await HOD.findByIdAndUpdate(id, updates, { new: true });

        return res.status(200).json({ message: "HOD updated successfully", hod: updatedHOD });
    } catch (error) {
        console.error("Error updating HOD:", error);
        return res.status(500).json({ message: "Error updating HOD", error: error.message });
    }
};


// Delete HOD
const deleteHOD = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedHOD = await HOD.findByIdAndDelete(id);

        if (!deletedHOD) {
            return res.status(404).json({ message: "HOD not found" });
        }

        return res.status(200).json({ message: "HOD deleted successfully" });
    } catch (error) {
        console.error("Error deleting HOD:", error);
        return res.status(500).json({ message: "Error deleting HOD", error: error.message });
    }
};

module.exports = {
    addHOD,
    updateHOD,
    getAllHODs,
    getHODById,
    deleteHOD,
    getActiveHODs,
    getAllHODsInAdmin
}