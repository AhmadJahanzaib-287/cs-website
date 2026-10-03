import User from '../models/User.js';
import { sendToken } from '../utils/sendToken.js';

/**
 * @desc    Admin Login
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // 2. Check if user exists (explicitly select password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Verify password match
    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. Send Token Response
    sendToken(user, 200, res, 'Admin authenticated successfully');
  } catch (error) {
    console.error(`[Login Error]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error during login',
    });
  }
};

/**
 * @desc    Admin Logout (Clear Cookie)
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Get Current Logged-in Admin Profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Change the current admin password
 * @route   PUT /api/v1/auth/password
 * @access  Private
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Enter your current password and a new password of at least 8 characters.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error(`[Password Update Error]: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Unable to update password right now.',
    });
  }
};

/**
 * @desc    Update the current admin profile image
 * @route   PUT /api/v1/auth/avatar
 * @access  Private
 */
export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const validImageData = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

    if (typeof avatar !== 'string' || avatar.length > 1_400_000 || !validImageData.test(avatar)) {
      return res.status(400).json({
        success: false,
        message: 'Choose a PNG, JPG, or WebP image under 1 MB.',
      });
    }

    const imageBytes = Buffer.from(avatar.split(',')[1], 'base64');
    if (imageBytes.length > 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Profile image must be under 1 MB.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin profile not found.' });
    }

    user.avatar = avatar;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(`[Avatar Update Error]: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Unable to update profile picture right now.',
    });
  }
};

/**
 * @desc    Remove the current admin profile image
 * @route   DELETE /api/v1/auth/avatar
 * @access  Private
 */
export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin profile not found.' });
    }

    user.avatar = '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(`[Avatar Removal Error]: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Unable to remove profile picture right now.',
    });
  }
};