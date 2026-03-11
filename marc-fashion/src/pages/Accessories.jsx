import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Accessories.module.css";

export default function Accessories() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("accessories");

  return (
    <>
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Shop Accessories</p>
          <h1 className={styles.title}>
            Accessories <span className={styles.accent}>Collection</span>
          </h1>
          <p className={styles.tagline}>The finishing touch to every outfit.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Accessories</span>
          </nav>
        </div>
      </section>

      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading accessories...</div>
          : <ShopLayout products={products} sizeSet="free" />}
      </div>
    </>
  );
}
