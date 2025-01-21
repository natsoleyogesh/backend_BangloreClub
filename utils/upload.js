// src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = file.fieldname === "proofs" ? "uploads/proofs/" : "uploads/profilePictures/";
        cb(null, folder); // Save files in the appropriate directory
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
        cb(null, uniqueName);
    },
});

// Multer upload instance
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log(file, "fileTYpe------")
        // Accept only jpg, jpeg, png files
        const allowedTypes = /jpeg|jpg|png/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(file.originalname.toLowerCase());

        if (mimeType && extName) {
            return cb(null, true); // Accept the file if it matches the criteria
        }

        cb(new Error("Only jpg, jpeg, and png files are allowed"), false); // Reject other file types
    },
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
});


// Error handling for file size
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "Each file must be less than 100 KB in size.",
            });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        // Handle general errors
        return res.status(400).json({ message: err.message });
    }
    next();
};

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
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
});

// module.exports = upload;

// Ensure the uploads/rooms directory exists
const uploadDir = 'uploads/rooms/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


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
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
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
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
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
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
});


// Set up storage configuration for Multer
const gcmstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/gcm'); // Directory for uploaded images
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});


// Multer upload instance
const gcmupload = multer({
    storage: gcmstorage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
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
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
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
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
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
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
});


// Configure multer for file upload with file size limit
const ICONstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set destination folder to store files
        cb(null, 'uploads/icons'); // Make sure the 'uploads/icons' folder exists
    },
    filename: (req, file, cb) => {
        // Use the original filename
        cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to prevent name conflicts
    }
});

const ICONupload = multer({
    storage: ICONstorage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
    fileFilter: (req, file, cb) => {
        // Allow only SVG files
        if (file.mimetype === 'image/svg+xml') {
            cb(null, true);
        } else {
            cb(new Error('Only SVG files are allowed'), false);
        }
    }
}).single('icon'); // Field name should match the form input field name



// Ensure the uploads/rooms directory exists
const banquetUploadDir = 'uploads/banquets/';
if (!fs.existsSync(banquetUploadDir)) {
    fs.mkdirSync(banquetUploadDir, { recursive: true });
}

// Storage configuration
const banquetStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, banquetUploadDir); // Save files to 'uploads/benquets/' directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 100000);
        const uniqueName = `banquetImage-${timestamp}-${randomNum}${ext}`;
        cb(null, uniqueName);
    },
});

// Multer configuration with file filter and size limit
const banquetUpload = multer({
    storage: banquetStorage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB

});



// Ensure the uploads/rooms directory exists
const notificationUploadDir = 'uploads/notification/';
if (!fs.existsSync(notificationUploadDir)) {
    fs.mkdirSync(notificationUploadDir, { recursive: true });
}

// Storage configuration
const notificationStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, notificationUploadDir); // Save files to 'uploads/benquets/' directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 100000);
        const uniqueName = `notification-${timestamp}-${randomNum}${ext}`;
        cb(null, uniqueName);
    },
});

// Multer configuration with file filter and size limit
const notificationUpload = multer({
    storage: notificationStorage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB

});


// Multer configuration for Excel file uploads
const xslStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/xlsx'); // Corrected directory name
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Set unique file name
    },
});

const xslUpload = multer({
    storage: xslStorage,
    fileFilter: (req, file, cb) => {
        // Allow only Excel file types
        if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed!'), false);
        }
    },
});


module.exports = { upload, eventupload, roomUpload, offerupload, hodupload, downloadUpload, noticeUpload, FBupload, ICONupload, banquetUpload, notificationUpload, handleMulterError, xslUpload, gcmupload };
