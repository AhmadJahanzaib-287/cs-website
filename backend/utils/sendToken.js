import jwt from 'jsonwebtoken';

/**
 * Generates JWT Token and sends secure Cookie response
 */
export const sendToken = (user, statusCode, res, message = 'Success') => {
  // 1. Generate JWT Payload
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'dcs_uaf_pars_production_secret_key_2026_super_secure',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  // 2. Production & Mobile-Ready Cookie Options
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  // Remove password from output JSON
  user.password = undefined;

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};