import { simulateRequest, simulateFailure } from './apiClient';
import { mockUsers, findUserByEmail, findUserById } from '../data/mockUsers';

// In-memory store standing in for a users table. Seeded from mock data,
// grows as people register during this session.
// TODO(backend): delete this entirely once real auth endpoints exist.
let usersStore = [...mockUsers];

function sanitize(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

/**
 * TODO(backend): replace with POST /auth/login { email, password }
 * returning { user, token }. Store the token the same way this stores
 * a mock session (see AuthContext).
 */
export async function loginUser({ email, password }) {
  const user = usersStore.find((u) => u.email.toLowerCase() === String(email).toLowerCase());

  if (!user) {
    return simulateFailure('No account found with that email address.');
  }
  if (user.password !== password) {
    return simulateFailure('Incorrect password. Please try again.');
  }

  return simulateRequest({ user: sanitize(user), token: `mock-token-${user.id}` });
}

/**
 * TODO(backend): replace with POST /auth/register.
 */
export async function registerUser({ name, email, password, role, region, town, farmName, buyerType, businessName }) {
  if (findUserByEmail(email) || usersStore.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return simulateFailure('An account with this email already exists.');
  }
  if (!name || !email || !password || !role) {
    return simulateFailure('Please fill in all required fields.');
  }

  const newUser = {
    id: `${role === 'farmer' ? 'f' : 'b'}${String(Date.now()).slice(-6)}`,
    role,
    name,
    email,
    password,
    phone: '',
    region: region || 'Greater Accra',
    town: town || '',
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=${
      role === 'farmer' ? 'DCEEE1' : 'FFEDC7'
    }`,
    memberSince: new Date().toISOString(),
    verified: false,
    ...(role === 'farmer'
      ? { farmName: farmName || `${name}'s Farm`, bio: '' }
      : { buyerType: buyerType || 'Household', businessName: businessName || null }),
  };

  usersStore = [...usersStore, newUser];

  return simulateRequest({ user: sanitize(newUser), token: `mock-token-${newUser.id}` });
}

/**
 * TODO(backend): replace with GET /users/:id (or /me).
 */
export async function getUserProfile(userId) {
  const user = usersStore.find((u) => u.id === userId) || findUserById(userId);
  if (!user) return simulateFailure('User not found.');
  return simulateRequest(sanitize(user));
}

/**
 * TODO(backend): replace with PATCH /users/:id.
 */
export async function updateUserProfile(userId, updates) {
  const idx = usersStore.findIndex((u) => u.id === userId);
  if (idx === -1) return simulateFailure('User not found.');
  usersStore[idx] = { ...usersStore[idx], ...updates };
  return simulateRequest(sanitize(usersStore[idx]));
}
