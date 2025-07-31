
import express from 'express';
import {
    generateSoloQuiz,
    createRoom,
    joinRoom,
    getRoomStatus,
    startQuiz,
    submitSolo,
    submitMultiplayerAnswers
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate-solo', protect, generateSoloQuiz);
router.post('/submit-solo', protect, submitSolo);

router.post('/room', protect, createRoom);
router.post('/room/:roomId/join', protect, joinRoom);
router.get('/room/:roomId/status', protect, getRoomStatus);
router.post('/room/:roomId/start', protect, startQuiz);
router.post('/room/:roomId/submit', protect, submitMultiplayerAnswers);

export default router;
