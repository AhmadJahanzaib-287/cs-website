import DownloadFile from '../models/DownloadFile.js';
import { uploadBufferToGridFS, deleteFromGridFS, getBucket } from '../utils/gridfs.js';

/**
 * @desc    Admin uploads a new downloadable file
 * @route   POST /api/v1/downloads
 * @access  Private (Admin)
 */
export const addDownloadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a file to upload',
      });
    }

    const { title, description, category } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const gridFsFileId = await uploadBufferToGridFS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const newFile = await DownloadFile.create({
      title,
      description,
      category,
      gridFsFileId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: newFile,
    });
  } catch (error) {
    console.error(`[Add Download Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while uploading file',
    });
  }
};

/**
 * @desc    Get all downloadable files (paginated, public)
 * @route   GET /api/v1/downloads?page=1&limit=20&category=Notices
 * @access  Public
 */
export const getDownloadFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [files, total] = await Promise.all([
      DownloadFile.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DownloadFile.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: files.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      files,
    });
  } catch (error) {
    console.error(`[Get Downloads Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching files',
    });
  }
};

/**
 * @desc    Stream/download the actual file by its DownloadFile _id
 * @route   GET /api/v1/downloads/file/:id
 * @access  Public
 */
export const streamDownloadFile = async (req, res) => {
  try {
    const file = await DownloadFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.set({
      'Content-Type': file.fileType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    });

    const bucket = getBucket();
    const downloadStream = bucket.openDownloadStream(file.gridFsFileId);

    downloadStream.on('error', () => {
      res.status(404).json({ success: false, message: 'File data not found' });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(`[Stream Download Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while downloading file',
    });
  }
};

/**
 * @desc    Admin updates file metadata, optionally replaces the file itself
 * @route   PUT /api/v1/downloads/:id
 * @access  Private (Admin)
 */
export const updateDownloadFile = async (req, res) => {
  try {
    const file = await DownloadFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const { title, description, category } = req.body;

    if (title) file.title = title;
    if (description !== undefined) file.description = description;
    if (category) file.category = category;

    // If a new file was uploaded, replace the old one in GridFS
    if (req.file) {
      await deleteFromGridFS(file.gridFsFileId);

      const newGridFsFileId = await uploadBufferToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      file.gridFsFileId = newGridFsFileId;
      file.fileName = req.file.originalname;
      file.fileType = req.file.mimetype;
      file.fileSize = req.file.size;
    }

    await file.save();

    res.status(200).json({
      success: true,
      message: 'File updated successfully',
      file,
    });
  } catch (error) {
    console.error(`[Update Download Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while updating file',
    });
  }
};

/**
 * @desc    Admin deletes a file (removes from GridFS + database)
 * @route   DELETE /api/v1/downloads/:id
 * @access  Private (Admin)
 */
export const deleteDownloadFile = async (req, res) => {
  try {
    const file = await DownloadFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    await deleteFromGridFS(file.gridFsFileId);
    await file.deleteOne();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error(`[Delete Download Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while deleting file',
    });
  }
};