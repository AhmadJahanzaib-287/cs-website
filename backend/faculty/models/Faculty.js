import mongoose from 'mongoose';

/**
 * Faculty Schema definition for MERN Stack Department Management System.
 * Stores faculty profile details, academic credentials, specializations,
 * contact information, and backend storage paths for uploaded photos.
 */
const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Faculty member name is required.'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required.'],
      trim: true,
      default: 'Lecturer',
    },
    qualification: {
      type: String,
      required: [true, 'Qualification details are required.'],
      trim: true,
    },
    category: {
  type: String,
  required: [true, 'Category classification is required.'],
  enum: {
    values: ['Professors', 'Associate Professors', 'Assistant Professors', 'Lecturers'],
    message: '{VALUE} is not a valid faculty category.',
  },
  default: 'Lecturers',
},
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address.',
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    office: {
      type: String,
      trim: true,
      default: '',
    },
    experience: {
      type: String,
      trim: true,
      default: '0 Years',
    },
    publicationsCount: {
      type: Number,
      default: 0,
      min: [0, 'Publications count cannot be negative.'],
    },
    specializations: {
  type: [String],
  default: [],

    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt timestamps
  }
);

// Compound index for optimized search performance across name, qualification, and email
facultySchema.index({ name: 'text', qualification: 'text', email: 1 });

const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);

export default Faculty;