import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const STORAGE_KEY = "sparemec_wishlist_v1";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const toggleWishlist = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.slug === product.slug);
      if (exists) {
        return prev.filter((i) => i.slug !== product.slug);
      } else {
        return [
          ...prev,
          {
            slug: product.slug,
            name: product.name,
            partNumber: product.partNumber,
            brand: product.brand,
            imageKey: product.imageKey,
          },
        ];
      }
    });
  }, []);

  const hasWishlist = useCallback(
    (slug) => items.some((i) => i.slug === slug),
    [items]
  );

  const wishlistCount = useMemo(() => items.length, [items]);

  const value = useMemo(
    () => ({
      wishlistItems: items,
      wishlistCount,
      toggleWishlist,
      hasWishlist,
    }),
    [items, wishlistCount, toggleWishlist, hasWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};

export default WishlistContext;
