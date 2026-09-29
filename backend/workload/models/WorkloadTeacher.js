import mongoose from 'mongoose';

const workloadTeacherSchema = new mongoose.Schema(
  {
    workloadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workload',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent adding the same teacher twice to the same workload
workloadTeacherSchema.index({ workloadId: 1, teacherId: 1 }, { unique: true });

export default mongoose.model('WorkloadTeacher', workloadTeacherSchema);