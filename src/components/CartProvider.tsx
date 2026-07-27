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

const MAX_QTY = 10;

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  pruneNotice: string | null;
  clearPruneNotice: () => void;
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number; active?: boolean }) => boolean;
  setQty: (rugId: string, sizeId: string, qty: number) => void;
  removeItem: (rugId: string, sizeId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sa-cart-v1";

function lineTotal(item: CartItem) {
  return Math.round(item.unitPrice * item.factor * item.qty);
}

function maxAllowedQty(stock: number) {
  return Math.max(0, Math.min(stock, MAX_QTY));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [pruneNotice, setPruneNotice] = useState<string | null>(null);

  useEffect(() => {
    let loaded: CartItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as CartItem[];
    } catch {
      /* ignore */
    }

    if (!loaded.length) {
      setReady(true);
      return;
    }

    void (async () => {
      const response = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: loaded.map((i) => i.rugId) }),
      });
      const res = (await response.json()) as {
        ok: boolean;
        items: { id: string; active: boolean; stock: number; price: number; title: string }[];
      };
      if (!response.ok || !res.ok) {
        setReady(true);
        return;
      }
      const byId = new Map(res.items.map((p) => [p.id, p]));
      let removed = 0;
      let adjusted = 0;

      const next = loaded
        .map((item) => {
          const product = byId.get(item.rugId);
          if (!product || !product.active || product.stock < 1) {
            removed++;
            return null;
          }
          const cap = maxAllowedQty(product.stock);
          const qty = Math.min(item.qty, cap);
          if (qty !== item.qty) adjusted++;
          return {
            ...item,
            qty,
            stock: product.stock,
            unitPrice: product.price,
            title: product.title,
          };
        })
        .filter((i): i is CartItem => i !== null && i.qty > 0);

      setItems(next);
      if (removed > 0 || adjusted > 0) {
        if (removed > 0 && adjusted > 0) {
          setPruneNotice("برخی اقلام حذف یا به‌روز شدند");
        } else if (removed > 0) {
          setPruneNotice("برخی اقلام نامعتبر از سبد حذف شدند");
        } else {
          setPruneNotice("موجودی یا قیمت برخی اقلام به‌روز شد");
        }
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (incoming: Omit<CartItem, "qty"> & { qty?: number; active?: boolean }) => {
      if (incoming.active === false || incoming.stock < 1) {
        return false;
      }
      const qty = Math.max(1, Math.min(incoming.qty ?? 1, maxAllowedQty(incoming.stock)));
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.rugId === incoming.rugId && i.sizeId === incoming.sizeId,
        );
        if (idx >= 0) {
          const next = [...prev];
          const merged = Math.min(maxAllowedQty(incoming.stock), next[idx].qty + qty);
          next[idx] = { ...next[idx], qty: merged, stock: incoming.stock };
          return next;
        }
        return [...prev, { ...incoming, qty }];
      });
      return true;
    },
    [],
  );

  const setQty = useCallback((rugId: string, sizeId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.rugId === rugId && i.sizeId === sizeId
            ? { ...i, qty: Math.max(0, Math.min(maxAllowedQty(i.stock), qty)) }
            : i,
        )
        .filter((i) => i.qty > 0),
    );
  }, []);

  const removeItem = useCallback((rugId: string, sizeId: string) => {
    setItems((prev) => prev.filter((i) => !(i.rugId === rugId && i.sizeId === sizeId)));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const clearPruneNotice = useCallback(() => setPruneNotice(null), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + lineTotal(i), 0), [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      total,
      ready,
      pruneNotice,
      clearPruneNotice,
      addItem,
      setQty,
      removeItem,
      clear,
    }),
    [items, count, total, ready, pruneNotice, clearPruneNotice, addItem, setQty, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { lineTotal, MAX_QTY };
