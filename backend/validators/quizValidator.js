import { z } from 'zod';
import { MAX_QUESTIONS } from '../config/constants.js';
import { quizSettingsSchema } from './settingsSchema.js';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid identifier');

const optionIndex = z.coerce
  .number()
  .int('Option index must be a whole number')
  .min(0)
  .max(3, 'Option index must be between 0 and 3');

export const createQuizSchema = quizSettingsSchema;

export const submitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: objectId,
        optionIndex,
      })
    )
    .min(1, 'At least one answer is required')
    .max(MAX_QUESTIONS, `At most ${MAX_QUESTIONS} answers are accepted`),
});

export const quizIdParamSchema = z.object({
  quizId: objectId,
});
