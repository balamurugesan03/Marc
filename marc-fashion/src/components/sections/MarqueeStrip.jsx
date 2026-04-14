import styles from "./MarqueeStrip.module.css";

const ROW1 = [
  "Free Shipping Over ₹1,500",
  "New Arrivals Weekly",
  "Premium Quality Fabrics",
  "Easy 3-Day Returns",
  "Curated Family Collections",
  "Exclusive Member Offers",
];

const ROW2 = [
  "Handcrafted with Care",
  "Men · Women · Kids",
  "Secure Payments",
  "Pan-India Delivery",
  "Up to 50% Off in Sale",
  "Sustainable Fashion",
];

export default function MarqueeStrip() {
  const r1 = [...ROW1, ...ROW1];
  const r2 = [...ROW2, ...ROW2];

  return (
    <div className={styles.strip}>
      {/* Row 1 — left to right */}
      <div className={styles.row}>
        <div className={styles.track}>
          {r1.map((item, i) => (
            <span key={i} className={styles.item}>
              {item}
              <span className={styles.sep} aria-hidden>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 — right to left */}
      <div className={styles.row}>
        <div className={`${styles.track} ${styles.reverse}`}>
          {r2.map((item, i) => (
            <span key={i} className={`${styles.item} ${styles.itemGold}`}>
              {item}
              <span className={styles.sep} aria-hidden>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
