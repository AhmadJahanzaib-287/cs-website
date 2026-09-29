import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    creditHours: {
      type: String, // e.g. "3(2-1)"
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);