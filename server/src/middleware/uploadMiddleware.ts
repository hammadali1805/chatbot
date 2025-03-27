import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define storage destination for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only certain file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Supported formats: ' + allowedFileTypes.join(', ')));
  }
};

// Initialize multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

export default upload; 