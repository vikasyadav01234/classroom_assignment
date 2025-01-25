const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const AppError = require('../utils/appError');

// Protect routes with JWT authentication
exports.protect = async (req, res, next) => {
  try {
    // 1. Get token from headers
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2. Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findOne({ user_id: decoded.user_id });
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4. Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return next(
        new AppError('Your session has expired. Please log in again.', 401)
      );
    }

    // 5. Grant access and attach user to request
    req.user = currentUser;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
};

// Restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Handle token blacklisting for logout
exports.blacklistToken = async (req, res, next) => {
  try {
    if (req.token) {
      const decoded = jwt.decode(req.token);
      await TokenBlacklist.create({
        token: req.token,
        expiresAt: new Date(decoded.exp * 1000)
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Alias for restrictTo (checkRole)
exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to access this resource', 403)
      );
    }
    next();
  };
};
  