import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Boys.module.css";

export default function Boys() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("boys");

  return (
    <>
      {/* ── BANNER ── */}
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Shop Boys</p>
          <h1 className={styles.title}>
            Boys' <span className={styles.accent}>Collection</span>
          </h1>
          <p className={styles.tagline}>Bold. Free. Ready for anything.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Boys' Collection</span>
          </nav>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading boys collection...</div>
          : <ShopLayout products={products} sizeSet="kids" />}
      </div>
    </>
  );
}
