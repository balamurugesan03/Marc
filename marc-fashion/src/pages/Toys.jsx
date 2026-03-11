import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Toys.module.css";

export default function Toys() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("toys");

  return (
    <>
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Shop Toys</p>
          <h1 className={styles.title}>
            Toys & <span className={styles.accent}>Play</span>
          </h1>
          <p className={styles.tagline}>Fun, learning & endless adventures.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Toys</span>
          </nav>
        </div>
      </section>

      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading toys...</div>
          : <ShopLayout products={products} sizeSet="toys" />}
      </div>
    </>
  );
}
