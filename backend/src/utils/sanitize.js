export const sanitizeUser = (user) => {
  if (!user) return user;

  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const sanitizeUsers = (users) => {
  if (!Array.isArray(users)) return users;
  return users.map(sanitizeUser);
};
