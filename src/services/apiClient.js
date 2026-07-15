// TODO(backend): this file is the single place that will change most
// when a real backend exists. Replace `simulateRequest` with actual
// `fetch`/`axios` calls to your API base URL, and keep every service
// function's return shape the same so the rest of the app doesn't need
// to change.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const STORAGE_KEY = 'farmconnect_session';

function authHeader() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const { token } = JSON.parse(raw);
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (isJson && body && body.message) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return body;
}

export async function get(path, params = {}) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), { headers: { ...authHeader(), 'Accept': 'application/json' } });
  return handleResponse(res);
}

export async function post(path, data) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function patch(path, data) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function del(path, data) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
