import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Women.module.css";

export default function Women() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("women");

  return (
    <>
      {/* ── BANNER ── */}
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Shop Women</p>
          <h1 className={styles.title}>
            Women's <span className={styles.accent}>Collection</span>
          </h1>
          <p className={styles.tagline}>Elegant. Vibrant. Unapologetically you.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Women's Collection</span>
          </nav>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading women's collection...</div>
          : <ShopLayout products={products} />}
      </div>
    </>
  );
}
