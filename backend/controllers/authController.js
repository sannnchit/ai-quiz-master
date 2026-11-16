import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { publicUser } from '../utils/serializeUser.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.validated.body;

  const userExists = await User.findOne({ username });
  if (userExists) {
    throw new AppError(409, 'USERNAME_TAKEN', 'That username is already taken');
  }

  const user = await User.create({ username, password });

  res.status(201).json({
    ...publicUser(user),
    token: generateToken(user._id),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.validated.body;

  const user = await User.findOne({ username });

  // Same error for "no such user" and "wrong password" so the response can't be
  // used to enumerate accounts.
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
  }

  res.json({
    ...publicUser(user),
    token: generateToken(user._id),
  });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  res.json(publicUser(req.user));
});
