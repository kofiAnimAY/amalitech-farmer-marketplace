// TODO(backend): this file is the single place that will change most
// when a real backend exists. Replace `simulateRequest` with actual
// `fetch`/`axios` calls to your API base URL, and keep every service
// function's return shape the same so the rest of the app doesn't need
// to change.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Wraps mock data in a Promise that resolves after `ms` milliseconds,
 * standing in for real network latency so loading states can be built
 * and tested honestly against the mock layer.
 */
export function simulateRequest(data, ms = 650) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), ms);
  });
}

/**
 * Same idea, but rejects — for exercising error states against the
 * mock layer (e.g. wrong password, duplicate email).
 */
export function simulateFailure(message, ms = 650) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}
