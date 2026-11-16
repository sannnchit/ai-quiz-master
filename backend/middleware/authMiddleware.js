import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Not authorized, no token');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Not authorized, token failed');
  }

  // Re-fetch so a deleted user or a changed account is reflected immediately
  // instead of trusting a possibly stale 30-day claim.
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new AppError(401, 'USER_NOT_FOUND', 'Not authorized, user not found');
  }

  req.user = user;
  next();
});
