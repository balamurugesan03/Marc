import PageBanner from "../components/ui/PageBanner";
import styles from "./About.module.css";

const values = [
  { icon: "✨", title: "Timeless Quality", desc: "Every piece is crafted with premium fabrics and meticulous attention to detail." },
  { icon: "🌿", title: "Sustainable Fashion", desc: "We're committed to ethical sourcing and reducing our environmental footprint." },
  { icon: "👨‍👩‍👧", title: "Family First", desc: "Fashion for every member of the family under one curated roof." },
  { icon: "💛", title: "Inclusive Style", desc: "From classic to contemporary — we celebrate every style and every body." },
];

const team = [
  // { name: "Arjun Mehta", role: "Founder & Creative Director", emoji: "👨‍💼" },
  { name: "Anshida", role: "Founder", emoji: "👩‍🎨" },
  // { name: "Rohan Sharma", role: "Operations Lead", emoji: "👨‍💻" },
];

export default function About() {
  return (
    <>
      <PageBanner title="Our" highlight="Story" eyebrow="About MARC" />

      <div className={styles.wrapper}>
        {/* Brand Story */}
        <section className={styles.story}>
          <div className={styles.storyText}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Est. 2018</div>
            <h2 className={styles.storyTitle}>
              Dressing Families,<br />
              <span>One Story at a Time</span>
            </h2>
            <p className={styles.storyDesc}>
              MARC was born from a simple belief: that every family deserves to look and feel their best
              without compromising on quality or breaking the bank. Founded in 2018, we've grown from a
              single boutique in Mumbai to a beloved nationwide fashion destination.
            </p>
            <p className={styles.storyDesc}>
              Our collections are thoughtfully curated to reflect the diverse tapestry of Indian families —
              blending traditional elegance with contemporary flair, from crisp formal wear to relaxed
              weekend casuals.
            </p>
          </div>
          <div className={styles.storyVisual}>
            <div className={styles.storyBox}>🏛️</div>
          </div>
        </section>

        {/* Values */}
        <section className={styles.values}>
          <div className={styles.valuesHeader}>
            <div className="section-label" style={{ justifyContent: "center", marginBottom: "0.7rem" }}>What We Stand For</div>
            <h2 className={styles.valuesTitle}>Our <span>Core Values</span></h2>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <h3 className={styles.valueName}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className={styles.team}>
          <div className={styles.teamHeader}>
            <div className="section-label" style={{ justifyContent: "center", marginBottom: "0.7rem" }}>The People Behind MARC</div>
            <h2 className={styles.teamTitle}>Meet the <span>Team</span></h2>
          </div>
          <div className={styles.teamGrid}>
            {team.map((m) => (
              <div key={m.name} className={styles.teamCard}>
                <div className={styles.avatar}>{m.emoji}</div>
                <h3 className={styles.memberName}>{m.name}</h3>
                <p className={styles.memberRole}>{m.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className={styles.contact}>
          <div className={styles.contactHeader}>
            <div className="section-label" style={{ justifyContent: "center", marginBottom: "0.7rem" }}>Find Us</div>
            <h2 className={styles.contactTitle}>Get in <span>Touch</span></h2>
          </div>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>📍</div>
              <div className={styles.contactLabel}>Address</div>
              <div className={styles.contactText}>
                Vellayani Jn., Nemom (P.O),<br />Trivandrum, Kerala
              </div>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>💬</div>
              <div className={styles.contactLabel}>WhatsApp</div>
              <div className={styles.contactText}>
                <a href="https://wa.me/919633633733" className={styles.contactLink} target="_blank" rel="noreferrer">+91 9633 633 733</a><br />
                <a href="https://wa.me/917907858891" className={styles.contactLink} target="_blank" rel="noreferrer">+91 7907 858 891</a>
              </div>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>✉️</div>
              <div className={styles.contactLabel}>Email</div>
              <div className={styles.contactText}>
                <a href="mailto:marcthefamilyfashion@gmail.com" className={styles.contactLink}>
                  marcthefamilyfashion@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
