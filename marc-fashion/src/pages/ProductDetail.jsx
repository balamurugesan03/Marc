import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getImageUrl } from "../api/products";
import styles from "./ProductDetail.module.css";

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push("★");
    else if (i - 0.5 <= rating) stars.push("★");
    else stars.push("☆");
  }
  return <span className={styles.stars}>{stars.join("")}</span>;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById } = useProducts();
  const product = getProductById(id);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>Product not found</h2>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const wished = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart({ ...product, selectedSize, selectedColor });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    addToCart({ ...product, selectedSize, selectedColor });
    navigate("/checkout");
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span onClick={() => navigate("/")} className={styles.crumbLink}>Home</span>
        <span className={styles.crumbSep}>›</span>
        <span onClick={() => navigate(`/${product.category}`)} className={styles.crumbLink}>
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </span>
        <span className={styles.crumbSep}>›</span>
        <span className={styles.crumbCurrent}>{product.name}</span>
      </div>

      <div className={styles.container}>
        {/* ── LEFT: Image Panel ── */}
        <div className={styles.imagePanel}>
          <div className={styles.mainImage}>
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
              className={`${styles.wishBtnLarge} ${wished ? styles.wishActive : ""}`}
              onClick={() => toggleWishlist(product)}
            >
              {wished ? "❤️" : "🤍"}
            </button>
            {product.image ? (
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className={styles.productImg}
              />
            ) : (
              <span className={styles.productEmoji}>{product.emoji}</span>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className={styles.thumbnails}>
            {product.colors.map((c, i) => (
              <div
                key={i}
                className={`${styles.thumb} ${selectedColor === i ? styles.thumbActive : ""}`}
                onClick={() => setSelectedColor(i)}
                style={{ borderColor: selectedColor === i ? c : "transparent" }}
              >
                {product.image ? (
                  <img src={getImageUrl(product.image)} alt={product.name} className={styles.thumbImg} />
                ) : (
                  <span className={styles.thumbEmoji}>{product.emoji}</span>
                )}
                <div className={styles.thumbColorDot} style={{ background: c }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Details Panel ── */}
        <div className={styles.detailsPanel}>
          {/* Brand & Category */}
          <div className={styles.brandLabel}>
            MARC FASHION &nbsp;·&nbsp;{" "}
            <span className={styles.categoryLabel}>
              {product.category.toUpperCase()}
            </span>
          </div>

          {/* Product Name */}
          <h1 className={styles.productName}>{product.name}</h1>

          {/* Rating Row */}
          <div className={styles.ratingRow}>
            <div className={styles.ratingPill}>
              <StarRating rating={product.rating} />
              <span className={styles.ratingNum}>{product.rating}</span>
            </div>
            <span className={styles.reviewCount}>{product.reviews} Ratings & Reviews</span>
          </div>

          <hr className={styles.divider} />

          {/* Price Section */}
          <div className={styles.priceSection}>
            <span className={styles.currentPrice}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.oldPrice && (
              <>
                <span className={styles.mrpLabel}>MRP</span>
                <span className={styles.oldPrice}>
                  ₹{product.oldPrice.toLocaleString("en-IN")}
                </span>
                <span className={styles.discountBadge}>{discount}% off</span>
              </>
            )}
          </div>
          <p className={styles.taxNote}>Inclusive of all taxes | Free Delivery</p>

          <hr className={styles.divider} />

          {/* Color Selection */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              Colour:{" "}
              <span className={styles.selectedLabel}>
                {product.colorNames[selectedColor]}
              </span>
            </div>
            <div className={styles.colorRow}>
              {product.colors.map((c, i) => (
                <button
                  key={i}
                  className={`${styles.colorBtn} ${selectedColor === i ? styles.colorBtnActive : ""}`}
                  onClick={() => setSelectedColor(i)}
                  title={product.colorNames[i]}
                  style={{
                    background: c,
                    outlineColor: selectedColor === i ? c : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              Size:
              {selectedSize && (
                <span className={styles.selectedLabel}>&nbsp;{selectedSize}</span>
              )}
              {sizeError && (
                <span className={styles.sizeError}>&nbsp;Please select a size</span>
              )}
            </div>
            <div className={styles.sizeRow}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  className={`${styles.sizeBtn} ${selectedSize === s ? styles.sizeBtnActive : ""}`}
                  onClick={() => {
                    setSelectedSize(s);
                    setSizeError(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <span className={styles.sizeChart}>Size Chart →</span>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionRow}>
            <button
              className={`${styles.addToCartBtn} ${added ? styles.addedBtn : ""}`}
              onClick={handleAddToCart}
            >
              {added ? "✓ Added to Cart" : "🛒 Add to Cart"}
            </button>
            <button className={styles.buyNowBtn} onClick={handleBuyNow}>
              ⚡ Buy Now
            </button>
          </div>

          <hr className={styles.divider} />

          {/* Delivery / Offers */}
          <div className={styles.offersSection}>
            <div className={styles.offerItem}>
              <span className={styles.offerIcon}>🚚</span>
              <div>
                <strong>Free Delivery</strong>
                <p>On orders above ₹499</p>
              </div>
            </div>
            <div className={styles.offerItem}>
              <span className={styles.offerIcon}>↩️</span>
              <div>
                <strong>7-Day Easy Returns</strong>
                <p>Hassle-free returns & exchanges</p>
              </div>
            </div>
            <div className={styles.offerItem}>
              <span className={styles.offerIcon}>✅</span>
              <div>
                <strong>100% Authentic</strong>
                <p>Genuine Marc Fashion products</p>
              </div>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Tabs: Description / Specifications */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "description" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`${styles.tab} ${activeTab === "specs" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("specs")}
            >
              Specifications
            </button>
          </div>

          {activeTab === "description" && (
            <div className={styles.tabContent}>
              <p className={styles.descriptionText}>{product.description}</p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className={styles.tabContent}>
              <table className={styles.specsTable}>
                <tbody>
                  <tr>
                    <td className={styles.specKey}>Brand</td>
                    <td className={styles.specVal}>Marc Fashion</td>
                  </tr>
                  <tr>
                    <td className={styles.specKey}>Category</td>
                    <td className={styles.specVal}>
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.specKey}>Material</td>
                    <td className={styles.specVal}>{product.material}</td>
                  </tr>
                  <tr>
                    <td className={styles.specKey}>Fit</td>
                    <td className={styles.specVal}>{product.fit}</td>
                  </tr>
                  <tr>
                    <td className={styles.specKey}>Available Sizes</td>
                    <td className={styles.specVal}>{product.sizes.join(", ")}</td>
                  </tr>
                  <tr>
                    <td className={styles.specKey}>Colours Available</td>
                    <td className={styles.specVal}>{product.colorNames.join(", ")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
