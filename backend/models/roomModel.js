import mongoose from 'mongoose';
import { DIFFICULTIES, PLAYER_STATUS, ROOM_STATUS } from '../config/constants.js';
import { questionSchema } from './questionSchema.js';

const playerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(PLAYER_STATUS),
      default: PLAYER_STATUS.JOINED,
    },
    // Option indices, matching the question order. Nothing meaningful to a cheater:
    // the score is computed from the stored answer key, not from this array.
    answers: { type: [Number], default: [] },
    score: { type: Number, default: 0 },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    settings: {
      topic: { type: String, required: true, trim: true },
      numQuestions: { type: Number, required: true, min: 1 },
      difficulty: { type: String, enum: DIFFICULTIES, required: true },
    },
    players: { type: [playerSchema], default: [] },
    questions: { type: [questionSchema], default: [] },
    status: {
      type: String,
      enum: Object.values(ROOM_STATUS),
      default: ROOM_STATUS.WAITING,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
