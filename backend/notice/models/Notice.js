// backend/notice/models/Notice.js
import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Notice description is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date and time are required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date and time are required'],
    },
    priority: {
      type: String,
      enum: ['Normal', 'Important', 'Emergency'],
      default: 'Normal',
    },
    linkUrl: {
      type: String,
      trim: true,
    },
    linkText: {
      type: String,
      trim: true,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showInFeed: {
      type: Boolean,
      default: true,
    },
    feedEndDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notice', noticeSchema);