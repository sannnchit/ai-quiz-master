import express from 'express';
import {
  createRoom,
  getRoom,
  joinRoom,
  startQuiz,
  submitRoomAnswers,
} from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../utils/validate.js';
import {
  createRoomSchema,
  roomIdParamSchema,
  submitRoomAnswersSchema,
} from '../validators/roomValidator.js';

const router = express.Router();

router.post('/', protect, validate(createRoomSchema), createRoom);
router.get('/:roomId', protect, validate(roomIdParamSchema, 'params'), getRoom);
router.post('/:roomId/join', protect, validate(roomIdParamSchema, 'params'), joinRoom);
router.post('/:roomId/start', protect, validate(roomIdParamSchema, 'params'), startQuiz);
router.post(
  '/:roomId/submit',
  protect,
  validate(roomIdParamSchema, 'params'),
  validate(submitRoomAnswersSchema),
  submitRoomAnswers
);

export default router;
