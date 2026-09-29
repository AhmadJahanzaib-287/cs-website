import mongoose from 'mongoose';

// One row inside an assignment — a single teacher's role on that course
const teacherRoleSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    role: {
      type: String,
      enum: ['T', 'P', 'T+P', 'PG-1', 'PG-2'],
      default: 'T',
    },
  },
  { _id: false }
);

const workloadAssignmentSchema = new mongoose.Schema(
  {
    workloadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workload',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkloadClass',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teachers: {
      type: [teacherRoleSchema],
      default: [],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('WorkloadAssignment', workloadAssignmentSchema);