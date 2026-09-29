import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect Routes - Verify JWT Token from Cookie or Authorization Header
 */
export const isAuthenticatedUser = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // Fallback check in Authorization Header (Bearer <token>)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'none') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Please login to access this resource',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dcs_uaf_pars_production_secret_key_2026_super_secure'
    );

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};