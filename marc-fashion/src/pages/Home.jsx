import Hero from "../components/sections/Hero";
import MarqueeStrip from "../components/sections/MarqueeStrip";
import FeaturedProducts from "../components/sections/FeaturedProducts";
import { Link } from "react-router-dom";
import ShopImg from "../assets/shopimge2.jpg";

const CONTACT_ITEMS = [
  {
    icon: "📍",
    label: "Visit Us",
    lines: ["Vellayani Jn., Nemom (P.O)", "Trivandrum, Kerala"],
    href: null,
  },
  {
    icon: "💬",
    label: "WhatsApp",
    lines: ["+91 9633 633 733", "+91 7907 858 891"],
    hrefs: ["https://wa.me/919633633733", "https://wa.me/917907858891"],
  },
  {
    icon: "✉️",
    label: "Email Us",
    lines: ["marcthefamilyfashion@gmail.com"],
    hrefs: ["mailto:marcthefamilyfashion@gmail.com"],
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <FeaturedProducts />

      {/* ── CONTACT STRIP ── */}
      <section style={cs.section}>
        <div style={cs.inner}>
          <div style={cs.heading}>
            <img src={ShopImg} alt="MARC Shop" style={{ width: '100%', maxWidth: '700px', margin: '0 auto 2rem', display: 'block', borderRadius: '12px', objectFit: 'cover' }} />
            <p style={cs.eyebrow}>Find Us</p>
            <h2 style={cs.title}>
              Come Visit <span style={cs.accent}>MARC</span>
            </h2>
          </div>

          <div style={cs.grid}>
            {CONTACT_ITEMS.map((item) => (
              <div key={item.label} style={cs.card}>
                <div style={cs.iconBox}>{item.icon}</div>
                <div style={cs.cardLabel}>{item.label}</div>
                <div style={cs.cardText}>
                  {item.lines.map((line, i) =>
                    item.hrefs ? (
                      <a key={i} href={item.hrefs[i]} style={cs.link} target="_blank" rel="noreferrer">
                        {line}
                      </a>
                    ) : (
                      <span key={i}>{line}</span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={cs.cta}>
            <Link to="/contact" style={cs.ctaBtn}>Get in Touch →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

const cs = {
  section: {
    background: "#0d1117",
    padding: "clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    textAlign: "center",
  },
  heading: {
    marginBottom: "3rem",
  },
  eyebrow: {
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "#C9A465",
    marginBottom: "0.6rem",
  },
  title: {
    fontFamily: "var(--font-serif)",
    fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.2,
  },
  accent: { color: "#C9A465" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2.5rem",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,164,101,0.18)",
    borderRadius: "16px",
    padding: "2rem 1.5rem",
    transition: "background 0.2s",
  },
  iconBox: {
    fontSize: "2rem",
    marginBottom: "0.8rem",
  },
  cardLabel: {
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#C9A465",
    marginBottom: "0.6rem",
  },
  cardText: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    fontSize: "0.88rem",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.7,
  },
  link: {
    color: "rgba(255,255,255,0.65)",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  cta: {
    marginTop: "0.5rem",
  },
  ctaBtn: {
    display: "inline-block",
    padding: "0.75rem 2rem",
    background: "#C9A465",
    color: "#111",
    borderRadius: "50px",
    fontWeight: 700,
    fontSize: "0.85rem",
    letterSpacing: "0.05em",
    textDecoration: "none",
    transition: "opacity 0.2s",
  },
};
