import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Newsletter.module.css";

gsap.registerPlugin(ScrollTrigger);

const PERKS = [
  { icon: "✦", text: "Early access to new arrivals" },
  { icon: "✦", text: "Members-only discounts" },
  { icon: "✦", text: "Style lookbooks every season" },
  { icon: "✦", text: "No spam — unsubscribe anytime" },
];

export default function Newsletter() {
  const [email, setEmail]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef(null);
  const leftRef    = useRef(null);
  const rightRef   = useRef(null);

  useEffect(() => {
    gsap.from(leftRef.current, {
      opacity: 0, x: -50, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
    });
    gsap.from(rightRef.current, {
      opacity: 0, x: 50, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); setEmail(""); }
  };

  return (
    <section className={styles.section} ref={sectionRef}>

      {/* grid overlay */}
      <div className={styles.gridOverlay} aria-hidden />

      <div className={styles.inner}>

        {/* ─── Left ─── */}
        <div className={styles.left} ref={leftRef}>
          <div className="section-label" style={{ marginBottom: "1.2rem" }}>Stay Connected</div>

          <h2 className={styles.title}>
            Join the<br />
            <span>MARC</span><br />
            Family
          </h2>

          <div className={styles.accentLine} />

          <ul className={styles.perks}>
            {PERKS.map((p) => (
              <li key={p.text} className={styles.perkItem}>
                <span className={styles.perkIcon}>{p.icon}</span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        {/* ─── Divider ─── */}
        <div className={styles.divider} aria-hidden />

        {/* ─── Right ─── */}
        <div className={styles.right} ref={rightRef}>

          <p className={styles.desc}>
            Subscribe for exclusive offers, new arrivals, and curated style
            inspiration — delivered straight to your inbox each week.
          </p>

          {submitted ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>✓</div>
              <div>
                <div className={styles.successTitle}>You're in!</div>
                <div className={styles.successSub}>Welcome to the MARC family.</div>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputWrap}>
                <label className={styles.inputLabel} htmlFor="nl-email">Email address</label>
                <input
                  id="nl-email"
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.btn}>
                Subscribe
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor"
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          )}

          <p className={styles.note}>
            Join 10,000+ families already subscribed. No spam, ever.
          </p>
        </div>
      </div>
    </section>
  );
}
