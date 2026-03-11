import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./ShawlHijab.module.css";

export default function ShawlHijab() {
  const { products, loading } = useProducts();
  const items = products.filter(
    (p) => p.category === "shawl" || p.category === "hijab"
  );

  return (
    <>
      {/* ── BANNER ── */}
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Shop Shawl &amp; Hijab</p>
          <h1 className={styles.title}>
            Shawl &amp; <span className={styles.accent}>Hijab</span>
          </h1>
          <p className={styles.tagline}>Elegant. Modest. Beautifully crafted.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Shawl &amp; Hijab</span>
          </nav>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading shawl &amp; hijab collection...</div>
          : <ShopLayout products={items} sizeSet="free" />}
      </div>
    </>
  );
}
