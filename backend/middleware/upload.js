import multer from 'multer';

// Files are kept in memory temporarily (as a buffer), then written into
// MongoDB's GridFS inside the controller — no local disk, no third-party service.
const storage = multer.memoryStorage();

// 20 MB max file size — adjust if you expect larger files
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export default upload;