import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

/**
 * Returns a GridFSBucket instance using the SAME MongoDB connection
 * already configured via MONGO_URI in database.js — no new service,
 * no extra account, no separate credentials.
 */
export const getBucket = () => {
  return new GridFSBucket(mongoose.connection.db, {
    bucketName: 'downloads', // creates 'downloads.files' + 'downloads.chunks' collections
  });
};

/**
 * Uploads a file buffer (from multer memoryStorage) into GridFS.
 * Returns the generated GridFS file _id.
 */
export const uploadBufferToGridFS = (buffer, filename, contentType) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(filename, { contentType });

    uploadStream.end(buffer);

    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', (err) => reject(err));
  });
};

/**
 * Deletes a file from GridFS by its _id. Safe to call even if it doesn't exist.
 */
export const deleteFromGridFS = async (fileId) => {
  try {
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch (error) {
    console.warn(`[GridFS Delete Warning]: ${error.message}`);
  }
};