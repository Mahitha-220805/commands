/**
 * Frontend auth helpers – JWT in localStorage.
 * Run the backend (npm start in backend/) and serve this folder (e.g. Live Server) so API calls work.
 */
const API_BASE = 'http://localhost:3307/api';

function getToken() {
  return localStorage.getItem('wallet_token') || '';
}

function setToken(token) {
  if (token) localStorage.setItem('wallet_token', token);
}

function clearToken() {
  localStorage.removeItem('wallet_token');
}

function isLoggedIn() {
  return !!getToken();
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}
