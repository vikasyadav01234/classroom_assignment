// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const AppError = require('../utils/appError');
const asyncHandler = require('express-async-handler');

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  // 1. Validate input
  if (!email || !password || !role) {
    return next(new AppError('Please provide email, password, and role', 400));
  }

  // 2. Validate role
  const validRoles = ['student', 'teacher', 'principal'];
  if (!validRoles.includes(role)) {
    return next(new AppError(`Invalid role. Valid roles: ${validRoles.join(', ')}`, 400));
  }

  // 3. Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  try {
    // 4. Generate IDs
    const user_id = await User.getNextUserId();
    const roleField = `${role}_id`;
    const role_id = await User.getNextRoleId(role);

    // 5. Create user
    const user = await User.create({
      user_id,
      email,
      password,
      role,
      [roleField]: role_id
    });

    // 6. Generate JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        [roleField]: role_id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // 7. Send response
    res.status(201).json({
      success: true,
      token,
      data: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        [roleField]: role_id
      }
    });

  } catch (error) {
    return next(new AppError('Registration failed. Please try again.', 500));
  }
});

// @desc    Authenticate user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check for email and password
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  try {
    // 2. Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    // 3. Generate role-specific payload
    const roleField = `${user.role}_id`;
    const payload = {
      user_id: user.user_id,
      role: user.role,
      [roleField]: user[roleField],
      email: user.email
    };

    // 4. Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    // 5. Send response
    res.status(200).json({
      success: true,
      token,
      data: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        [roleField]: user[roleField]
      }
    });

  } catch (error) {
    return next(new AppError('Login failed. Please try again.', 500));
  }
});

// @desc    Logout user / Invalidate token
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get token from request
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next(new AppError('No token provided', 400));

    // 2. Decode token to get expiration
    const decoded = jwt.decode(token);
    if (!decoded.exp) return next(new AppError('Invalid token', 401));

    // 3. Add to blacklist
    await TokenBlacklist.create({
      token,
      expiresAt: new Date(decoded.exp * 1000)
    });

    // 4. Send response
    res.status(200).json({
      success: true,
      message: 'Successfully logged out'
    });

  } catch (error) {
    return next(new AppError('Logout failed. Please try again.', 500));
  }
});