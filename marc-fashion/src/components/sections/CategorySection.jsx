import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./CategorySection.module.css";
import menImg from "../../assets/men.jpeg";
import womenImg from "../../assets/women.jpeg";
import kidsImg from "../../assets/kids.jpeg";

gsap.registerPlugin(ScrollTrigger);

const TOP_CATS = [
  { label: "Men",   sub: "Sharp & Timeless", count: "180+ Styles", path: "/men",   img: menImg   },
  { label: "Women", sub: "Elegant & Bold",   count: "220+ Styles", path: "/women", img: womenImg },
];

const BOTTOM_CATS = [
  { label: "Boys",     sub: "Bold & Active",    count: "60+ Styles",  path: "/boys",     img: kidsImg, tint: "rgba(30,58,138,0.55)"   },
  { label: "Girls",    sub: "Pretty & Playful",  count: "60+ Styles",  path: "/girls",    img: kidsImg, tint: "rgba(131,24,67,0.55)"    },
  { label: "Footwear", sub: "Shoes & Chappals", count: "40+ Styles",  path: "/footwear", img: null,    tint: "rgba(58,42,18,0.7)"      },
];

export default function CategorySection() {
  const headRef  = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.from(headRef.current, {
      opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: headRef.current, start: "top 85%" },
    });

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.from(card, {
        opacity: 0, y: 80, duration: 0.9, delay: i * 0.12, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 90%" },
      });
    });
  }, []);

  const allCats = [...TOP_CATS, ...BOTTOM_CATS];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>

        <div className={styles.header} ref={headRef}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: "0.9rem" }}>
            Shop by Category
          </div>
          <h2 className={styles.title}>
            Style for <span>Every Age</span>
          </h2>
        </div>

        {/* Row 1: Men & Women (tall) */}
        <div className={styles.grid}>
          {TOP_CATS.map((c, i) => (
            <Link
              to={c.path}
              key={c.path}
              className={styles.card}
              ref={(el) => (cardsRef.current[i] = el)}
            >
              <div className={styles.imgWrap}>
                <img src={c.img} alt={c.label} className={styles.img} />
              </div>
              <div className={styles.overlay} />
              <div className={styles.hoverBorder} />
              <div className={styles.topLabel}>{c.count}</div>
              <div className={styles.content}>
                <div className={styles.subLabel}>{c.sub}</div>
                <div className={styles.cardTitle}>{c.label}</div>
                <div className={styles.cta}>
                  <span>Shop Now</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Row 2: Boys, Girls, Footwear (shorter) */}
        <div className={styles.gridBottom}>
          {BOTTOM_CATS.map((c, i) => (
            <Link
              to={c.path}
              key={c.path}
              className={`${styles.card} ${styles.cardShort}`}
              ref={(el) => (cardsRef.current[TOP_CATS.length + i] = el)}
            >
              <div className={styles.imgWrap}>
                {c.img ? (
                  <img src={c.img} alt={c.label} className={styles.img} />
                ) : (
                  <div className={styles.footwearBg}>
                    <span className={styles.footwearEmoji}>👟</span>
                  </div>
                )}
                {/* tint overlay for colour differentiation */}
                <div className={styles.tintOverlay} style={{ background: c.tint }} />
              </div>
              <div className={styles.overlay} />
              <div className={styles.hoverBorder} />
              <div className={styles.topLabel}>{c.count}</div>
              <div className={styles.content}>
                <div className={styles.subLabel}>{c.sub}</div>
                <div className={styles.cardTitle}>{c.label}</div>
                <div className={styles.cta}>
                  <span>Shop Now</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* bottom strip */}
        <div className={styles.strip}>
          {["01 — Men", "02 — Women", "03 — Boys", "04 — Girls", "05 — Footwear"].map((t) => (
            <span key={t} className={styles.stripItem}>{t}</span>
          ))}
        </div>

      </div>
    </section>
  );
}
