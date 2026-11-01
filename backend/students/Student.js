import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    regNo: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    registrationNo: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Student Name is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    degree: {
      type: String,
      required: [true, 'Degree / Program is required'],
      trim: true,
      index: true,
    },
    academicSession: {
      type: String,
      trim: true,
      default: '2022-2026',
    },
    semester: {
      type: String,
      trim: true,
      default: '1st',
      index: true,
    },
    semesterNumber: {
      type: String,
      trim: true,
      default: '1st',
    },
    session: {
      type: String,
      enum: ['Morning', 'Evening'],
      required: [true, 'Shift / Session is required'],
      default: 'Morning',
      index: true,
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'A',
      index: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    cnic: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Passed Out', 'Dropped'],
      default: 'Active',
      index: true,
    },
    guardianPhone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    cgpa: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save synchronization hook
studentSchema.pre('validate', function () {
  const roll = this.regNo || this.registrationNo;
  if (roll) {
    this.regNo = String(roll).trim().toUpperCase();
    this.registrationNo = this.regNo;
  }

  const sem = this.semester || this.semesterNumber || '1st';
  this.semester = String(sem).trim();
  this.semesterNumber = this.semester;
});

// Compound indexes
studentSchema.index({ degree: 1, semester: 1, session: 1, section: 1 });
studentSchema.index({ academicSession: 1 });

export default mongoose.model('Student', studentSchema);
