import PageBanner from "../components/ui/PageBanner";
import styles from "./SizeGuide.module.css";

const MEN_SIZES = [
  { size: "XS", chest: "34–36", waist: "28–30", hip: "34–36", shoulder: "16.5" },
  { size: "S",  chest: "36–38", waist: "30–32", hip: "36–38", shoulder: "17.5" },
  { size: "M",  chest: "38–40", waist: "32–34", hip: "38–40", shoulder: "18.5" },
  { size: "L",  chest: "40–42", waist: "34–36", hip: "40–42", shoulder: "19.5" },
  { size: "XL", chest: "42–44", waist: "36–38", hip: "42–44", shoulder: "20.5" },
  { size: "XXL",chest: "44–46", waist: "38–40", hip: "44–46", shoulder: "21.5" },
];

const WOMEN_SIZES = [
  { size: "XS", chest: "31–33", waist: "24–25", hip: "33–35", dress: "0–2" },
  { size: "S",  chest: "33–35", waist: "25–27", hip: "35–37", dress: "4–6" },
  { size: "M",  chest: "35–37", waist: "27–29", hip: "37–39", dress: "8–10" },
  { size: "L",  chest: "37–39", waist: "29–31", hip: "39–41", dress: "12–14" },
  { size: "XL", chest: "39–41", waist: "31–33", hip: "41–43", dress: "16–18" },
  { size: "XXL",chest: "41–44", waist: "33–36", hip: "43–46", dress: "20–22" },
];

const KIDS_SIZES = [
  { size: "2–3 yrs", height: "86–98 cm", chest: "52–55", waist: "50–52" },
  { size: "4–5 yrs", height: "98–110 cm", chest: "55–59", waist: "52–55" },
  { size: "6–7 yrs", height: "110–122 cm", chest: "59–64", waist: "55–58" },
  { size: "8–9 yrs", height: "122–134 cm", chest: "64–69", waist: "58–62" },
  { size: "10–11 yrs", height: "134–146 cm", chest: "69–75", waist: "62–66" },
  { size: "12–13 yrs", height: "146–158 cm", chest: "75–82", waist: "66–70" },
];

const HOW_TO = [
  {
    step: "01",
    title: "Chest",
    desc: "Measure around the fullest part of your chest, keeping the tape horizontal and parallel to the floor.",
  },
  {
    step: "02",
    title: "Waist",
    desc: "Measure around your natural waistline — the narrowest part of your torso, usually just above the navel.",
  },
  {
    step: "03",
    title: "Hip",
    desc: "Stand with feet together and measure around the fullest part of your hips and seat.",
  },
  {
    step: "04",
    title: "Shoulder",
    desc: "Measure from the outer edge of one shoulder to the outer edge of the other, across the back.",
  },
];

export default function SizeGuide() {
  return (
    <>
      <PageBanner title="Size" highlight="Guide" eyebrow="Find Your Perfect Fit" />

      <div className={styles.wrapper}>

        {/* Intro */}
        <section className={styles.intro}>
          <p className={styles.introText}>
            All measurements are in <strong>inches</strong> unless stated otherwise. If you fall between two sizes,
            we recommend sizing up for a more comfortable fit. For Kids, height is the most reliable guide.
          </p>
        </section>

        {/* How to Measure */}
        <section className={styles.howTo}>
          <div className={styles.sectionHeader}>
            <div className="section-label" style={{ marginBottom: "0.7rem" }}>Getting Started</div>
            <h2 className={styles.sectionTitle}>How to <span>Measure</span></h2>
          </div>
          <div className={styles.stepsGrid}>
            {HOW_TO.map((h) => (
              <div key={h.step} className={styles.stepCard}>
                <div className={styles.stepNum}>{h.step}</div>
                <h3 className={styles.stepTitle}>{h.title}</h3>
                <p className={styles.stepDesc}>{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Men */}
        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Men's <span>Size Chart</span></h2>
            <p className={styles.tableNote}>All measurements in inches</p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Hip</th>
                  <th>Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {MEN_SIZES.map((r) => (
                  <tr key={r.size}>
                    <td className={styles.sizeCell}>{r.size}</td>
                    <td>{r.chest}</td>
                    <td>{r.waist}</td>
                    <td>{r.hip}</td>
                    <td>{r.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Women */}
        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Women's <span>Size Chart</span></h2>
            <p className={styles.tableNote}>All measurements in inches</p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Hip</th>
                  <th>Dress Size</th>
                </tr>
              </thead>
              <tbody>
                {WOMEN_SIZES.map((r) => (
                  <tr key={r.size}>
                    <td className={styles.sizeCell}>{r.size}</td>
                    <td>{r.chest}</td>
                    <td>{r.waist}</td>
                    <td>{r.hip}</td>
                    <td>{r.dress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Kids */}
        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Kids' <span>Size Chart</span></h2>
            <p className={styles.tableNote}>Height in cm · Chest & Waist in inches</p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Age</th>
                  <th>Height</th>
                  <th>Chest</th>
                  <th>Waist</th>
                </tr>
              </thead>
              <tbody>
                {KIDS_SIZES.map((r) => (
                  <tr key={r.size}>
                    <td className={styles.sizeCell}>{r.size}</td>
                    <td>{r.height}</td>
                    <td>{r.chest}</td>
                    <td>{r.waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tip Banner */}
        <section className={styles.tipBanner}>
          <div className={styles.tipIcon}>📏</div>
          <div className={styles.tipContent}>
            <h3 className={styles.tipTitle}>Still unsure about your size?</h3>
            <p className={styles.tipText}>
              Our team is happy to help. Reach out via our{" "}
              <a href="/contact" className={styles.tipLink}>Contact page</a> and we'll guide you
              to the perfect fit within 24 hours.
            </p>
          </div>
        </section>

      </div>
    </>
  );
}
