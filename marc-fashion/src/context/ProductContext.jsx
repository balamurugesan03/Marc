import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { fetchProducts } from "../api/products";
import { products as staticProducts } from "../data/products";

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(() => {
    setLoading(true);
    fetchProducts()
      .then((data) => {
        // Normalize MongoDB _id to id for compatibility
        setProducts((data || []).map((p) => ({ ...p, id: p._id })));
        setError(null);
      })
      .catch(() => {
        // Fall back to static data when API is unavailable
        setProducts(staticProducts);
        setError("Could not connect to server");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();

    // Refetch when the user switches back to this tab (e.g. after adding a product in admin)
    const handleVisibility = () => {
      if (!document.hidden) loadProducts();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadProducts]);

  const getProductsByCategory = (cat) =>
    products.filter((p) => p.category === cat);

  const getFeaturedProducts = () => products.slice(0, 4);

  const getSaleProducts = () => products.filter((p) => p.isSale);

  const getProductById = (id) =>
    products.find((p) => p._id === id || String(p.id) === String(id));

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        refetch: loadProducts,
        getProductsByCategory,
        getFeaturedProducts,
        getSaleProducts,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
