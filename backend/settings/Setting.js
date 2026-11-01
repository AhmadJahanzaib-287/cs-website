import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main_portal_settings',
      unique: true,
    },
    // General / Department Information
    departmentName: {
      type: String,
      default: 'Department of Computer Science',
      trim: true,
    },
    shortCode: {
      type: String,
      default: 'DCS - UAF',
      trim: true,
    },
    universityName: {
      type: String,
      default: 'University of Agriculture, Faisalabad (PARS Campus)',
      trim: true,
    },
    campusLocation: {
      type: String,
      default: 'Sub Campus PARS, Jhang Road, Faisalabad, Pakistan',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'cs@uaf.edu.pk',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '+92 41 9200161-70',
      trim: true,
    },
    websiteUrl: {
      type: String,
      default: 'https://dcs.uaf.edu.pk',
      trim: true,
    },
    departmentHead: {
      type: String,
      default: 'Prof. Dr. Chairperson',
      trim: true,
    },

    // Academic & Admission Preferences
    currentAcademicSession: {
      type: String,
      default: 'Fall 2026',
      trim: true,
    },
    activeSemesters: {
      type: [String],
      default: ['1st', '3rd', '5th', '7th'],
    },
    defaultClassCapacity: {
      type: Number,
      default: 50,
      min: 10,
      max: 200,
    },
    admissionPortalOpen: {
      type: Boolean,
      default: true,
    },
    admissionDeadline: {
      type: String,
      default: '2026-11-15',
    },
    studentApplicationsAcceptance: {
      type: Boolean,
      default: true,
    },

    // Notifications & Public Alerts
    emergencyNoticeActive: {
      type: Boolean,
      default: false,
    },
    emergencyNoticeText: {
      type: String,
      default: 'Admissions are open for Fall 2026. Apply online before deadline.',
      trim: true,
    },
    contactEmailNotifications: {
      type: Boolean,
      default: true,
    },

    // System & Security
    sessionTimeoutMinutes: {
      type: Number,
      default: 120,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    systemBackupEmail: {
      type: String,
      default: 'admin@uaf.edu.pk',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Setting', settingSchema);

