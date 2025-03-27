"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define storage destination for uploaded files
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        // Create uploads directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedFileTypes = [
        // Document formats
        '.pdf', '.doc', '.docx', '.txt', '.rtf',
        // Image formats
        '.jpg', '.jpeg', '.png', '.gif',
        // Presentation formats
        '.ppt', '.pptx',
        // Spreadsheet formats
        '.xls', '.xlsx',
        // Archive formats
        '.zip',
    ];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error('File type not allowed. Supported formats: ' + allowedFileTypes.join(', ')));
    }
};
// Initialize multer upload
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
});
exports.default = upload;
