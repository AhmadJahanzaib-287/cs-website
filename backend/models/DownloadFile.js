import mongoose from 'mongoose';

const downloadFileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'General', // e.g. Notices, Forms, Syllabus, Datesheet
    },
    gridFsFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // points to the actual file stored in GridFS
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0, // bytes
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('DownloadFile', downloadFileSchema);