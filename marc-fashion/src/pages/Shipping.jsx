import PageBanner from "../components/ui/PageBanner";
import styles from "./Shipping.module.css";

const SHIPPING_OPTIONS = [
  {
    icon: "📦",
    name: "Standard Delivery",
    time: "5–7 Business Days",
    cost: "₹99",
    free: "Free on orders above ₹1,500",
    desc: "Our most popular option — reliable delivery to all major cities and tier-2 towns across India.",
  },
  {
    icon: "⚡",
    name: "Express Delivery",
    time: "2–3 Business Days",
    cost: "₹199",
    free: "Free on orders above ₹3,000",
    desc: "Prioritised handling and dispatch — ideal when you need it fast without paying for overnight.",
    highlight: true,
  },
  {
    icon: "🌙",
    name: "Next-Day Delivery",
    time: "1 Business Day",
    cost: "₹349",
    free: "Available in select cities",
    desc: "Order before 12 PM and receive your parcel the very next business day. Currently available in Mumbai, Delhi, Bengaluru, Hyderabad, and Chennai.",
  },
];

const ZONES = [
  { zone: "Metro Cities", cities: "Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata", standard: "3–4 days", express: "1–2 days" },
  { zone: "Tier-2 Cities", cities: "Pune, Ahmedabad, Jaipur, Lucknow, Surat, Nagpur", standard: "4–5 days", express: "2–3 days" },
  { zone: "Tier-3 & Towns", cities: "Remaining pincodes across India", standard: "5–7 days", express: "3–4 days" },
  { zone: "Remote Areas", cities: "North-East, hill stations, island territories", standard: "7–10 days", express: "Not available" },
];

const INFO_CARDS = [
  {
    icon: "🔍",
    title: "Order Tracking",
    desc: "A tracking link is emailed to you as soon as your order is dispatched. You can also track directly on the courier's website using the AWB number provided.",
  },
  {
    icon: "📅",
    title: "Cut-off Times",
    desc: "Orders placed before 2 PM (IST) on business days are dispatched the same day. Orders after 2 PM or on weekends are dispatched the next business day.",
  },
  {
    icon: "🏖️",
    title: "Holidays & Delays",
    desc: "Delivery timelines exclude public holidays and Sundays. During peak sale events (e.g., festive season), please allow 1–2 extra days.",
  },
  {
    icon: "📍",
    title: "Delivery Attempts",
    desc: "Our courier will attempt delivery up to 3 times. After 3 failed attempts, the parcel is returned to us and we will reach out to rearrange.",
  },
];

export default function Shipping() {
  return (
    <>
      <PageBanner title="Shipping" highlight="Policy" eyebrow="Fast & Reliable Delivery" />

      <div className={styles.wrapper}>

        {/* Intro */}
        <section className={styles.intro}>
          <p className={styles.introText}>
            We partner with India's leading courier networks to ensure your MARC order arrives safely and on time.
            All orders are quality-checked, securely packaged, and dispatched within <strong>24 hours</strong> of confirmation.
          </p>
        </section>

        {/* Shipping Options */}
        <section className={styles.options}>
          <div className={styles.sectionHeader}>
            <div className="section-label" style={{ marginBottom: "0.7rem" }}>Choose Your Speed</div>
            <h2 className={styles.sectionTitle}>Delivery <span>Options</span></h2>
          </div>
          <div className={styles.optionsGrid}>
            {SHIPPING_OPTIONS.map((o) => (
              <div key={o.name} className={`${styles.optionCard} ${o.highlight ? styles.highlighted : ""}`}>
                {o.highlight && <div className={styles.popularBadge}>Most Popular</div>}
                <div className={styles.optionIcon}>{o.icon}</div>
                <h3 className={styles.optionName}>{o.name}</h3>
                <div className={styles.optionTime}>{o.time}</div>
                <div className={styles.optionPriceRow}>
                  <span className={styles.optionCost}>{o.cost}</span>
                  <span className={styles.optionFree}>{o.free}</span>
                </div>
                <p className={styles.optionDesc}>{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery Zones */}
        <section className={styles.zones}>
          <div className={styles.sectionHeader}>
            <div className="section-label" style={{ marginBottom: "0.7rem" }}>Pan-India Coverage</div>
            <h2 className={styles.sectionTitle}>Estimated <span>Delivery Times</span></h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Coverage</th>
                  <th>Standard</th>
                  <th>Express</th>
                </tr>
              </thead>
              <tbody>
                {ZONES.map((z) => (
                  <tr key={z.zone}>
                    <td className={styles.zoneCell}>{z.zone}</td>
                    <td className={styles.citiesCell}>{z.cities}</td>
                    <td>{z.standard}</td>
                    <td className={z.express === "Not available" ? styles.na : ""}>{z.express}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.zonesNote}>
            * Business days exclude Sundays and public holidays. Timelines are estimates and may vary during peak periods.
          </p>
        </section>

        {/* Info Cards */}
        <section className={styles.info}>
          <div className={styles.sectionHeader}>
            <div className="section-label" style={{ marginBottom: "0.7rem" }}>Good to Know</div>
            <h2 className={styles.sectionTitle}>Shipping <span>Information</span></h2>
          </div>
          <div className={styles.infoGrid}>
            {INFO_CARDS.map((c) => (
              <div key={c.title} className={styles.infoCard}>
                <div className={styles.infoIcon}>{c.icon}</div>
                <h4 className={styles.infoTitle}>{c.title}</h4>
                <p className={styles.infoDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Free Shipping Banner */}
        <section className={styles.freeBanner}>
          <div className={styles.freeBannerContent}>
            <div className={styles.freeBannerIcon}>🎁</div>
            <div>
              <h3 className={styles.freeBannerTitle}>Free Standard Shipping on orders above ₹1,500</h3>
              <p className={styles.freeBannerText}>
                Shop more, save more. Add items to your cart and enjoy free delivery — no promo code needed.
              </p>
            </div>
            <a href="/men" className={styles.freeBannerBtn}>Shop Now</a>
          </div>
        </section>

      </div>
    </>
  );
}
