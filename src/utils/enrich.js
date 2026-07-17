import { get } from '../services/apiClient';

async function fetchFarmer(farmerId) {
  try {
    return await get(`/register/profile/${farmerId}`);
  } catch {
    return null;
  }
}

/** Attaches farmerName/farmName/farmerVerified to a product for display purposes. */
export async function withFarmerInfo(product) {
  const farmer = await fetchFarmer(product.farmerId);
  return {
    ...product,
    farmerName: farmer?.name || 'Unknown farmer',
    farmName: farmer?.farmName || '',
    farmerVerified: !!farmer?.verified,
    farmerAvatar: farmer?.avatar,
    farmerPhone: farmer?.phone,
  };
}

export async function withFarmerInfoList(products) {
  return Promise.all(products.map(withFarmerInfo));
}
