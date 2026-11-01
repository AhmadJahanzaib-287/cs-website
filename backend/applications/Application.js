import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    submissionKey: { type: String, required: true, unique: true, select: false },
    serialNumber: { type: String, required: true, unique: true, index: true },
    applicationType: { type: String, required: true, trim: true, maxlength: 100 },
    recipientId: { type: String, required: true, trim: true, maxlength: 60 },
    recipientTitle: { type: String, required: true, trim: true, maxlength: 160 },
    subject: { type: String, required: true, trim: true, maxlength: 240 },
    body: { type: String, required: true, maxlength: 10000 },
    studentName: { type: String, required: true, trim: true, maxlength: 120 },
    studentRegNo: { type: String, required: true, trim: true, maxlength: 60 },
    semester: { type: String, required: true, trim: true, maxlength: 30 },
    section: { type: String, trim: true, maxlength: 60, default: '' },
    contactNo: { type: String, required: true, trim: true, maxlength: 30 },
    dynamicData: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ createdAt: -1 });

export default mongoose.model('Application', applicationSchema);