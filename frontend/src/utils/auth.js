// Simple authentication utilities for FillNWin Admin

const AUTH_KEY = 'fillnwin_auth';
const CREDENTIALS = {
  username: 'admin',
  password: 'fillnwin2025'
};

export const login = (username, password) => {
  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    localStorage.setItem(AUTH_KEY, 'true');
    return { success: true };
  }
  return { success: false, error: 'Invalid credentials' };
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = () => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};
