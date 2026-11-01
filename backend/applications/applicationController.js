import mongoose from 'mongoose';
import Application from './Application.js';
import ApplicationCounter from './ApplicationCounter.js';
import Setting from '../settings/Setting.js';

const applicationStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];

const isText = (value, maxLength) =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;

export const createApplication = async (req, res) => {
  try {
    const {
      submissionKey,
      applicationType,
      recipientId,
      recipientTitle,
      subject,
      body,
      studentName,
      studentRegNo,
      semester,
      section = '',
      contactNo,
      dynamicData = {},
    } = req.body;

    const validFields =
      typeof submissionKey === 'string' && /^[\w-]{16,80}$/.test(submissionKey) &&
      isText(applicationType, 100) &&
      isText(recipientId, 60) &&
      isText(recipientTitle, 160) &&
      isText(subject, 240) &&
      isText(body, 10000) &&
      isText(studentName, 120) &&
      isText(studentRegNo, 60) &&
      isText(semester, 30) &&
      isText(contactNo, 30) &&
      typeof section === 'string' && section.length <= 60 &&
      dynamicData && typeof dynamicData === 'object' && !Array.isArray(dynamicData);

    if (!validFields) {
      return res.status(400).json({ success: false, message: 'Please provide valid application details.' });
    }

    const existingApplication = await Application.findOne({ submissionKey }).select('+submissionKey');
    if (existingApplication) {
      return res.status(200).json({
        success: true,
        message: 'Application was already recorded.',
        data: existingApplication,
      });
    }

    const portalSettings = await Setting.findOne({ key: 'main_portal_settings' }).select(
      'studentApplicationsAcceptance maintenanceMode'
    );
    if (portalSettings?.studentApplicationsAcceptance === false || portalSettings?.maintenanceMode === true) {
      return res.status(403).json({
        success: false,
        message: portalSettings.maintenanceMode
          ? 'The portal is temporarily unavailable for maintenance.'
          : 'Student applications are currently closed.',
      });
    }

    const counter = await ApplicationCounter.findOneAndUpdate(
      { _id: 'application' },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const serialNumber = `DCS-APP-${String(counter.sequence).padStart(6, '0')}`;

    const application = await Application.create({
      submissionKey,
      serialNumber,
      applicationType: applicationType.trim(),
      recipientId: recipientId.trim(),
      recipientTitle: recipientTitle.trim(),
      subject: subject.trim(),
      body: body.trim(),
      studentName: studentName.trim(),
      studentRegNo: studentRegNo.trim(),
      semester: semester.trim(),
      section: section.trim(),
      contactNo: contactNo.trim(),
      dynamicData,
    });

    return res.status(201).json({
      success: true,
      message: 'Application generated and recorded.',
      data: application,
    });
  } catch (error) {
    if (error.code === 11000 && typeof req.body.submissionKey === 'string') {
      const existingApplication = await Application.findOne({ submissionKey: req.body.submissionKey }).select('+submissionKey');
      if (existingApplication) {
        return res.status(200).json({ success: true, message: 'Application was already recorded.', data: existingApplication });
      }
    }
    return res.status(500).json({ success: false, message: 'Could not record the application.' });
  }
};

export const getApplications = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
    const filter = {};

    if (applicationStatuses.includes(req.query.status)) filter.status = req.query.status;
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const escapedSearch = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchPattern = new RegExp(escapedSearch, 'i');
      filter.$or = [
        { serialNumber: searchPattern },
        { studentName: searchPattern },
        { studentRegNo: searchPattern },
        { applicationType: searchPattern },
      ];
    }

    const [applications, total, statusCounts] = await Promise.all([
      Application.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Application.countDocuments(filter),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    const counts = Object.fromEntries(statusCounts.map(({ _id, count }) => [_id, count]));

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: {
        total: Object.values(counts).reduce((sum, count) => sum + count, 0),
        pending: counts.Pending || 0,
        underReview: counts['Under Review'] || 0,
        approved: counts.Approved || 0,
        rejected: counts.Rejected || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load applications.' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  if (!mongoose.isValidObjectId(req.params.id) || !applicationStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Choose a valid application status.' });
  }

  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not update application status.' });
  }
};