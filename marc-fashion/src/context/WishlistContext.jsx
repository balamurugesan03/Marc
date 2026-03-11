import { createContext, useContext, useState, useCallback } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      return exists ? prev.filter((i) => i.id !== product.id) : [...prev, product];
    });
  }, []);

  const isWishlisted = useCallback(
    (id) => wishlist.some((i) => i.id === id),
    [wishlist]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
