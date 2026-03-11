import { useState } from "react";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

const FILTERS = ["All", "New", "Sale"];

export default function ProductGrid({ products, showFilters = true }) {
  const [active, setActive] = useState("All");

  const filtered = products.filter((p) => {
    if (active === "All") return true;
    if (active === "New") return p.badge === "New";
    if (active === "Sale") return p.isSale;
    return true;
  });

  return (
    <div className={styles.wrapper}>
      {showFilters && (
        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${active === f ? styles.active : ""}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {filtered.length > 0 ? (
          filtered.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <div className={styles.empty}>No products found.</div>
        )}
      </div>
    </div>
  );
}
