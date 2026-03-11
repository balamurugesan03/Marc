import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Innerwear.module.css";

export default function Innerwear() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("innerwear");

  return (
    <>
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Innerwear</p>
          <h1 className={styles.title}>
            Comfort <span className={styles.accent}>Essentials</span>
          </h1>
          <p className={styles.tagline}>Soft, breathable & built for all-day comfort.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Innerwear</span>
          </nav>
        </div>
      </section>

      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading innerwear...</div>
          : <ShopLayout products={products} sizeSet="adult" />}
      </div>
    </>
  );
}
