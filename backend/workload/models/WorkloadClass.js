import mongoose from 'mongoose';

// This is now a LINK table only — it connects a Workload to a reusable
// Class (from the master list), the same pattern as WorkloadTeacher.
const workloadClassSchema = new mongoose.Schema(
  {
    workloadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workload',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent linking the same class twice to the same workload
workloadClassSchema.index({ workloadId: 1, classId: 1 }, { unique: true });

export default mongoose.model('WorkloadClass', workloadClassSchema);