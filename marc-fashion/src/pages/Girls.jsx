import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Girls.module.css";

export default function Girls() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("girls");

  return (
    <>
      {/* ── BANNER ── */}
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Shop Girls</p>
          <h1 className={styles.title}>
            Girls' <span className={styles.accent}>Collection</span>
          </h1>
          <p className={styles.tagline}>Pretty. Playful. Perfectly styled.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Girls' Collection</span>
          </nav>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading girls collection...</div>
          : <ShopLayout products={products} sizeSet="kids" />}
      </div>
    </>
  );
}
