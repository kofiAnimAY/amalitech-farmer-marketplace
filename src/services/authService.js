import { get, post, patch } from './apiClient';

export async function loginUser({ email, password }) {
  return post('/register/login', { email, password });
}

export async function registerUser(payload) {
  return post('/register/register', payload);
}

export async function getUserProfile(userId) {
  return get(`/register/profile/${userId}`);
}

export async function updateUserProfile(userId, updates) {
  return patch(`/register/profile/${userId}`, updates);
}
