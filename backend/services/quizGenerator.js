import { GoogleGenAI, Type } from '@google/genai';
import { AI_MODEL, AI_TEMPERATURE } from '../config/constants.js';
import { AppError } from '../utils/AppError.js';

// Constraining the model to this schema is what makes the output parseable at all:
// no markdown fences, no prose, no regex extraction.
const RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
    },
    required: ['question', 'options', 'correctAnswer'],
  },
};

const buildPrompt = ({ topic, difficulty, numQuestions }) => `Generate a quiz with ${numQuestions} questions on the topic of "${topic}". The difficulty level should be ${difficulty}. For each question, provide 4 multiple-choice options, and specify the correct answer. Ensure the question and options are plain text.`;

/**
 * Converts the provider's `{question, options, correctAnswer}` into the internal
 * `{prompt, options, correctOptionIndex}` shape, and rejects anything malformed
 * rather than persisting a broken quiz.
 */
const normalizeQuestions = (raw, requestedQuestions) => {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new AppError(502, 'AI_RESPONSE_INVALID', 'The AI did not return any questions. Please try again.');
  }

  const questions = raw.slice(0, requestedQuestions).map((item) => {
    const prompt = typeof item?.question === 'string' ? item.question.trim() : '';
    const options = Array.isArray(item?.options)
      ? item.options.map((option) => String(option ?? '').trim())
      : [];
    const correctAnswer = typeof item?.correctAnswer === 'string' ? item.correctAnswer.trim() : '';

    if (!prompt || options.length !== 4 || options.some((option) => !option)) {
      throw new AppError(502, 'AI_RESPONSE_INVALID', 'The AI returned a malformed question. Please try again.');
    }

    const correctOptionIndex = options.findIndex(
      (option) => option.toLowerCase() === correctAnswer.toLowerCase()
    );

    if (correctOptionIndex === -1) {
      throw new AppError(502, 'AI_RESPONSE_INVALID', 'The AI returned an answer that is not one of its own options. Please try again.');
    }

    return { prompt, options, correctOptionIndex };
  });

  return questions;
};

export const generateQuestions = async ({ topic, difficulty, numQuestions }) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new AppError(500, 'AI_NOT_CONFIGURED', 'The AI provider is not configured on this server');
  }

  let response;
  try {
    const ai = new GoogleGenAI({ apiKey });
    response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: buildPrompt({ topic, difficulty, numQuestions }),
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: AI_TEMPERATURE,
      },
    });
  } catch (error) {
    console.error('AI generation request failed:', error);
    throw new AppError(502, 'AI_GENERATION_FAILED', 'The AI provider could not generate a quiz. Please try again.');
  }

  let parsed;
  try {
    parsed = JSON.parse(response.text.trim());
  } catch {
    throw new AppError(502, 'AI_RESPONSE_INVALID', 'The AI returned unreadable data. Please try again.');
  }

  return normalizeQuestions(parsed, numQuestions);
};

export default generateQuestions;
