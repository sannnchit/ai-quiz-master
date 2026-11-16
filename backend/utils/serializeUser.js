// Single serializer for anything a client is allowed to see about a user.
// Prevents the password hash leaking through a `res.json(user)` slip.
export const publicUser = (user) => ({
  _id: user._id,
  username: user.username,
  stats: user.stats,
  history: user.history,
});

export default publicUser;
