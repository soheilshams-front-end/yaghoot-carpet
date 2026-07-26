"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  rugId: string;
  title: string;
  image: string;
  code: string;
  unitPrice: number;
  sizeId: string;
  sizeLabel: string;
  factor: number;
  qty: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  setQty: (rugId: string, sizeId: string, qty: number) => void;
  removeItem: (rugId: string, sizeId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sa-cart-v1";

function lineTotal(item: CartItem) {
  return Math.round(item.unitPrice * item.factor * item.qty);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((incoming: Omit<CartItem, "qty"> & { qty?: number }) => {
    const qty = Math.max(1, incoming.qty ?? 1);
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.rugId === incoming.rugId && i.sizeId === incoming.sizeId,
      );
      if (idx >= 0) {
        const next = [...prev];
        const merged = Math.min(incoming.stock, next[idx].qty + qty);
        next[idx] = { ...next[idx], qty: merged, stock: incoming.stock };
        return next;
      }
      return [...prev, { ...incoming, qty: Math.min(incoming.stock, qty) }];
    });
  }, []);

  const setQty = useCallback((rugId: string, sizeId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.rugId === rugId && i.sizeId === sizeId
            ? { ...i, qty: Math.max(0, Math.min(i.stock, qty)) }
            : i,
        )
        .filter((i) => i.qty > 0),
    );
  }, []);

  const removeItem = useCallback((rugId: string, sizeId: string) => {
    setItems((prev) => prev.filter((i) => !(i.rugId === rugId && i.sizeId === sizeId)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + lineTotal(i), 0), [items]);

  const value = useMemo(
    () => ({ items, count, total, addItem, setQty, removeItem, clear }),
    [items, count, total, addItem, setQty, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { lineTotal };
