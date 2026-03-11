import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Footwear.module.css";

export default function Footwear() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("footwear");

  return (
    <>
      {/* ── BANNER ── */}
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Shoes & Chappals</p>
          <h1 className={styles.title}>
            Step in <span className={styles.accent}>Style</span>
          </h1>
          <p className={styles.tagline}>Every stride, every style — find your perfect pair.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Footwear</span>
          </nav>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading footwear collection...</div>
          : <ShopLayout products={products} sizeSet="footwear" />}
      </div>
    </>
  );
}
