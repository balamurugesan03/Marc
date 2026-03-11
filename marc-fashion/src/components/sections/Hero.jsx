import styles from "./Hero.module.css";
import llogo from "../../assets/llogo.png";

export default function Hero() {
  return (
    <section className={styles.heroBanner}>
      <img src={llogo} alt="MARC Logo" className={styles.heroLogo} />
    </section>
  );
}
