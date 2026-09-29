import mongoose from 'mongoose';

// Reusable master list of classes — same pattern as Teacher.js / Course.js
const classSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
    },
    // Kept as String to match the existing ReusableComboBox values ('1'..'8')
    semesterNumber: {
      type: String,
      required: [true, 'Semester is required'],
    },
    session: {
      type: String,
      enum: ['Morning', 'Evening'],
      required: [true, 'Session is required'],
    },
    section: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Class', classSchema);