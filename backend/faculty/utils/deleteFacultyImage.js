import fs from 'fs/promises';
import path from 'path';

/**
 * Utility function to safely delete a faculty member's avatar image from the server filesystem.
 * Handles relative, root-relative, or backslash paths saved in database records.
 *
 * @param {String} imagePath - Path string of the stored image (e.g. 'uploads/faculty/faculty-123.jpg' or '/uploads/faculty/faculty-123.jpg').
 * @returns {Promise<Boolean>} - Resolves to true if file is successfully deleted or if path was empty; false if deletion fails.
 */
export const deleteFacultyImage = async (imagePath) => {
  // Gracefully resolve if no image path was provided
  if (!imagePath || typeof imagePath !== 'string') {
    return true;
  }

  try {
    // Clean leading slashes and normalize file path relative to root directory
    const sanitizedPath = imagePath.replace(/^[\/\\]+/, '');
    const absolutePath = path.resolve(process.cwd(), sanitizedPath);

    // Verify file exists on local storage before unlinking
    try {
      await fs.access(absolutePath);
      await fs.unlink(absolutePath);
      return true;
    } catch (accessErr) {
      // File does not exist on disk or access was denied
      console.warn(`[deleteFacultyImage] File not found or inaccessible: ${absolutePath}`);
      return false;
    }
  } catch (error) {
    console.error(`[deleteFacultyImage] Error removing file (${imagePath}):`, error.message);
    return false;
  }
};

export default deleteFacultyImage;