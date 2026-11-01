import Setting from './Setting.js';

/**
 * @desc    Get portal settings (creates default if none exists)
 * @route   GET /api/v1/settings
 * @access  Public / Private
 */
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ key: 'main_portal_settings' });

    if (!settings) {
      settings = await Setting.create({ key: 'main_portal_settings' });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('[Get Settings Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve portal settings',
    });
  }
};

/**
 * @desc    Update portal settings
 * @route   PUT /api/v1/settings
 * @access  Private (Admin)
 */
export const updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      'departmentName',
      'shortCode',
      'universityName',
      'campusLocation',
      'contactEmail',
      'contactPhone',
      'websiteUrl',
      'departmentHead',
      'currentAcademicSession',
      'activeSemesters',
      'defaultClassCapacity',
      'admissionPortalOpen',
      'admissionDeadline',
      'studentApplicationsAcceptance',
      'emergencyNoticeActive',
      'emergencyNoticeText',
      'contactEmailNotifications',
      'sessionTimeoutMinutes',
      'maintenanceMode',
      'systemBackupEmail',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const settings = await Setting.findOneAndUpdate(
      { key: 'main_portal_settings' },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Portal settings saved successfully',
      data: settings,
    });
  } catch (error) {
    console.error('[Update Settings Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portal settings: ' + error.message,
    });
  }
};

