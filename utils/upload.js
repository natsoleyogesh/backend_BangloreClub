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

// Configure Multer storage
// Set up storage configuration for Multer
const hodstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/hods'); // Directory for uploaded images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});


// Multer upload instance
const hodupload = multer({
    storage: hodstorage,
    fileFilter,
    limits: { fileSize: 100 * 1024 }, // Limit file size to 100 KB
});


// Configure Multer storage
const downloadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/downloads'); // Directory where files will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename
    },
});

// File filter to allow only PDFs
const downloadFileFilter = (req, file, cb) => {
    const fileType = path.extname(file.originalname).toLowerCase();
    if (fileType === '.pdf') {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only PDF files are allowed'), false); // Reject the file
    }
};

// Initialize Multer
const downloadUpload = multer({
    storage: downloadStorage,
    fileFilter: downloadFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});


// Configure Multer storage
const noticeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/notices'); // Directory where files will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename
    },
});

// File filter to accept only specific file types
const noticeFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf|doc|docx|txt/; // Added PDF, Word (doc, docx), and .txt
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
        return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, .png, .webp, .pdf, .doc, .docx, and .txt files are allowed!'));
};

// Initialize Multer
const noticeUpload = multer({
    storage: noticeStorage,
    fileFilter: noticeFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});


// Create the upload directory if it doesn't exist
const uploadDirectory = "uploads/foodAndBeverage";
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}


// Define the storage engine
const FBstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory); // Save files to the defined directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename
    },
});

// File filter to allow only specific file types
const FBfileFilter = (req, file, cb) => {
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
        return cb(new Error("Only .png, .jpg, .jpeg, and .pdf files are allowed."));
    }

    cb(null, true); // Accept the file
};

// Initialize the multer upload
const FBupload = multer({
    storage: FBstorage,
    fileFilter: FBfileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});


module.exports = { upload, eventupload, roomUpload, offerupload, hodupload, downloadUpload, noticeUpload, FBupload };
