// The API returns `{ error: { code, message, details } }` for every failure, so
// there is exactly one place to read a user-facing message from.
export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message || fallback;

export default getErrorMessage;
