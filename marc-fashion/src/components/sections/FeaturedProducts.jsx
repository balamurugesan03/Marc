import { useProducts } from "../../context/ProductContext";
import ProductCard from "../ui/ProductCard";
import styles from "./FeaturedProducts.module.css";

export default function FeaturedProducts() {
  const { getFeaturedProducts, loading } = useProducts();
  const products = getFeaturedProducts();

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={`section-label ${styles.label}`}>Trending Now</div>
            <h2 className={styles.title}>
              Featured <span>Styles</span>
            </h2>
          </div>
          <div className={styles.headerRight}>
            <p className={styles.subText}>
              Hand-picked pieces updated weekly. Each style is quality-checked and
              arrives in our signature packaging.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div className={styles.loading}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className={styles.empty}>No products available.</p>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </div>
    </section>
  );
}
