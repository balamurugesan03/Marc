import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import nameImg from "../../assets/name.png-removebg-preview.png";
import menImg from "../../assets/men.jpeg";
import womenImg from "../../assets/women.jpeg";
import boysImg from "../../assets/kidss.jpeg";
import girlsImg from "../../assets/girls.jpeg";
import footwearImg from "../../assets/footwear.png";
import accessoriesImg from "../../assets/accesories.png";
import toysImg from "../../assets/Toys.jpg";
import walletImg from "../../assets/wallets.png";
import innerwearImg      from "../../assets/innerwear.jpeg";
import undergarmentImg   from "../../assets/undergarments.png";
import shawlImg          from "../../assets/shawl.jpeg";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "Men",         path: "/men",         img: menImg    },
  { label: "Women",       path: "/women",       img: womenImg  },
  { label: "Boys",        path: "/boys",        img: boysImg     },
  { label: "Girls",       path: "/girls",       img: girlsImg    },
    { label: "Shall/Hijab", path: "/shawl-hijab", img: shawlImg },
     { label: "Toys",        path: "/toys",        img: toysImg        },
  { label: "Footwear",    path: "/footwear",    img: footwearImg },
  { label: "Accessories", path: "/accessories", img: accessoriesImg },
   { label: "Wallet",      path: "/wallet",      img: walletImg },
  { label: "Innerwear",      path: "/innerwear",      img: innerwearImg },
  { label: "Undergarments", path: "/undergarments", img: undergarmentImg },
 
 

  { label: "About",       path: "/about"       },
  { label: "Contact",     path: "/contact"     },
];

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartCount }  = useCart();
  const { wishlist }   = useWishlist();
  const { user, logout, isLoggedIn } = useAuth();
  const navigate       = useNavigate();
  const userMenuRef    = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      {/* Top bar: logo + actions */}
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <img src={nameImg} alt="MARC" className={styles.logoImg} />
        </Link>

        {/* Desktop Links */}
        <ul className={styles.links}>
          {NAV_LINKS.map((l) => (
            <li key={l.path}>
              <NavLink
                to={l.path}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
              >
                {l.img && <img src={l.img} alt={l.label} className={styles.navThumb} />}
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.iconBtn} aria-label="Search">🔍</button>

          <button className={styles.iconBtn} aria-label="Wishlist">
            🤍
            {wishlist.length > 0 && (
              <span className={styles.badge}>{wishlist.length}</span>
            )}
          </button>

          <button className={styles.iconBtn} aria-label="Cart">
            🛒
            {cartCount > 0 && (
              <span className={styles.badge}>{cartCount}</span>
            )}
          </button>

          {isLoggedIn ? (
            <div className={styles.userWrap} ref={userMenuRef}>
              <button
                className={styles.userBtn}
                onClick={() => setUserMenuOpen((p) => !p)}
                aria-label="Account"
              >
                <span className={styles.userInitial}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </button>

              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.dropHeader}>
                    <div className={styles.dropName}>{user.name}</div>
                    <div className={styles.dropEmail}>{user.email}</div>
                  </div>
                  <div className={styles.dropDivider} />
                  <Link to="/profile" className={styles.dropItem} onClick={() => setUserMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M2 13c0-2.761 2.239-4.5 5-4.5s5 1.739 5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    My Profile
                  </Link>
                  <Link to="/profile" className={styles.dropItem} onClick={() => setUserMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M4.5 6h5M4.5 8.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    My Orders
                  </Link>
                  <div className={styles.dropDivider} />
                  <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>Sign In</Link>
          )}
        </div>
      </div>

      {/* Mobile horizontal scroll strip */}
      <div className={styles.mobileStrip}>
        {NAV_LINKS.map((l) => (
          <NavLink
            key={l.path}
            to={l.path}
            className={({ isActive }) =>
              `${styles.stripItem} ${isActive ? styles.stripActive : ""}`
            }
          >
            {l.img ? (
              <img src={l.img} alt={l.label} className={styles.stripThumb} />
            ) : (
              <span className={styles.stripPlaceholder}>{l.label.charAt(0)}</span>
            )}
            <span className={styles.stripLabel}>{l.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
