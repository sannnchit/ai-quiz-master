import { AppError } from './AppError.js';

/**
 * Grades a submitted set of { questionId, optionIndex } against the stored question
 * set. Every question must be answered exactly once, which is what makes the result
 * trustworthy: the client cannot skip, duplicate, or invent questions.
 *
 * @returns {{ answers: Array<{questionId: any, optionIndex: number, isCorrect: boolean}>,
 *             review: Array<object>, score: number, total: number }}
 */
export const gradeAnswers = (questions, submittedAnswers) => {
  const questionById = new Map(questions.map((question) => [String(question._id), question]));

  const seen = new Set();
  const graded = new Map();

  submittedAnswers.forEach(({ questionId, optionIndex }) => {
    const key = String(questionId);

    if (!questionById.has(key)) {
      throw new AppError(400, 'UNKNOWN_QUESTION', 'One or more answers reference a question that is not part of this quiz');
    }
    if (seen.has(key)) {
      throw new AppError(400, 'DUPLICATE_ANSWER', 'Each question may only be answered once');
    }

    seen.add(key);
    graded.set(key, {
      questionId: questionById.get(key)._id,
      optionIndex,
      isCorrect: questionById.get(key).correctOptionIndex === optionIndex,
    });
  });

  if (seen.size !== questions.length) {
    throw new AppError(
      400,
      'INCOMPLETE_ANSWERS',
      `Expected ${questions.length} answers but received ${seen.size}`
    );
  }

  // Preserve question order in the stored answers and the review payload.
  const answers = questions.map((question) => graded.get(String(question._id)));
  const review = questions.map((question) => {
    const answer = graded.get(String(question._id));
    return {
      questionId: question._id,
      prompt: question.prompt,
      options: question.options,
      chosenOptionIndex: answer.optionIndex,
      correctOptionIndex: question.correctOptionIndex,
      isCorrect: answer.isCorrect,
    };
  });

  return {
    answers,
    review,
    score: answers.filter((answer) => answer.isCorrect).length,
    total: questions.length,
  };
};

export default gradeAnswers;
