import mongoose from 'mongoose';
import { ANSWER_OPTION_COUNT } from '../config/constants.js';

// The single source of truth for what a question looks like, shared by the solo
// `Quiz` model and the multiplayer `Room` model so both store the same shape.
export const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length === ANSWER_OPTION_COUNT &&
          value.every((option) => typeof option === 'string' && option.trim().length > 0),
        message: `Each question must have exactly ${ANSWER_OPTION_COUNT} non-empty options`,
      },
    },
    // Index rather than the answer text: immune to duplicate/whitespace option text.
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: ANSWER_OPTION_COUNT - 1,
    },
  },
  { _id: true }
);

export default questionSchema;
