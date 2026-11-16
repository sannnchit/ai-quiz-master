import express from 'express';
import { createQuiz, submitQuizAttempt } from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../utils/validate.js';
import {
  createQuizSchema,
  quizIdParamSchema,
  submitAttemptSchema,
} from '../validators/quizValidator.js';

const router = express.Router();

router.post('/', protect, validate(createQuizSchema), createQuiz);

router.post(
  '/:quizId/attempts',
  protect,
  validate(quizIdParamSchema, 'params'),
  validate(submitAttemptSchema),
  submitQuizAttempt
);

export default router;
