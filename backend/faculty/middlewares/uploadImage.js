import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure directory exists synchronously before storing

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(
  __dirname,
  "../storage/facultyImages"
);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Disk Storage Engine Configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `faculty-${uniqueSuffix}${ext}`);
  },
});

/**
 * File Extension and MIME Type Filter
 */
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const isExtValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedMimeTypes.includes(file.mimetype.toLowerCase());

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPEG, JPG, PNG, and WEBP formats are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes limit
  },
  fileFilter: fileFilter,
});

export const uploadFacultyImage = (req, res, next) => {
  const singleUpload = upload.single('avatar');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image upload failed. File size cannot exceed 5MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Image Upload Error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'An error occurred while uploading the image.',
      });
    }
    next();
  });
};

export default uploadFacultyImage;