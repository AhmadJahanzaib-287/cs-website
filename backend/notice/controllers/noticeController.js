// backend/notice/controllers/noticeController.js
import Notice from '../models/Notice.js';

/**
 * @desc    Get all notices (Admin view - supports optional search)
 * @route   GET /api/v1/notices
 * @access  Private (Admin)
 */
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    console.error(`[Get Notices Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching notices',
    });
  }
};

/**
 * @desc    Get active notice for public website (Filtered by current date range & active status)
 * @route   GET /api/v1/notices/active
 * @access  Public
 */
export const getActiveNotice = async (req, res) => {
  try {
    const currentDate = new Date();
 
    const candidates = await Notice.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).sort({ createdAt: -1 });
 
    const priorityRank = { Emergency: 3, Important: 2, Normal: 1 };
 
    const notice = candidates.sort(
      (a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0)
    )[0];
 
    res.status(200).json({
      success: true,
      data: notice || null,
    });
  } catch (error) {
    console.error(`[Get Active Notice Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching active notice',
    });
  }
};
/**
 * @desc    Get single notice by ID
 * @route   GET /api/v1/notices/:id
 * @access  Private (Admin)
 */
export const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error(`[Get Notice By ID Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching notice',
    });
  }
};

/**
 * @desc    Create a new notice
 * @route   POST /api/v1/notices
 * @access  Private (Admin)
 */
export const createNotice = async (req, res) => {
  try {
    const { title, description, startDate, endDate, priority, isActive, linkUrl, linkText, showInFeed, feedEndDate } = req.body;
    // Validation
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, startDate, endDate)',
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date and time cannot be before start date and time',
      });
    }

    const newNotice = await Notice.create({
      title,
      description,
      startDate,
      endDate,
      priority: priority || 'Normal',
      isActive: isActive !== undefined ? isActive : true,
      linkUrl,
      linkText,
      showInFeed: showInFeed !== undefined ? showInFeed : true,
      feedEndDate: feedEndDate || undefined,
      createdBy: req.user?.id,
    });
    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: newNotice,
    });
  } catch (error) {
    console.error(`[Create Notice Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while creating notice',
    });
  }
};

/**
 * @desc    Update an existing notice
 * @route   PUT /api/v1/notices/:id
 * @access  Private (Admin)
 */
export const updateNotice = async (req, res) => {
  try {
   const { title, description, startDate, endDate, priority, isActive, linkUrl, linkText, showInFeed, feedEndDate } = req.body;
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    // Validate dates if both or either are provided
    const newStartDate = startDate ? new Date(startDate) : new Date(notice.startDate);
    const newEndDate = endDate ? new Date(endDate) : new Date(notice.endDate);
    

    if (newEndDate < newStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date and time cannot be before start date and time',
      });
    }

    if (title !== undefined) notice.title = title;
    if (description !== undefined) notice.description = description;
    if (startDate !== undefined) notice.startDate = startDate;
    if (endDate !== undefined) notice.endDate = endDate;
    if (priority !== undefined) notice.priority = priority;
    if (isActive !== undefined) notice.isActive = isActive;
    if (linkUrl !== undefined) notice.linkUrl = linkUrl;
    if (linkText !== undefined) notice.linkText = linkText;
    if (showInFeed !== undefined) notice.showInFeed = showInFeed;
    if (feedEndDate !== undefined) notice.feedEndDate = feedEndDate;

    await notice.save();

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (error) {
    console.error(`[Update Notice Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while updating notice',
    });
  }
};

/**
 * @desc    Delete a notice
 * @route   DELETE /api/v1/notices/:id
 * @access  Private (Admin)
 */
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    console.error(`[Delete Notice Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while deleting notice',
    });
  }
};

/**
 * @desc    Toggle Notice Status (Activate / Deactivate)
 * @route   PATCH /api/v1/notices/:id/status
 * @access  Private (Admin)
 */
export const toggleNoticeStatus = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    notice.isActive = !notice.isActive;
    await notice.save();

    res.status(200).json({
      success: true,
      message: `Notice ${notice.isActive ? 'activated' : 'deactivated'} successfully`,
      data: notice,
    });
  } catch (error) {
    console.error(`[Toggle Notice Status Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while updating notice status',
    });
  }
};
/**
 * @desc    Get all currently valid notices for the public Notices Feed (not just one)
 * @route   GET /api/v1/notices/public-list
 * @access  Public
 */
export const getPublicNoticeList = async (req, res) => {
  try {
    const currentDate = new Date();
    const notices = await Notice.find({
      isActive: true,
      showInFeed: true,
      startDate: { $lte: currentDate },
      $or: [
        { feedEndDate: { $exists: false } },
        { feedEndDate: null },
        { feedEndDate: { $gte: currentDate } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    console.error(`[Get Public Notice List Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error while fetching notices',
    });
  }

};