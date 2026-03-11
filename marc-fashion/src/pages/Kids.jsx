import PageBanner from "../components/ui/PageBanner";
import ProductGrid from "../components/ui/ProductGrid";
import { useProducts } from "../context/ProductContext";

export default function Kids() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("kids");
  return (
    <>
      <PageBanner title="Kids'" highlight="Collection" eyebrow="Shop Kids" />
      {loading ? <div style={{ textAlign: "center", padding: 60 }}>Loading...</div> : <ProductGrid products={products} />}
    </>
  );
}
