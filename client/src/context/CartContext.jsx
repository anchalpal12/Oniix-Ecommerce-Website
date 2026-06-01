import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'onix_cart';

function itemKey(item) {
  return item._id || item.id;
}

export function CartProvider({ children }) {
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

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const key = itemKey(product);
      const idx = prev.findIndex((i) => itemKey(i) === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: (next[idx].quantity || 1) + quantity };
        return next;
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0);
  const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clearCart, total, count }),
    [items, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
