import { get, post, patch, del } from './apiClient';
import { AVAILABILITY } from '../utils/constants';

function deriveAvailability(quantityAvailable) {
  if (quantityAvailable <= 0) return AVAILABILITY.OUT_OF_STOCK;
  if (quantityAvailable <= 10) return AVAILABILITY.LOW_STOCK;
  return AVAILABILITY.IN_STOCK;
}

/**
 * TODO(backend): replace with GET /products?search=&category=&region=&minPrice=&maxPrice=
 * Filtering happens server-side in production; this mock filters in-memory
 * so the Marketplace page's filter UI can be built and tested honestly now.
 */
export async function getProducts(filters = {}) {
  return get('/marketplace/listings', filters);
}

/**
 * TODO(backend): replace with GET /products/:id
 */
export async function getProductById(id) {
  return get(`/marketplace/listings/${id}`);
}

/**
 * TODO(backend): replace with POST /products
 */
export async function createListing(payload) {
  const normalized = {
    item_name: payload.item_name || '',
    description: payload.description || '',
    price: Number(payload.price),
    quantity: Number(payload.quantity ?? 0),
    region: payload.region || '',
    category: payload.category || '',
    unit: payload.unit || '',
    harvest_date: payload.harvest_date || '',
  };
  return post('/marketplace/listings', normalized);
}

/**
 * TODO(backend): replace with PATCH /products/:id
 */
export async function updateListing(id, updates) {
  return patch('/marketplace/listings', { listing_id: id, ...updates });
}

/**
 * TODO(backend): replace with DELETE /products/:id
 */
export async function deleteListing(id) {
  return del('/marketplace/listings', { listing_id: id });
}
