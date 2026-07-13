import { simulateRequest, simulateFailure } from './apiClient';
import { mockOrders } from '../data/mockOrders';
import { ORDER_STATUS } from '../utils/constants';

// In-memory order store, seeded from mock data.
// TODO(backend): delete this entirely once real order endpoints exist.
let ordersStore = [...mockOrders];
let orderSeq = 1048;

/**
 * TODO(backend): replace with GET /orders?buyerId= or GET /orders?farmerId=
 */
export async function getOrders({ buyerId, farmerId } = {}) {
  let results = [...ordersStore];
  if (buyerId) results = results.filter((o) => o.buyerId === buyerId);
  if (farmerId) results = results.filter((o) => o.farmerId === farmerId);
  results.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  return simulateRequest(results);
}

/**
 * TODO(backend): replace with GET /orders/:id
 */
export async function getOrderById(id) {
  const order = ordersStore.find((o) => o.id === id);
  if (!order) return simulateFailure('Order not found.');
  return simulateRequest(order);
}

/**
 * Cart items may span multiple farmers. Like most multi-vendor
 * marketplaces, checkout splits them into one order per farmer so each
 * farmer only manages their own orders.
 * TODO(backend): replace with POST /orders (server does the splitting).
 */
export async function placeOrder({ buyer, cartItems, delivery, paymentMethod }) {
  if (!cartItems?.length) {
    return simulateFailure('Your cart is empty.');
  }

  const byFarmer = new Map();
  for (const item of cartItems) {
    if (!byFarmer.has(item.farmerId)) byFarmer.set(item.farmerId, []);
    byFarmer.get(item.farmerId).push(item);
  }

  const now = new Date().toISOString();
  const newOrders = [];

  for (const [farmerId, items] of byFarmer.entries()) {
    orderSeq += 1;
    const order = {
      id: `ORD-${orderSeq}`,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerBusiness: buyer.businessName || null,
      farmerId,
      farmerName: items[0].farmerName,
      farmName: items[0].farmName,
      items: items.map((i) => ({
        productId: i.id,
        name: i.name,
        image: i.image,
        price: i.price,
        unit: i.unit,
        quantity: i.quantity,
      })),
      deliveryFee: delivery.fee ?? 15,
      deliveryRegion: delivery.region,
      deliveryTown: delivery.town,
      deliveryAddress: delivery.address,
      deliveryNotes: delivery.notes || '',
      paymentMethod,
      status: ORDER_STATUS.PLACED,
      statusHistory: [{ status: ORDER_STATUS.PLACED, at: now }],
      placedAt: now,
    };
    newOrders.push(order);
  }

  ordersStore = [...newOrders, ...ordersStore];
  return simulateRequest(newOrders, 900);
}

/**
 * TODO(backend): replace with PATCH /orders/:id/status
 */
export async function updateOrderStatus(orderId, status) {
  const idx = ordersStore.findIndex((o) => o.id === orderId);
  if (idx === -1) return simulateFailure('Order not found.');

  const order = ordersStore[idx];
  const allowedTransitions = {
    [ORDER_STATUS.PLACED]: [ORDER_STATUS.CONFIRMED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.FULFILLED],
    [ORDER_STATUS.FULFILLED]: [],
  };

  if (status !== order.status && !allowedTransitions[order.status]?.includes(status)) {
    return simulateFailure(`This order cannot move from ${order.status} to ${status}.`);
  }

  const updated = {
    ...order,
    status,
    statusHistory: [...order.statusHistory, { status, at: new Date().toISOString() }],
  };
  ordersStore[idx] = updated;
  return simulateRequest(updated);
}
