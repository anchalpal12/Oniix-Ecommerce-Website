import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'onix_wishlist';

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isWishlisted = (id) => items.some((p) => p._id === id);

  const toggle = (product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      if (exists) return prev.filter((p) => p._id !== product._id);
      return [...prev, product];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p._id !== id));

  const value = useMemo(
    () => ({ items, count: items.length, isWishlisted, toggle, remove }),
    [items]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
