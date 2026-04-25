const ACCESS_TOKEN_KEY = 'slp.accessToken';
const USERNAME_KEY = 'slp.username';
const ADMIN_USERNAMES = new Set(['ayush', 'rajesh']);

export const ACCESS_DENIED_MESSAGE = 'You do not have access to this functionality.';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY) ?? '';
}

export function setUsername(username: string) {
  localStorage.setItem(USERNAME_KEY, username.trim());
}

export function isAdminUser() {
  return ADMIN_USERNAMES.has(getUsername().trim().toLowerCase());
}
