// Authentication utilities for FillNWin Admin with backend integration

const AUTH_TOKEN_KEY = 'fillnwin_auth_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Login with backend API
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store JWT token
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || 'Login failed' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Connection error' };
  }
};

// Logout - Fixed to return success status
export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  return { success: true };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return !!token;
};

// Verify token with backend
export const verifyToken = async () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return { valid: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { valid: true, user: data.user };
    }

    // Token is invalid, remove it
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return { valid: false };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
};

// Get current auth token
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};
