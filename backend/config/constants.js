// Central place for tunable behaviour. Anything that used to be a magic number
// in a controller lives here so it can be changed (and reviewed) in one spot.

export const PASS_THRESHOLD = 0.5;

export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 20;
export const MAX_TOPIC_LENGTH = 120;
export const ANSWER_OPTION_COUNT = 4;

export const ROOM_CODE_LENGTH = 6;
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const MAX_ROOM_CODE_ATTEMPTS = 5;

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const ROOM_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  FINISHED: 'finished',
};

export const PLAYER_STATUS = {
  JOINED: 'joined',
  FINISHED: 'finished',
};

export const AI_MODEL = 'gemini-2.5-flash';
export const AI_TEMPERATURE = 0.7;

export const JSON_BODY_LIMIT = '100kb';
