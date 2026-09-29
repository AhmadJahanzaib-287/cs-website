import mongoose from 'mongoose';

const workloadSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: [true, 'Year is required'],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: ['Spring', 'Winter', 'Summer'],
    },
    title: {
      type: String,
      trim: true,
    },
    // draft: just created, nothing added yet
    // in_progress: classes/teachers/assignments partially added
    // completed: admin has gone through all steps at least once
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'completed'],
      default: 'draft',
    },
    // Which wizard step to resume on ("Continue" button uses this)
    currentStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-build a friendly title like "Spring Semester 2026" if not provided
workloadSchema.pre('save', function (next) {
  if (!this.title) {
    this.title = `${this.semester} Semester ${this.year}`;
  }
  next();
});

export default mongoose.model('Workload', workloadSchema);