import { z } from 'zod';
import { MAX_QUESTIONS, MAX_TOPIC_LENGTH, MIN_QUESTIONS } from '../config/constants.js';

// Shared by solo quiz creation and multiplayer room creation — both ask the AI for
// a quiz with the same three settings, so they must accept the same input.
export const quizSettingsSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(2, 'Topic must be at least 2 characters')
    .max(MAX_TOPIC_LENGTH, `Topic must be at most ${MAX_TOPIC_LENGTH} characters`),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
    errorMap: () => ({ message: 'Difficulty must be Easy, Medium or Hard' }),
  }),
  numQuestions: z.coerce
    .number()
    .int('Number of questions must be a whole number')
    .min(MIN_QUESTIONS)
    .max(MAX_QUESTIONS, `Number of questions must be at most ${MAX_QUESTIONS}`),
});

export default quizSettingsSchema;
