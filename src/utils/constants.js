// Central place for enums/lookups used across the app.
// Keeping these in one file makes it trivial to swap for backend-driven
// taxonomy (e.g. GET /categories, GET /regions) later.

export const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains & Cereals',
  'Tubers & Roots',
  'Legumes & Nuts',
  'Herbs & Spices',
  'Poultry & Eggs',
];

export const REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Eastern',
  'Volta',
  'Oti',
  'Central',
  'Western',
  'Western North',
  'Bono',
  'Bono East',
  'Ahafo',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
];

export const UNITS = [
  'kg',
  'g',
  'crate',
  'sack',
  'bag',
  'piece',
  'dozen',
  'litre',
  'bundle',
  'carton',
];

export const AVAILABILITY = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
};

export const ORDER_STATUS = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  FULFILLED: 'Fulfilled',
};

export const ORDER_STATUS_STEPS = [
  {
    key: ORDER_STATUS.PLACED,
    label: 'Placed',
    buyerCopy: 'Your order has been sent to the farmer.',
    farmerCopy: 'Order received.',
  },
  {
    key: ORDER_STATUS.CONFIRMED,
    label: 'Confirmed',
    buyerCopy: 'The farmer has confirmed and is preparing your produce.',
    farmerCopy: 'You confirmed this order.',
  },
  {
    key: ORDER_STATUS.FULFILLED,
    label: 'Fulfilled',
    buyerCopy: 'Your order has been fulfilled. Enjoy!',
    farmerCopy: 'Marked as fulfilled.',
  },
];

export const ROLES = {
  FARMER: 'farmer',
  BUYER: 'buyer',
};

export const PRICE_RANGES = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under GH₵15', min: 0, max: 15 },
  { label: 'GH₵15 – GH₵50', min: 15, max: 50 },
  { label: 'GH₵50 – GH₵150', min: 50, max: 150 },
  { label: 'Over GH₵150', min: 150, max: Infinity },
];

export function formatCurrency(amount) {
  return `GH₵${Number(amount).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const days = Math.floor(seconds / 86400);
  if (days === 0) return 'Harvested today';
  if (days === 1) return 'Harvested yesterday';
  if (days < 7) return `Harvested ${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return 'Harvested 1 week ago';
  return `Harvested ${weeks} weeks ago`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getFirstName(fullName = '') {
  return fullName.trim().split(' ')[0] || fullName;
}

/** "Farmer Kofi" for farmers, just "Ama" for buyers — matches the app's welcome copy. */
export function getDisplayLabel(user) {
  if (!user) return '';
  const first = getFirstName(user.name);
  return user.role === 'farmer' ? `Farmer ${first}` : first;
}

export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Used right after login/register for the personalized welcome toast/header. */
export function getWelcomeMessage(user, { returning = false } = {}) {
  const label = getDisplayLabel(user);
  return returning ? `Welcome back, ${label}` : `${getTimeGreeting()}, ${label}`;
}

export function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-GH', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}
