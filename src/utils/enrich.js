import { findUserById } from '../data/mockUsers';

/** Attaches farmerName/farmName/farmerVerified to a product for display purposes. */
export function withFarmerInfo(product) {
  const farmer = findUserById(product.farmerId);
  return {
    ...product,
    farmerName: farmer?.name || 'Unknown farmer',
    farmName: farmer?.farmName || '',
    farmerVerified: !!farmer?.verified,
    farmerAvatar: farmer?.avatar,
    farmerPhone: farmer?.phone,
  };
}

export function withFarmerInfoList(products) {
  return products.map(withFarmerInfo);
}
