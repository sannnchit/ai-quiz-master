import mongoose from 'mongoose';
import { DIFFICULTIES } from '../config/constants.js';
import { questionSchema } from './questionSchema.js';

// One submitted answer, stored after the server has graded it.
const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    optionIndex: { type: Number, required: true, min: 0, max: 3 },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: [answerSchema], default: [] },
  score: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 1 },
  submittedAt: { type: Date, default: Date.now },
});

/**
 * A generated quiz owned by one user. Questions live server-side only; the client
 * receives them through `toPublicJSON()` which deliberately omits the answer key.
 */
const quizSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: DIFFICULTIES, required: true },
    requestedQuestions: { type: Number, required: true, min: 1 },
    questions: { type: [questionSchema], required: true },
    attempts: { type: [attemptSchema], default: [] },
  },
  { timestamps: true }
);

/** Client-facing representation. No `correctOptionIndex` ever leaves the server. */
quizSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    quizId: this._id,
    topic: this.topic,
    difficulty: this.difficulty,
    numQuestions: this.questions.length,
    questions: this.questions.map((question) => ({
      id: question._id,
      prompt: question.prompt,
      options: question.options,
    })),
  };
};

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
