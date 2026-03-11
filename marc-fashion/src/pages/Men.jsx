import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Men.module.css";

export default function Men() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("men");

  return (
    <>
      {/* ── BANNER ── */}
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Shop Men</p>
          <h1 className={styles.title}>
            Men's <span className={styles.accent}>Collection</span>
          </h1>
          <p className={styles.tagline}>Refined. Bold. Effortlessly stylish.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Men's Collection</span>
          </nav>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading men's collection...</div>
          : <ShopLayout products={products} />}
      </div>
    </>
  );
}
