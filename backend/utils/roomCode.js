import crypto from 'node:crypto';
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '../config/constants.js';

// Ambiguous characters (I, O, 0, 1) are excluded so room codes can be read aloud.
export const generateRoomCode = () =>
  Array.from(
    { length: ROOM_CODE_LENGTH },
    () => ROOM_CODE_ALPHABET[crypto.randomInt(ROOM_CODE_ALPHABET.length)]
  ).join('');

export default generateRoomCode;
