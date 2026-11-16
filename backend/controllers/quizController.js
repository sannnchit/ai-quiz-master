import Quiz from '../models/quizModel.js';
import User from '../models/userModel.js';
import { PASS_THRESHOLD } from '../config/constants.js';
import { AppError } from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { publicUser } from '../utils/serializeUser.js';
import { gradeAnswers } from '../utils/scoring.js';
import { generateQuestions } from '../services/quizGenerator.js';

/**
 * Turns a stored attempt into the response body. `review` is what lets the client
 * show which answers were wrong — the answer key is revealed only after scoring.
 */
const buildAttemptResult = (quiz, attempt) => {
  const total = attempt.total || quiz.questions.length;
  const answersByQuestion = new Map(
    attempt.answers.map((answer) => [String(answer.questionId), answer])
  );

  const review = quiz.questions.map((question) => {
    const answer = answersByQuestion.get(String(question._id));
    return {
      questionId: question._id,
      prompt: question.prompt,
      options: question.options,
      chosenOptionIndex: answer ? answer.optionIndex : null,
      correctOptionIndex: question.correctOptionIndex,
      isCorrect: Boolean(answer?.isCorrect),
    };
  });

  return {
    id: attempt._id,
    score: attempt.score,
    total,
    percentage: total === 0 ? 0 : Math.round((attempt.score / total) * 100),
    passed: attempt.score / total >= PASS_THRESHOLD,
    submittedAt: attempt.submittedAt,
    review,
  };
};

/**
 * POST /api/quizzes
 * Generates and persists a quiz, then returns it WITHOUT the answer key.
 * The response is the only place a client ever sees the questions.
 */
export const createQuiz = asyncHandler(async (req, res) => {
  const { topic, difficulty, numQuestions } = req.validated.body;

  const questions = await generateQuestions({ topic, difficulty, numQuestions });

  const quiz = await Quiz.create({
    owner: req.user._id,
    topic,
    difficulty,
    requestedQuestions: numQuestions,
    questions,
  });

  res.status(201).json(quiz.toPublicJSON());
});

/**
 * POST /api/quizzes/:quizId/attempts
 * Scores the submission server-side and records it. Submitting twice returns the
 * original result instead of incrementing the player's stats again.
 */
export const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId } = req.validated.params;
  const { answers } = req.validated.body;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new AppError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');
  }
  if (!quiz.owner.equals(req.user._id)) {
    throw new AppError(403, 'FORBIDDEN', 'This quiz belongs to another user');
  }

  const existingAttempt = quiz.attempts.find((attempt) => attempt.user.equals(req.user._id));

  if (existingAttempt) {
    const user = await User.findById(req.user._id);
    return res.json({
      attempt: buildAttemptResult(quiz, existingAttempt),
      replayed: true,
      user: publicUser(user),
    });
  }

  const graded = gradeAnswers(quiz.questions, answers);

  quiz.attempts.push({
    user: req.user._id,
    answers: graded.answers,
    score: graded.score,
    total: graded.total,
  });
  await quiz.save();

  const passed = graded.score / graded.total >= PASS_THRESHOLD;

  const user = await User.findById(req.user._id);
  user.stats.played += 1;
  if (passed) user.stats.won += 1;
  user.history.push({
    type: 'solo',
    topic: quiz.topic,
    score: graded.score,
    total: graded.total,
  });
  await user.save();

  return res.status(201).json({
    attempt: buildAttemptResult(quiz, quiz.attempts[quiz.attempts.length - 1]),
    replayed: false,
    user: publicUser(user),
  });
});
