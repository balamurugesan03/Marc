import { useState } from "react";
import { Link } from "react-router-dom";
import logoImg from "../../assets/logo.jpeg";
import styles from "./Footer.module.css";

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <div className={styles.logoRow}>
            <img src={logoImg} alt="MARC" className={styles.logoImg} />
            <span className={styles.logoText}>MARC</span>
          </div>
          <p className={styles.tagline}>
            Curated fashion for the whole family — timeless style, modern comfort.
          </p>
          <div className={styles.quickInput}>
            <input
              type="email"
              className={styles.qInput}
              placeholder="Your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={styles.qBtn}>Join</button>
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Shop</div>
          <ul className={styles.colLinks}>
            <li><Link to="/men" className={styles.colLink}>Men</Link></li>
            <li><Link to="/women" className={styles.colLink}>Women</Link></li>
            <li><Link to="/kids" className={styles.colLink}>Kids</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Info</div>
          <ul className={styles.colLinks}>
            <li><Link to="/about" className={styles.colLink}>About Us</Link></li>
            <li><Link to="/contact" className={styles.colLink}>Contact</Link></li>
            <li><Link to="/size-guide" className={styles.colLink}>Size Guide</Link></li>
            <li><Link to="/returns" className={styles.colLink}>Returns</Link></li>
            <li><Link to="/shipping" className={styles.colLink}>Shipping</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Contact</div>
          <ul className={styles.colLinks}>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>📍</span>
              <span>Vellayani Jn., Nemom (P.O),<br />Trivandrum, Kerala</span>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>💬</span>
              <span>
                <a href="https://wa.me/919633633733" className={styles.colLink} target="_blank" rel="noreferrer">+91 9633 633 733</a><br />
                <a href="https://wa.me/917907858891" className={styles.colLink} target="_blank" rel="noreferrer">+91 7907 858 891</a>
              </span>
            </li>
            <li className={styles.contactItem}>
              <span className={styles.contactIcon}>✉️</span>
              <a href="mailto:marcthefamilyfashion@gmail.com" className={styles.colLink}>
                marcthefamilyfashion@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copy}>
          © 2026 <span>MARC</span> – The Family Fashion. All rights reserved.
        </p>
        <div className={styles.socials}>
          {["📸", "📘", "📌", "▶️"].map((icon, i) => (
            <button key={i} className={styles.socialBtn}>{icon}</button>
          ))}
        </div>
      </div>
      <p className={styles.crafted}>Crafted by <span>Balamurugesan</span></p>
    </footer>
  );
}
