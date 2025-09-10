export const AUTH_KEY = 'mindful_user';
export const TOKEN_KEY = 'mindful_google_id_token';

export function getUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  if (user?.id) {
    localStorage.setItem('mindful_user_id', user.id);
  }
}

export function setToken(idToken) {
  if (idToken) localStorage.setItem(TOKEN_KEY, idToken);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function clearUser() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getUser() || !!getToken();
}

export function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
