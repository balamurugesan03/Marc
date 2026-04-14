import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL"];
const KIDS_SIZE_GROUPS = [
  { label: "Infant",  sizes: ["0-3M", "3-6M", "6-9M", "9-12M"] },
  { label: "Toddler", sizes: ["1-2Y", "2-3Y", "3-4Y"] },
  { label: "Kids",    sizes: ["4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y", "10-11Y", "11-12Y"] },
  { label: "Teen",    sizes: ["12-13Y", "13-14Y", "14-15Y", "15-16Y", "16-17Y", "17-18Y"] },
];
const KIDS_SIZES  = KIDS_SIZE_GROUPS.flatMap((g) => g.sizes);
const SHOE_SIZES  = ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
const FREE_SIZE   = ["Free Size"];
const TOY_SIZES   = ["3-5Y", "5-8Y", "8-12Y", "12Y+", "All Ages"];

const EMOJIS = ["👔", "👕", "👖", "🧥", "👗", "👚", "👘", "🤵", "🩱", "🩲", "🩳", "🧣", "🧤", "🧦", "👟", "👞", "👠", "👡", "🥿", "🩴", "💍", "👜", "👝", "🎒", "🧳", "💼", "🕶️", "⌚", "🧸", "🪆", "🎮", "🎯", "👛", "💳"];

const DEFAULT_COLORS = [
  { hex: "#1a1a1a", name: "Midnight Black" },
  { hex: "#FFFFFF", name: "Pure White" },
  { hex: "#C9A465", name: "Caramel Gold" },
  { hex: "#2C3E50", name: "Navy Blue" },
  { hex: "#8B7355", name: "Khaki Brown" },
  { hex: "#D4A5B5", name: "Dusty Rose" },
  { hex: "#85C1E9", name: "Sky Blue" },
  { hex: "#FF9AA2", name: "Coral Pink" },
  { hex: "#FAF8F4", name: "Off White" },
  { hex: "#FFDAC1", name: "Peach" },
];

const empty = {
  name: "",
  category: "men",
  price: "",
  oldPrice: "",
  badge: "",
  rating: "4.5",
  reviews: "0",
  emoji: "👔",
  material: "",
  fit: "",
  description: "",
  stock: "100",
  isActive: true,
  colors: [],
  colorNames: [],
  sizes: [],
};

export default function AddEditProduct() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [colorName, setColorName] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then((res) => {
          const p = res.data.product;
          setForm({
            name: p.name || "",
            category: p.category || "men",
            price: p.price || "",
            oldPrice: p.oldPrice || "",
            badge: p.badge || "",
            rating: p.rating || "4.5",
            reviews: p.reviews || "0",
            emoji: p.emoji || "👔",
            material: p.material || "",
            fit: p.fit || "",
            description: p.description || "",
            stock: p.stock || "100",
            isActive: p.isActive !== false,
            colors: p.colors || [],
            colorNames: p.colorNames || [],
            sizes: p.sizes || [],
          });
          if (p.image) setImagePreview(`http://localhost:5000/uploads/${p.image}`);
        })
        .catch(() => setError("Failed to load product"));
    }
  }, [id, isEdit]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleSize = (size) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  };

  const addColor = (hex, name) => {
    if (!hex || !name) return;
    if (form.colors.includes(hex)) return;
    setForm((f) => ({ ...f, colors: [...f.colors, hex], colorNames: [...f.colorNames, name] }));
    setColorHex("#000000");
    setColorName("");
  };

  const removeColor = (i) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.filter((_, idx) => idx !== i),
      colorNames: f.colorNames.filter((_, idx) => idx !== i),
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.price || !form.category) {
      setError("Name, category, and price are required.");
      return;
    }
    if (form.colors.length === 0) {
      setError("Add at least one colour.");
      return;
    }
    if (form.sizes.length === 0) {
      setError("Select at least one size.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      if (imageFile) fd.append("image", imageFile);

      if (isEdit) {
        await api.put(`/products/${id}`, fd);
        setSuccess("Product updated successfully!");
      } else {
        await api.post("/products", fd);
        setSuccess("Product added successfully!");
        setForm(empty);
        setImageFile(null);
        setImagePreview(null);
      }
      setTimeout(() => navigate("/products"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const sizeSet =
    form.category === "footwear"
      ? SHOE_SIZES
      : form.category === "boys" || form.category === "girls"
      ? KIDS_SIZES
      : form.category === "toys"
      ? TOY_SIZES
      : form.category === "accessories" || form.category === "wallet" || form.category === "shawl" || form.category === "hijab"
      ? FREE_SIZE
      : form.category === "innerwear" || form.category === "undergarments"
      ? ADULT_SIZES
      : ADULT_SIZES;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 style={styles.title}>{isEdit ? "Edit Product" : "Add New Product"}</h1>
          <p style={styles.desc}>{isEdit ? "Update product details" : "Fill in the details to add a new product"}</p>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.formGrid}>
        {/* ── LEFT COLUMN ── */}
        <div style={styles.col}>
          {/* Basic Info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Basic Information</h2>
            <div style={styles.field}>
              <label style={styles.label}>Product Name *</label>
              <input style={styles.input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Classic Oxford Shirt" required />
            </div>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Category *</label>
                <select style={styles.input} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="footwear">Footwear (Shoes / Chappals)</option>
                  <option value="accessories">Accessories</option>
                  <option value="innerwear">Innerwear</option>
                  <option value="undergarments">Undergarments</option>
                  <option value="toys">Toys</option>
                  <option value="wallet">Wallet</option>
                  <option value="shawl">Shawl</option>
                  <option value="hijab">Hijab</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Emoji</label>
                <select style={styles.input} value={form.emoji} onChange={(e) => set("emoji", e.target.value)}>
                  {EMOJIS.map((em) => <option key={em} value={em}>{em}</option>)}
                </select>
              </div>
            </div>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Material</label>
                <input style={styles.input} value={form.material} onChange={(e) => set("material", e.target.value)} placeholder="100% Cotton" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fit</label>
                <input style={styles.input} value={form.fit} onChange={(e) => set("fit", e.target.value)} placeholder="Regular Fit" />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, minHeight: 100, resize: "vertical" }}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the product..."
              />
            </div>
          </div>

          {/* Pricing */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Pricing & Badges</h2>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Price (₹) *</label>
                <input style={styles.input} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="2499" required min="0" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Old Price (₹)</label>
                <input style={styles.input} type="number" value={form.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} placeholder="3499" min="0" />
              </div>
            </div>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Badge</label>
                <select style={styles.input} value={form.badge} onChange={(e) => set("badge", e.target.value)}>
                  <option value="">None</option>
                  <option value="New">New</option>
                  <option value="Sale">Sale</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Stock</label>
                <input style={styles.input} type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} min="0" />
              </div>
            </div>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Rating (0-5)</label>
                <input style={styles.input} type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set("rating", e.target.value)} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Reviews Count</label>
                <input style={styles.input} type="number" value={form.reviews} onChange={(e) => set("reviews", e.target.value)} min="0" />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.checkLabel}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} style={{ marginRight: 8 }} />
                Active (visible on website)
              </label>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={styles.col}>
          {/* Image Upload */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Product Image</h2>
            <div
              style={styles.uploadArea}
              onClick={() => document.getElementById("imgInput").click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={styles.imgPreview} />
              ) : (
                <div style={styles.uploadPlaceholder}>
                  <div style={{ fontSize: 36 }}>📷</div>
                  <p style={{ color: "#9ca3af", marginTop: 8, fontSize: 13 }}>Click to upload image</p>
                  <p style={{ color: "#d1d5db", fontSize: 11 }}>JPG, PNG, WebP — max 5MB</p>
                </div>
              )}
            </div>
            <input id="imgInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
            {imagePreview && (
              <button type="button" style={styles.removeImgBtn} onClick={() => { setImageFile(null); setImagePreview(null); }}>
                Remove Image
              </button>
            )}
          </div>

          {/* Sizes */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Sizes *</h2>
            {(form.category === "boys" || form.category === "girls") ? (
              KIDS_SIZE_GROUPS.map((group) => (
                <div key={group.label} style={{ marginBottom: 14 }}>
                  <div style={styles.sizeGroupLabel}>{group.label}</div>
                  <div style={styles.sizesGrid}>
                    {group.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        style={{
                          ...styles.sizeBtn,
                          background: form.sizes.includes(s) ? "#111827" : "#f3f4f6",
                          color: form.sizes.includes(s) ? "#C9A465" : "#374151",
                          border: form.sizes.includes(s) ? "2px solid #C9A465" : "2px solid transparent",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.sizesGrid}>
                {sizeSet.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    style={{
                      ...styles.sizeBtn,
                      background: form.sizes.includes(s) ? "#111827" : "#f3f4f6",
                      color: form.sizes.includes(s) ? "#C9A465" : "#374151",
                      border: form.sizes.includes(s) ? "2px solid #C9A465" : "2px solid transparent",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Colours */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Colours *</h2>

            {/* Quick presets */}
            <div style={styles.presetColors}>
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => addColor(c.hex, c.name)}
                  style={{
                    ...styles.presetDot,
                    background: c.hex,
                    outline: form.colors.includes(c.hex) ? "3px solid #C9A465" : "2px solid #e5e7eb",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>

            {/* Custom colour input */}
            <div style={styles.colorInputRow}>
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                style={styles.colorPicker}
              />
              <input
                type="text"
                placeholder="Colour name"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                type="button"
                style={styles.addColorBtn}
                onClick={() => addColor(colorHex, colorName)}
              >
                Add
              </button>
            </div>

            {/* Selected colours */}
            {form.colors.length > 0 && (
              <div style={styles.selectedColors}>
                {form.colors.map((c, i) => (
                  <div key={i} style={styles.colorTag}>
                    <div style={{ ...styles.colorDot, background: c }} />
                    <span style={styles.colorTagName}>{form.colorNames[i]}</span>
                    <button type="button" style={styles.removeColor} onClick={() => removeColor(i)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Submit */}
      <div style={styles.submitRow}>
        <button type="button" style={styles.cancelBtn} onClick={() => navigate("/products")}>
          Cancel
        </button>
        <button type="submit" form="productForm" style={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : isEdit ? "💾 Update Product" : "✅ Add Product"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "28px 32px", maxWidth: 1200 },
  header: { display: "flex", alignItems: "center", gap: 20, marginBottom: 24 },
  backBtn: {
    background: "#f3f4f6", border: "none", borderRadius: 8,
    padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#374151",
  },
  title: { fontSize: 24, fontWeight: 700, color: "#111827" },
  desc: { color: "#6b7280", fontSize: 13, marginTop: 3 },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
    padding: "12px 16px", color: "#dc2626", fontSize: 13, marginBottom: 20,
  },
  successBox: {
    background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8,
    padding: "12px 16px", color: "#16a34a", fontSize: 13, marginBottom: 20,
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 },
  col: { display: "flex", flexDirection: "column", gap: 20 },
  card: {
    background: "#ffffff", borderRadius: 12,
    padding: "20px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  label: { fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },
  checkLabel: { fontSize: 13, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", cursor: "pointer" },
  input: {
    border: "1.5px solid #e5e7eb", borderRadius: 8,
    padding: "9px 12px", fontSize: 14, color: "#111827",
    outline: "none", width: "100%", background: "#fff",
  },
  uploadArea: {
    border: "2px dashed #e5e7eb", borderRadius: 12, height: 180,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", overflow: "hidden", background: "#fafafa",
  },
  uploadPlaceholder: { textAlign: "center" },
  imgPreview: { width: "100%", height: "100%", objectFit: "contain" },
  removeImgBtn: {
    background: "none", border: "none", color: "#ef4444",
    fontSize: 12, cursor: "pointer", marginTop: 8, fontWeight: 600,
  },
  sizesGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  sizeGroupLabel: {
    fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase",
    letterSpacing: 1, marginBottom: 6,
  },
  sizeBtn: {
    padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s",
  },
  presetColors: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  presetDot: {
    width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
    border: "none", transition: "all 0.15s",
  },
  colorInputRow: { display: "flex", gap: 8, alignItems: "center", marginBottom: 12 },
  colorPicker: { width: 40, height: 36, border: "none", borderRadius: 6, cursor: "pointer", padding: 2 },
  addColorBtn: {
    background: "#111827", color: "#C9A465", border: "none",
    borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  selectedColors: { display: "flex", flexWrap: "wrap", gap: 8 },
  colorTag: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#f9fafb", border: "1px solid #e5e7eb",
    borderRadius: 20, padding: "4px 10px",
  },
  colorDot: { width: 14, height: 14, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 },
  colorTagName: { fontSize: 12, fontWeight: 500, color: "#374151" },
  removeColor: {
    background: "none", border: "none", color: "#9ca3af",
    fontSize: 16, cursor: "pointer", lineHeight: 1, padding: 0,
  },
  submitRow: {
    display: "flex", gap: 12, justifyContent: "flex-end",
    paddingTop: 12, borderTop: "1px solid #e5e7eb",
  },
  cancelBtn: {
    background: "#f3f4f6", border: "none", borderRadius: 8,
    padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  saveBtn: {
    background: "#C9A465", border: "none", borderRadius: 8,
    padding: "12px 28px", fontSize: 14, fontWeight: 700,
    color: "#111827", cursor: "pointer",
  },
};
