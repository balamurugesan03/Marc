import PageBanner from "../components/ui/PageBanner";
import styles from "./Returns.module.css";

const STEPS = [
  {
    step: "01",
    icon: "📦",
    title: "Initiate Your Return",
    desc: "Contact our support team via the Contact page or email returns@marc.com within 3 days of delivery. Include your order number and reason for return.",
  },
  {
    step: "02",
    icon: "🏷️",
    title: "Pack & Label",
    desc: "Pack the item(s) securely in original packaging. Our team will email you a prepaid return label within 24 hours of approval.",
  },
  {
    step: "03",
    icon: "🚚",
    title: "Ship It Back",
    desc: "Drop the parcel at any authorised courier point. Keep your tracking number for reference — we'll notify you when we receive it.",
  },
  {
    step: "04",
    icon: "🔄",
    title: "Exchange Dispatched",
    desc: "Once the returned item is inspected and approved, your exchange item is dispatched within 2–3 business days.",
  },
];

const ELIGIBLE = [
  "Unworn and unwashed items",
  "Original tags still attached",
  "Returned within 3 days of delivery",
  "Items in original, undamaged packaging",
  "Accompanied by your order confirmation",
];

const NOT_ELIGIBLE = [
  "Items marked 'Final Sale' or purchased during clearance",
  "Swimwear, innerwear and undergarments (for hygiene reasons)",
  "Toys (non-returnable once opened)",
  "Items showing signs of wear, wash, or alteration",
  "Returns initiated after 3 days of delivery",
  "Gift cards and digital products",
];

const FAQ = [
  {
    q: "Can I exchange for a different size or colour?",
    a: "Yes. During the return initiation, select 'Exchange' and specify your preferred size or colour. Exchanges are dispatched once the original item is received.",
  },
  {
    q: "What if I received a damaged or wrong item?",
    a: "We sincerely apologise. Please contact us within 48 hours of delivery with photos. We'll arrange a priority replacement at no cost to you.",
  },
  {
    q: "Is the return shipping free?",
    a: "Returns are free for orders above ₹2,000. For orders below that threshold, a flat ₹99 return shipping fee applies.",
  },
  {
    q: "Do you offer refunds?",
    a: "We do not offer refunds. All returns are processed as exchanges only. Please choose your size and colour carefully before placing an order.",
  },
];

export default function Returns() {
  return (
    <>
      <PageBanner title="Returns &" highlight="Exchanges" eyebrow="Hassle-Free Returns" />

      <div className={styles.wrapper}>

        {/* Policy Intro */}
        <section className={styles.intro}>
          <div className={styles.introBadgeRow}>
            <div className={styles.introBadge}>3-Day Return Window</div>
            <div className={styles.noRefundBadge}>❌ No Refunds — Exchange Only</div>
            <div className={styles.noCodBadge}>🚫 COD Not Available</div>
          </div>
          <p className={styles.introText}>
            We want you to love everything you buy from MARC. If something isn't right, we offer hassle-free
            exchanges within 3 days of delivery. Please note that we do not provide refunds — all approved
            returns are processed as exchanges only. Cash on Delivery (COD) is not available on our store.
          </p>
        </section>

        {/* Steps */}
        <section className={styles.steps}>
          <div className={styles.sectionHeader}>
            <div className="section-label" style={{ marginBottom: "0.7rem" }}>How It Works</div>
            <h2 className={styles.sectionTitle}>Return in <span>4 Easy Steps</span></h2>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map((s, i) => (
              <div key={s.step} className={styles.stepCard}>
                {i < STEPS.length - 1 && <div className={styles.connector} />}
                <div className={styles.stepIcon}>{s.icon}</div>
                <div className={styles.stepNum}>{s.step}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Eligible / Not Eligible */}
        <section className={styles.eligibility}>
          <div className={styles.eligibilityGrid}>
            <div className={styles.eligibleBox}>
              <div className={styles.boxHeader}>
                <span className={styles.boxIcon}>✅</span>
                <h3 className={styles.boxTitle}>Eligible for Return</h3>
              </div>
              <ul className={styles.list}>
                {ELIGIBLE.map((item) => (
                  <li key={item} className={styles.listItem}>
                    <span className={styles.dot} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.notEligibleBox}>
              <div className={styles.boxHeader}>
                <span className={styles.boxIcon}>❌</span>
                <h3 className={styles.boxTitle}>Not Eligible for Return</h3>
              </div>
              <ul className={styles.list}>
                {NOT_ELIGIBLE.map((item) => (
                  <li key={item} className={styles.listItem}>
                    <span className={`${styles.dot} ${styles.dotRed}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.faq}>
          <div className={styles.sectionHeader}>
            <div className="section-label" style={{ marginBottom: "0.7rem" }}>Common Questions</div>
            <h2 className={styles.sectionTitle}>Return <span>FAQs</span></h2>
          </div>
          <div className={styles.faqGrid}>
            {FAQ.map((f) => (
              <div key={f.q} className={styles.faqCard}>
                <h4 className={styles.faqQ}>{f.q}</h4>
                <p className={styles.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <h3 className={styles.ctaTitle}>Ready to start a return?</h3>
          <p className={styles.ctaText}>Our support team is available Monday – Saturday, 9 AM – 6 PM.</p>
          <a href="/contact" className={styles.ctaBtn}>Contact Support</a>
        </section>

      </div>
    </>
  );
}
