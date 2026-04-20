const TOKEN_STORAGE_KEY = 'studysathi_token';
const USER_STORAGE_KEY = 'studysathi_user';

export const readStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (_error) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const saveAuthSession = (authPayload) => {
  if (authPayload?.token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, authPayload.token);
  }

  if (authPayload?.user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authPayload.user));
    return authPayload.user;
  }

  return null;
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};
