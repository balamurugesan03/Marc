import { useState } from "react";
import PageBanner from "../components/ui/PageBanner";
import styles from "./Contact.module.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageBanner title="Get in" highlight="Touch" eyebrow="Contact Us" />

      <div className={styles.wrapper}>
        <div className={styles.grid}>
          {/* Form */}
          <div className={styles.formSide}>
            <h2 className={styles.sideTitle}>Send Us a Message</h2>
            {sent ? (
              <div className={styles.success}>
                🎉 Thank you! We'll get back to you within 24 hours.
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Your Name</label>
                    <input
                      name="name"
                      type="text"
                      className={styles.input}
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      className={styles.input}
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Subject</label>
                  <input
                    name="subject"
                    type="text"
                    className={styles.input}
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Message</label>
                  <textarea
                    name="message"
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Write your message here..."
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  Send Message →
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className={styles.infoSide}>
            <h2 className={styles.sideTitle}>Store Information</h2>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📍</div>
              <div>
                <div className={styles.infoLabel}>Address</div>
                <div className={styles.infoText}>
                  Vellayani Jn., Nemom (P.O),<br />
                  Trivandrum, Kerala
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>💬</div>
              <div>
                <div className={styles.infoLabel}>WhatsApp</div>
                <div className={styles.infoText}>
                  <a href="https://wa.me/919633633733" className={styles.infoLink} target="_blank" rel="noreferrer">
                   +91 7907 858 891
                  </a><br />
                  <a href="https://wa.me/917907858891" className={styles.infoLink} target="_blank" rel="noreferrer">
                    +91 9633 633 733
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✉️</div>
              <div>
                <div className={styles.infoLabel}>Email</div>
                <div className={styles.infoText}>
                  <a href="mailto:marcthefamilyfashion@gmail.com" className={styles.infoLink}>
                    marcthefamilyfashion@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🕐</div>
              <div>
                <div className={styles.infoLabel}>Store Hours</div>
                <div className={styles.infoText}>
                  Mon–Sun: 9:30 AM – 10:30 PM<br />
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className={styles.mapWrap}>
          <div className={styles.mapLabelRow}>
            <div className={styles.mapLabel}>📍 Find Us on the Map</div>
            <a
              href="https://maps.app.goo.gl/dh732CUggYGyLGgA8"
              target="_blank"
              rel="noreferrer"
              className={styles.directionsBtn}
            >
              Get Directions →
            </a>
          </div>
          <iframe
            title="MARC Store Location"
            src="https://maps.google.com/maps?q=MARC+THE+FAMILY+FASHION+near+Vellayani+Junction+Nemom+Kerala+695020&output=embed"
            className={styles.mapFrame}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </>
  );
}
