import ShopLayout from "../components/ui/ShopLayout";
import { useProducts } from "../context/ProductContext";
import { Link } from "react-router-dom";
import styles from "./Wallet.module.css";

export default function Wallet() {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory("wallet");

  return (
    <>
      <section className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Shop Wallets</p>
          <h1 className={styles.title}>
            Wallets & <span className={styles.accent}>Cardholders</span>
          </h1>
          <p className={styles.tagline}>Slim, stylish & crafted to last.</p>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Wallet</span>
          </nav>
        </div>
      </section>

      <div className={styles.productsWrap}>
        {loading
          ? <div className={styles.loading}>Loading wallets...</div>
          : <ShopLayout products={products} sizeSet="free" />}
      </div>
    </>
  );
}
