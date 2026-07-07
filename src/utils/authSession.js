import axios from 'axios';

const API_BASE_URL = 'https://backendaab.in/aabuilderDash/api';
const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';
const SESSION_CHECK_INTERVAL_MS = 60 * 60 * 1000; // check every hour

let logoutHandler = null;
let interceptorRegistered = false;
let sessionCheckIntervalId = null;

export function registerLogoutHandler(handler) {
  logoutHandler = handler;
}

export function clearAuthSession() {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  delete axios.defaults.headers.common.Authorization;
}

function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getJwtExpirationMs(token) {
  const payload = parseJwtPayload(token);
  return payload?.exp ? payload.exp * 1000 : null;
}

export function isJwtExpired(token) {
  const expirationMs = getJwtExpirationMs(token);
  if (!expirationMs) {
    return false;
  }
  return Date.now() >= expirationMs;
}

function triggerAutoLogout(message = SESSION_EXPIRED_MESSAGE) {
  stopSessionExpiryWatch();
  clearAuthSession();
  if (logoutHandler) {
    logoutHandler(message);
  }
}

function isPublicAuthRequest(url = '') {
  return /\/auth\/(login|register|forgot-password|resend-otp|validate-token)/.test(url);
}

export function setupAxiosAuthInterceptor() {
  if (interceptorRegistered) {
    return;
  }
  interceptorRegistered = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && !isPublicAuthRequest(error.config?.url)) {
        triggerAutoLogout();
      }
      return Promise.reject(error);
    }
  );
}

export async function validateStoredSession(isCancelled = () => false) {
  const token = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('user');

  if (isCancelled()) {
    return { valid: false };
  }

  if (!storedUser) {
    if (token) {
      clearAuthSession();
    }
    return { valid: false };
  }

  if (!token) {
    if (!isCancelled()) {
      clearAuthSession();
    }
    return { valid: false, message: SESSION_EXPIRED_MESSAGE };
  }

  if (isJwtExpired(token)) {
    if (!isCancelled()) {
      clearAuthSession();
    }
    return { valid: false, message: SESSION_EXPIRED_MESSAGE };
  }

  axios.defaults.headers.common.Authorization = `Bearer ${token}`;

  try {
    await axios.post(`${API_BASE_URL}/auth/validate-token`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (isCancelled()) {
      return { valid: false };
    }
    return { valid: true, user: JSON.parse(storedUser) };
  } catch {
    const currentToken = localStorage.getItem('authToken');
    if (isCancelled() || currentToken !== token) {
      return { valid: false };
    }
    clearAuthSession();
    return { valid: false, message: SESSION_EXPIRED_MESSAGE };
  }
}

function checkSessionExpiry() {
  const token = localStorage.getItem('authToken');
  if (!token || !localStorage.getItem('user')) {
    return;
  }
  if (isJwtExpired(token)) {
    triggerAutoLogout();
  }
}

export function stopSessionExpiryWatch() {
  if (sessionCheckIntervalId) {
    window.clearInterval(sessionCheckIntervalId);
    sessionCheckIntervalId = null;
  }
}

export function startSessionExpiryWatch() {
  stopSessionExpiryWatch();
  checkSessionExpiry();
  sessionCheckIntervalId = window.setInterval(checkSessionExpiry, SESSION_CHECK_INTERVAL_MS);
}
