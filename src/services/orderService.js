import { get, post, patch } from './apiClient';
import { ORDER_STATUS } from '../utils/constants';

/**
 * TODO(backend): replace with GET /orders?buyerId= or GET /orders?farmerId=
 */
export async function getOrders({ buyerId, farmerId } = {}) {
  return get('/marketplace/order', { buyerId, farmerId });
}

/**
 * TODO(backend): replace with GET /orders/:id
 */
export async function getOrderById(id) {
  return get(`/marketplace/order/${id}`);
}

/**
 * Cart items may span multiple farmers. Like most multi-vendor
 * marketplaces, checkout splits them into one order per farmer so each
 * farmer only manages their own orders.
 * TODO(backend): replace with POST /orders (server does the splitting).
 */
export async function placeOrder(payload) {
  return post('/marketplace/order', payload);
}

/**
 * TODO(backend): replace with PATCH /orders/:id/status
 */
export async function updateOrderStatus(orderId, status) {
  return patch(`/marketplace/order/${orderId}/status`, { status });
}
