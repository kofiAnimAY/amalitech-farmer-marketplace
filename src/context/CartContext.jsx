import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'farmconnect_cart';

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [justAddedId, setJustAddedId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, reason: 'auth-required' };
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.quantityAvailable);
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: nextQty } : i));
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          unit: product.unit,
          region: product.region,
          farmerId: product.farmerId,
          farmerName: product.farmerName,
          farmName: product.farmName,
          maxQuantity: product.quantityAvailable,
          quantity: Math.min(quantity, product.quantityAvailable),
        },
      ];
    });
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId((id) => (id === product.id ? null : id)), 1200);
    return { success: true };
  }, [isAuthenticated]);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity)) } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const { subtotal, itemCount, farmerGroups } = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const groups = new Map();
    items.forEach((i) => {
      if (!groups.has(i.farmerId)) groups.set(i.farmerId, { farmerName: i.farmerName, farmName: i.farmName, items: [] });
      groups.get(i.farmerId).items.push(i);
    });
    return { subtotal, itemCount, farmerGroups: Array.from(groups.values()) };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        farmerGroups,
        justAddedId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
