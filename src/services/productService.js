import { simulateRequest, simulateFailure } from './apiClient';
import { mockProducts } from '../data/mockProducts';
import { AVAILABILITY } from '../utils/constants';

// In-memory product store, seeded from mock data.
// TODO(backend): delete this entirely once real product endpoints exist —
// every function below maps 1:1 to a REST endpoint noted in its comment.

let productsStore = [...mockProducts];

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
  const { search = '', category = 'All', region = 'All', minPrice = 0, maxPrice = Infinity, farmerId } = filters;

  let results = [...productsStore];

  if (farmerId) {
    results = results.filter((p) => p.farmerId === farmerId);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }
  if (category && category !== 'All') {
    results = results.filter((p) => p.category === category);
  }
  if (region && region !== 'All') {
    results = results.filter((p) => p.region === region);
  }
  results = results.filter((p) => p.price >= minPrice && p.price <= maxPrice);

  // Newest listings first, like a real feed.
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return simulateRequest(results);
}

/**
 * TODO(backend): replace with GET /products/:id
 */
export async function getProductById(id) {
  const product = productsStore.find((p) => p.id === id);
  if (!product) return simulateFailure('This listing could not be found.');
  return simulateRequest(product);
}

/**
 * TODO(backend): replace with POST /products
 */
export async function createListing(payload, farmer) {
  if (!payload.name || !payload.price || !payload.category) {
    return simulateFailure('Please fill in all required fields.');
  }

  const newProduct = {
    id: `p${String(Date.now()).slice(-6)}`,
    name: payload.name,
    category: payload.category,
    description: payload.description || '',
    price: Number(payload.price),
    unit: payload.unit,
    quantityAvailable: Number(payload.quantityAvailable) || 0,
    region: payload.region || farmer?.region || 'Greater Accra',
    farmerId: farmer.id,
    image: payload.image,
    availability: deriveAvailability(Number(payload.quantityAvailable) || 0),
    harvestedAt: payload.harvestedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  productsStore = [newProduct, ...productsStore];
  return simulateRequest(newProduct);
}

/**
 * TODO(backend): replace with PATCH /products/:id
 */
export async function updateListing(id, updates) {
  const idx = productsStore.findIndex((p) => p.id === id);
  if (idx === -1) return simulateFailure('This listing could not be found.');

  const merged = { ...productsStore[idx], ...updates };
  if (updates.quantityAvailable !== undefined) {
    merged.quantityAvailable = Number(updates.quantityAvailable);
    merged.availability = deriveAvailability(merged.quantityAvailable);
  }
  if (updates.price !== undefined) {
    merged.price = Number(updates.price);
  }

  productsStore[idx] = merged;
  return simulateRequest(merged);
}

/**
 * TODO(backend): replace with DELETE /products/:id
 */
export async function deleteListing(id) {
  const exists = productsStore.some((p) => p.id === id);
  if (!exists) return simulateFailure('This listing could not be found.');
  productsStore = productsStore.filter((p) => p.id !== id);
  return simulateRequest({ id });
}
