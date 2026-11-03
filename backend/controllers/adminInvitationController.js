import { createHash, randomBytes } from 'node:crypto';
import AdminInvitation from '../models/AdminInvitation.js';
import User from '../models/User.js';
import { sendAdminInvitationEmail } from '../utils/sendAdminInvitationEmail.js';

const INVITATION_LIFETIME_MS = 24 * 60 * 60 * 1000;
const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validUsername = /^[a-z0-9._-]{3,32}$/;

export const createAdminInvitation = async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !validEmail.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }

  let invitation;
  try {
    if (await User.exists({ email })) {
      return res.status(409).json({ success: false, message: 'An account already uses this email address.' });
    }

    const clientUrl = process.env.CLIENT_URL;
    if (!clientUrl) throw new Error('CLIENT_URL must be configured.');
    const token = randomBytes(32).toString('hex');
    invitation = await AdminInvitation.create({
      email,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + INVITATION_LIFETIME_MS),
      invitedBy: req.user._id,
    });

    const setupLink = `${clientUrl.replace(/\/$/, '')}/admin/setup?token=${token}`;
    try {
      await sendAdminInvitationEmail(email, setupLink);
    } catch (error) {
      try {
        await AdminInvitation.deleteOne({ _id: invitation._id });
      } catch (cleanupError) {
        console.error(`[Admin Invitation Cleanup Error]: ${cleanupError.message}`);
      }
      console.error(`[Admin Invitation Delivery Error]: ${error.message}`);
      if (error.code === 'SMTP_CONFIG_MISSING' || error.code === 'SMTP_CONFIG_INVALID') {
        return res.status(503).json({ success: false, message: error.message });
      }
      return res.status(503).json({
        success: false,
        message: 'Email delivery failed. Check your SMTP host, port, account/app password, and MAIL_FROM settings.',
      });
    }

    try {
      await AdminInvitation.deleteMany({ email, _id: { $ne: invitation._id } });
    } catch (error) {
      console.error(`[Admin Invitation Cleanup Error]: ${error.message}`);
    }
    return res.status(201).json({
      success: true,
      message: `An account setup link has been sent to ${email}.`,
    });
  } catch (error) {
    console.error(`[Admin Invitation Error]: ${error.message}`);
    return res.status(503).json({
      success: false,
      message: 'Could not send the invitation. Check the SMTP and CLIENT_URL settings, then try again.',
    });
  }
};

export const getAdminInvitation = async (req, res) => {
  const { token } = req.params;
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).json({ success: false, message: 'This invitation link is invalid or has expired.' });
  }

  try {
    const invitation = await AdminInvitation.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    }).select('email expiresAt');

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'This invitation link is invalid or has expired.' });
    }

    return res.status(200).json({
      success: true,
      data: { email: invitation.email, expiresAt: invitation.expiresAt },
    });
  } catch (error) {
    console.error(`[Admin Invitation Lookup Error]: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Could not validate this invitation.' });
  }
};

export const completeAdminInvitation = async (req, res) => {
  const { token, username, password } = req.body || {};
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).json({ success: false, message: 'This invitation link is invalid or has expired.' });
  }

  const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
  if (!validUsername.test(normalizedUsername)) {
    return res.status(400).json({
      success: false,
      message: 'Username must be 3–32 characters and use only letters, numbers, dots, underscores, or hyphens.',
    });
  }
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    return res.status(400).json({ success: false, message: 'Password must be between 12 and 128 characters.' });
  }

  try {
    const invitation = await AdminInvitation.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'This invitation link is invalid or has expired.' });
    }

    if (await User.exists({
      $or: [
        { email: invitation.email },
        { email: normalizedUsername },
        { username: normalizedUsername },
      ],
    })) {
      return res.status(409).json({
        success: false,
        message: 'That email or username is already in use. Ask the administrator for a new invitation.',
      });
    }

    await User.create({
      name: normalizedUsername,
      username: normalizedUsername,
      email: invitation.email,
      password,
      role: 'admin',
    });
    try {
      await AdminInvitation.deleteOne({ _id: invitation._id });
    } catch (error) {
      console.error(`[Admin Invitation Cleanup Error]: ${error.message}`);
    }

    return res.status(201).json({
      success: true,
      message: 'Your admin account is ready. Sign in with your email or username and the password you just set.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'That email or username is already in use. Ask the administrator for a new invitation.',
      });
    }

    console.error(`[Admin Invitation Completion Error]: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Could not complete admin account setup.' });
  }
};
