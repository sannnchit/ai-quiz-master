import { z } from 'zod';
import { MAX_QUESTIONS, ROOM_CODE_LENGTH } from '../config/constants.js';
import { quizSettingsSchema } from './settingsSchema.js';

// Accepts any case so a user pasting a lowercase code still works; the controller
// normalises before the lookup.
export const roomIdParamSchema = z.object({
  roomId: z
    .string()
    .trim()
    .regex(
      new RegExp(`^[A-Za-z0-9]{${ROOM_CODE_LENGTH}}$`),
      `Room id must be ${ROOM_CODE_LENGTH} characters`
    ),
});

export const createRoomSchema = z.object({
  settings: quizSettingsSchema,
});

export const submitRoomAnswersSchema = z.object({
  answers: z
    .array(
      z
        .coerce
        .number()
        .int('Option index must be a whole number')
        .min(0)
        .max(3, 'Option index must be between 0 and 3')
    )
    .min(1, 'At least one answer is required')
    .max(MAX_QUESTIONS, `At most ${MAX_QUESTIONS} answers are accepted`),
});
