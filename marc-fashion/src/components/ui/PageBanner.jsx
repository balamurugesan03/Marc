import { Link } from "react-router-dom";
import styles from "./PageBanner.module.css";

export default function PageBanner({ title, highlight, eyebrow = "MARC Fashion" }) {
  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h1 className={styles.title}>
          {title} {highlight && <span>{highlight}</span>}
        </h1>
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>›</span>
          <span>{title}{highlight ? " " + highlight : ""}</span>
        </div>
      </div>
    </div>
  );
}
