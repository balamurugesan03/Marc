import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Undergarments.module.css";

export default function Undergarments() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("undergarments");

  return (
    <>
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Men &amp; Women Undergarments</p>
          <h1 className={styles.title}>
            Pure <span className={styles.accent}>Comfort</span>
          </h1>
          <p className={styles.tagline}>Soft, breathable &amp; built for all-day wear.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Undergarments</span>
          </nav>
        </div>
      </section>

      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading undergarments...</div>
          : <ShopLayout products={products} sizeSet="adult" />}
      </div>
    </>
  );
}
