import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../utils/validate.js';
import { loginSchema, registerSchema } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/profile', protect, getUserProfile);

export default router;
