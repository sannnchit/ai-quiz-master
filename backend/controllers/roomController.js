import Room from '../models/roomModel.js';
import User from '../models/userModel.js';
import {
  MAX_ROOM_CODE_ATTEMPTS,
  PASS_THRESHOLD,
  PLAYER_STATUS,
  ROOM_STATUS,
} from '../config/constants.js';
import { AppError } from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateRoomCode } from '../utils/roomCode.js';
import { publicUser } from '../utils/serializeUser.js';
import { generateQuestions } from '../services/quizGenerator.js';

/**
 * Rooms are polled every few seconds by every player, which makes this serialiser
 * security-critical: `correctOptionIndex` must never appear in a room payload.
 */
const serializeRoom = (room) => {
  const raw = typeof room.toObject === 'function' ? room.toObject() : room;

  return {
    ...raw,
    questions: (raw.questions ?? []).map((question) => ({
      id: question._id,
      prompt: question.prompt,
      options: question.options,
    })),
  };
};

const findRoom = async (roomId) => {
  const room = await Room.findOne({ roomId: roomId.toUpperCase() });
  if (!room) {
    throw new AppError(404, 'ROOM_NOT_FOUND', 'Room not found');
  }
  return room;
};

/** Retries on the unique index rather than hoping a random code never collides. */
const createRoomWithUniqueCode = async ({ settings, user }) => {
  for (let attempt = 0; attempt < MAX_ROOM_CODE_ATTEMPTS; attempt += 1) {
    try {
      return await Room.create({
        roomId: generateRoomCode(),
        creatorId: user._id,
        settings,
        players: [{ userId: user._id, username: user.username }],
      });
    } catch (error) {
      if (error?.code === 11000) continue;
      throw error;
    }
  }

  throw new AppError(503, 'ROOM_CODE_UNAVAILABLE', 'Could not allocate a room code. Please try again.');
};

export const createRoom = asyncHandler(async (req, res) => {
  const { settings } = req.validated.body;
  const room = await createRoomWithUniqueCode({ settings, user: req.user });

  res.status(201).json(serializeRoom(room));
});

export const joinRoom = asyncHandler(async (req, res) => {
  const room = await findRoom(req.validated.params.roomId);

  if (room.status !== ROOM_STATUS.WAITING) {
    throw new AppError(409, 'ROOM_ALREADY_STARTED', 'This quiz has already started');
  }

  const alreadyJoined = room.players.some((player) => player.userId.equals(req.user._id));
  if (alreadyJoined) {
    return res.json(serializeRoom(room));
  }

  room.players.push({ userId: req.user._id, username: req.user.username });
  await room.save();

  return res.json(serializeRoom(room));
});

export const getRoom = asyncHandler(async (req, res) => {
  const room = await findRoom(req.validated.params.roomId);
  res.json(serializeRoom(room));
});

export const startQuiz = asyncHandler(async (req, res) => {
  const room = await findRoom(req.validated.params.roomId);

  if (!room.creatorId.equals(req.user._id)) {
    throw new AppError(403, 'FORBIDDEN', 'Only the room creator can start the quiz');
  }
  if (room.status !== ROOM_STATUS.WAITING) {
    throw new AppError(409, 'ROOM_ALREADY_STARTED', 'This quiz has already started');
  }

  // Generated once, stored on the room, and shared by every player — the host's
  // "start" action is what defines the questions for the whole lobby.
  const questions = await generateQuestions(room.settings);
  room.questions = questions;
  room.status = ROOM_STATUS.ACTIVE;
  await room.save();

  res.json(serializeRoom(room));
});

export const submitRoomAnswers = asyncHandler(async (req, res) => {
  const { answers } = req.validated.body;
  const room = await findRoom(req.validated.params.roomId);

  if (room.status !== ROOM_STATUS.ACTIVE) {
    throw new AppError(400, 'ROOM_NOT_ACTIVE', 'This quiz is not active');
  }
  if (answers.length !== room.questions.length) {
    throw new AppError(
      400,
      'INCOMPLETE_ANSWERS',
      `Expected ${room.questions.length} answers but received ${answers.length}`
    );
  }

  const player = room.players.find((entry) => entry.userId.equals(req.user._id));
  if (!player) {
    throw new AppError(404, 'PLAYER_NOT_IN_ROOM', 'You are not a player in this room');
  }
  if (player.status === PLAYER_STATUS.FINISHED) {
    throw new AppError(409, 'ALREADY_SUBMITTED', 'You have already submitted answers for this room');
  }

  const score = answers.reduce(
    (total, optionIndex, index) =>
      optionIndex === room.questions[index].correctOptionIndex ? total + 1 : total,
    0
  );

  player.answers = answers;
  player.score = score;
  player.status = PLAYER_STATUS.FINISHED;

  const allFinished = room.players.every((entry) => entry.status === PLAYER_STATUS.FINISHED);

  if (allFinished) {
    room.status = ROOM_STATUS.FINISHED;

    // Sort a copy: the persisted player order is join order, not rank order.
    const leaderboard = [...room.players].sort((a, b) => b.score - a.score);

    await Promise.all(
      leaderboard.map(async (entry, index) => {
        const userToUpdate = await User.findById(entry.userId);
        if (!userToUpdate) return;

        const playerWon =
          entry.score > 0 && entry.score / room.questions.length >= PASS_THRESHOLD;

        userToUpdate.stats.played += 1;
        if (playerWon) userToUpdate.stats.won += 1;
        userToUpdate.history.push({
          type: 'multiplayer',
          topic: room.settings.topic,
          score: entry.score,
          total: room.questions.length,
          rank: String(index + 1),
          roomId: room.roomId,
        });
        await userToUpdate.save();
      })
    );
  }

  await room.save();

  const user = await User.findById(req.user._id);
  res.json({ user: publicUser(user) });
});
