import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import styles from "./ShopLayout.module.css";

const ADULT_SIZES    = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL"];
const KIDS_SIZES     = ["2–3Y", "4–5Y", "6–7Y", "8–9Y", "10–11Y"];
const FOOTWEAR_SIZES = ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
const TOY_SIZES      = ["3–5Y", "5–8Y", "8–12Y", "12Y+", "All Ages"];
const FREE_SIZES     = ["Free Size"];

const SORT_OPTIONS = [
  { label: "Newest",            value: "newest"     },
  { label: "Price: Low → High", value: "price_asc"  },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated",         value: "rating"     },
];

const PRICE_RANGES = [
  { label: "All Prices",     min: 0,    max: Infinity },
  { label: "Under ₹500",    min: 0,    max: 500      },
  { label: "₹500 – ₹1,000", min: 500,  max: 1000     },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000   },
  { label: "Above ₹2,000",  min: 2000, max: Infinity },
];

const BADGES = ["All", "New", "Sale"];

export default function ShopLayout({ products = [], sizeSet = "adult" }) {
  const SIZES =
    sizeSet === "kids"     ? KIDS_SIZES     :
    sizeSet === "footwear" ? FOOTWEAR_SIZES :
    sizeSet === "toys"     ? TOY_SIZES      :
    sizeSet === "free"     ? FREE_SIZES     :
    ADULT_SIZES;
  const [sort,       setSort]       = useState("newest");
  const [badge,      setBadge]      = useState("All");
  const [sizes,      setSizes]      = useState([]);
  const [priceIdx,   setPriceIdx]   = useState(0);

  const toggleSize = (s) =>
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const clearAll = () => {
    setSort("newest");
    setBadge("All");
    setSizes([]);
    setPriceIdx(0);
  };

  const hasFilters =
    sort !== "newest" || badge !== "All" || sizes.length > 0 || priceIdx !== 0;

  const filtered = useMemo(() => {
    let list = [...products];

    if (badge === "New")  list = list.filter((p) => p.badge === "New");
    if (badge === "Sale") list = list.filter((p) => p.isSale);

    if (sizes.length > 0)
      list = list.filter((p) => sizes.some((s) => p.sizes?.includes(s)));

    const { min, max } = PRICE_RANGES[priceIdx];
    list = list.filter((p) => p.price >= min && p.price < max);

    if (sort === "price_asc")  list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating")     list.sort((a, b) => b.rating - a.rating);

    return list;
  }, [products, badge, sizes, priceIdx, sort]);

  return (
    <div className={styles.layout}>

      {/* ── STICKY FILTER SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sideHead}>
          <span className={styles.sideTitle}>Filters</span>
          {hasFilters && (
            <button className={styles.clearBtn} onClick={clearAll}>
              Clear All
            </button>
          )}
        </div>

        {/* Sort */}
        <div className={styles.section}>
          <div className={styles.secLabel}>Sort By</div>
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className={styles.radioRow}>
              <input
                type="radio"
                name="sort"
                checked={sort === opt.value}
                onChange={() => setSort(opt.value)}
                className={styles.radio}
              />
              {opt.label}
            </label>
          ))}
        </div>

        {/* Badge */}
        <div className={styles.section}>
          <div className={styles.secLabel}>Collection</div>
          {BADGES.map((b) => (
            <label key={b} className={styles.radioRow}>
              <input
                type="radio"
                name="badge"
                checked={badge === b}
                onChange={() => setBadge(b)}
                className={styles.radio}
              />
              {b}
            </label>
          ))}
        </div>

        {/* Size */}
        <div className={styles.section}>
          <div className={styles.secLabel}>Size</div>
          <div className={styles.sizeGrid}>
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`${styles.sizeBtn} ${sizes.includes(s) ? styles.sizeBtnOn : ""}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className={styles.section}>
          <div className={styles.secLabel}>Price Range</div>
          {PRICE_RANGES.map((r, i) => (
            <label key={r.label} className={styles.radioRow}>
              <input
                type="radio"
                name="price"
                checked={priceIdx === i}
                onChange={() => setPriceIdx(i)}
                className={styles.radio}
              />
              {r.label}
            </label>
          ))}
        </div>
      </aside>

      {/* ── PRODUCTS AREA ── */}
      <div className={styles.main}>
        <div className={styles.resultsBar}>
          <span className={styles.resultCount}>
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </span>
          {hasFilters && (
            <button className={styles.clearBtnSm} onClick={clearAll}>
              ✕ Clear Filters
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
            <p className={styles.emptyText}>No products match your filters.</p>
            <button className={styles.emptyReset} onClick={clearAll}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
