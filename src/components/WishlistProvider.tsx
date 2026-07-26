"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Rug } from "@/data/rugs";

export type WishItem = Pick<
  Rug,
  "id" | "title" | "image" | "code" | "price" | "collection" | "shaneh" | "stock" | "description"
>;

type WishlistContextValue = {
  items: WishItem[];
  count: number;
  has: (id: string) => boolean;
  toggle: (rug: WishItem) => boolean;
  remove: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "sa-wishlist-v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as WishItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback(
    (rug: WishItem) => {
      const exists = items.some((i) => i.id === rug.id);
      if (exists) {
        setItems((prev) => prev.filter((i) => i.id !== rug.id));
        return false;
      }
      setItems((prev) => [rug, ...prev.filter((i) => i.id !== rug.id)]);
      return true;
    },
    [items],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      has,
      toggle,
      remove,
      clear,
    }),
    [items, has, toggle, remove, clear],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
