const multer = require("multer");

// Store file in memory (not disk)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        console.log("File received:", file.fieldname, file.originalname, file.mimetype);
        
        // Only allow images
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"), false);
        }
    }
});

module.exports = upload;