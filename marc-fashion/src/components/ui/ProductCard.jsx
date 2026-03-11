import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getImageUrl } from "../../api/products";
import styles from "./ProductCard.module.css";

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push("★");
    else if (i - 0.5 <= rating) stars.push("★");
    else stars.push("☆");
  }
  return <span className={styles.stars}>{stars.join("")}</span>;
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    // small pop animation via CSS class toggle
    if (btnRef.current) {
      btnRef.current.style.transform = "scale(1.25)";
      setTimeout(() => {
        if (btnRef.current) btnRef.current.style.transform = "";
      }, 200);
    }
  };

  const wished = isWishlisted(product.id);

  return (
    <div className={styles.card} onClick={() => navigate(`/product/${product.id}`)}>
      <div className={styles.imageArea}>
        {product.image && !imgError ? (
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className={styles.productImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={styles.emojiPlaceholder}
            style={{
              background: `linear-gradient(145deg, ${product.colors?.[0] || "#C9A465"}18 0%, ${product.colors?.[0] || "#C9A465"}40 100%)`,
            }}
          >
            <span>{product.emoji}</span>
          </div>
        )}

        {product.badge && (
          <span
            className={`${styles.badge} ${
              product.badge === "Sale" ? styles.badgeSale : styles.badgeNew
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          className={`${styles.wishBtn} ${wished ? styles.active : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          aria-label="Toggle wishlist"
        >
          {wished ? "❤️" : "🤍"}
        </button>

        <div className={styles.overlay}>
          <button
            className={styles.quickView}
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
          >
            Quick View
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.category}>{product.category}</div>
        <div className={styles.name}>{product.name}</div>

        <div className={styles.swatches}>
          {product.colors.map((c, i) => (
            <span
              key={i}
              className={styles.swatch}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className={styles.rating}>
          <StarRating rating={product.rating} />
          <span>({product.reviews})</span>
        </div>

        <div className={styles.priceRow}>
          <div>
            <span className={styles.price}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.oldPrice && (
              <span className={styles.oldPrice}>
                ₹{product.oldPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button ref={btnRef} className={styles.addBtn} onClick={handleAdd}>
            + Cart
          </button>
        </div>
      </div>
    </div>
  );
}
