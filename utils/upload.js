// src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/profilePictures/"); // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

// Multer upload instance
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Set up storage configuration for Multer
const eventstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/event'); // Directory for uploaded images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
        return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'));
};

const eventupload = multer({
    storage: eventstorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// module.exports = upload;

// Ensure the uploads/rooms directory exists
const uploadDir = 'uploads/rooms/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// // Storage configuration
// const roomstorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/rooms/"); // Directory where files will be saved
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = `${Date.now()}-${file.originalname}`;
//         cb(null, uniqueName);
//     },
// });

// // Multer configuration with file filter
// const roomupload = multer({
//     storage: roomstorage,
//     fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
//     },
// });


// Storage configuration
const roomStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files to 'uploads/rooms/' directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 100000);
        const uniqueName = `roomImage-${timestamp}-${randomNum}${ext}`;
        cb(null, uniqueName);
    },
});

// Multer configuration with file filter and size limit
const roomUpload = multer({
    storage: roomStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
});


// Configure Multer storage
// Set up storage configuration for Multer
const offerstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/offers'); // Directory for uploaded images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});


// Multer upload instance
const offerupload = multer({
    storage: offerstorage,
    fileFilter,
    limits: { fileSize: 100 * 1024 }, // Limit file size to 100 KB
});

module.exports = { upload, eventupload, roomUpload, offerupload };
