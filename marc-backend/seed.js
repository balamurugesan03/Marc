/**
 * Seed Script — Run once to populate MongoDB with:
 * 1. Default admin: admin@marc.com / admin123
 * 2. All 16 products from the static data
 *
 * Usage: node seed.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Admin = require("./models/Admin");
const Product = require("./models/Product");

const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const KIDS_SIZES = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"];

const products = [
  {
    name: "Classic Oxford Shirt",
    category: "men",
    price: 2499,
    oldPrice: 3499,
    badge: "New",
    rating: 4.5,
    reviews: 128,
    colors: ["#1a1a1a", "#C9A465", "#FFFFFF"],
    colorNames: ["Midnight Black", "Caramel Gold", "Pure White"],
    sizes: ADULT_SIZES,
    emoji: "👔",
    isSale: false,
    material: "100% Premium Cotton",
    fit: "Regular Fit",
    description:
      "Crafted from premium 100% cotton, this Classic Oxford Shirt is a wardrobe essential that effortlessly blends timeless style with everyday comfort. The structured collar and clean silhouette make it perfect for both formal office wear and smart-casual outings.",
  },
  {
    name: "Premium Chino Trousers",
    category: "men",
    price: 3299,
    oldPrice: null,
    badge: null,
    rating: 4.7,
    reviews: 94,
    colors: ["#8B7355", "#1a1a1a", "#2C3E50"],
    colorNames: ["Khaki Brown", "Jet Black", "Navy Blue"],
    sizes: ADULT_SIZES,
    emoji: "👖",
    isSale: false,
    material: "98% Cotton, 2% Elastane",
    fit: "Slim Fit",
    description:
      "These Premium Chino Trousers are designed for the modern man who values both comfort and style. Made with a subtle stretch fabric blend, they offer unrestricted movement while maintaining a sharp, tailored look.",
  },
  {
    name: "Tailored Blazer",
    category: "men",
    price: 6999,
    oldPrice: 9999,
    badge: "Sale",
    rating: 4.8,
    reviews: 67,
    colors: ["#1a1a1a", "#2C2C2C", "#8B7355"],
    colorNames: ["Midnight Black", "Charcoal Grey", "Warm Tan"],
    sizes: ADULT_SIZES,
    emoji: "🧥",
    isSale: true,
    material: "Poly-Viscose Blend",
    fit: "Tailored Fit",
    description:
      "Make a lasting impression in this expertly Tailored Blazer. Constructed from a high-quality poly-viscose blend, it holds its shape beautifully throughout the day.",
  },
  {
    name: "Linen Summer Shirt",
    category: "men",
    price: 1899,
    oldPrice: 2499,
    badge: "Sale",
    rating: 4.3,
    reviews: 152,
    colors: ["#FFFFFF", "#FAF8F4", "#C9A465"],
    colorNames: ["Pure White", "Off White", "Caramel Gold"],
    sizes: ADULT_SIZES,
    emoji: "👕",
    isSale: true,
    material: "100% Linen",
    fit: "Relaxed Fit",
    description:
      "Beat the summer heat in style with this Linen Summer Shirt. Made from breathable 100% linen, it keeps you cool and comfortable even on the hottest days.",
  },
  {
    name: "Elegant Floral Dress",
    category: "women",
    price: 4299,
    oldPrice: null,
    badge: "New",
    rating: 4.9,
    reviews: 203,
    colors: ["#D4A5B5", "#C9A465", "#1a1a1a"],
    colorNames: ["Dusty Rose", "Caramel Gold", "Midnight Black"],
    sizes: ADULT_SIZES,
    emoji: "👗",
    isSale: false,
    material: "100% Viscose",
    fit: "A-Line",
    description:
      "Elevate your wardrobe with this Elegant Floral Dress, a stunning piece that combines feminine charm with modern sophistication.",
  },
  {
    name: "Silk Blouse",
    category: "women",
    price: 2999,
    oldPrice: 3999,
    badge: "Sale",
    rating: 4.6,
    reviews: 89,
    colors: ["#FFFFFF", "#FAF8F4", "#D4A5B5"],
    colorNames: ["Pure White", "Ivory Cream", "Blush Pink"],
    sizes: ADULT_SIZES,
    emoji: "👚",
    isSale: true,
    material: "100% Pure Silk",
    fit: "Regular Fit",
    description:
      "Indulge in the luxurious feel of our Silk Blouse, crafted from 100% pure silk for an unmatched softness against your skin.",
  },
  {
    name: "High-Waist Palazzo Pants",
    category: "women",
    price: 3499,
    oldPrice: null,
    badge: null,
    rating: 4.5,
    reviews: 76,
    colors: ["#1a1a1a", "#8B7355", "#2C3E50"],
    colorNames: ["Jet Black", "Earthy Brown", "Deep Navy"],
    sizes: ADULT_SIZES,
    emoji: "👖",
    isSale: false,
    material: "Crepe Fabric",
    fit: "Wide Leg",
    description:
      "Our High-Waist Palazzo Pants are the ultimate blend of comfort and elegance. The flattering high-waist cut elongates the silhouette.",
  },
  {
    name: "Wrap Midi Skirt",
    category: "women",
    price: 2199,
    oldPrice: 2999,
    badge: "Sale",
    rating: 4.4,
    reviews: 118,
    colors: ["#C9A465", "#D4A5B5", "#1a1a1a"],
    colorNames: ["Caramel Gold", "Dusty Rose", "Midnight Black"],
    sizes: ADULT_SIZES,
    emoji: "👗",
    isSale: true,
    material: "Chiffon",
    fit: "Wrap Style",
    description:
      "This Wrap Midi Skirt is a timeless wardrobe staple that flatters every body type. The adjustable wrap front allows a customised fit.",
  },
  {
    name: "Girls Frilled Frock",
    category: "girls",
    price: 1499,
    oldPrice: null,
    badge: "New",
    rating: 4.8,
    reviews: 56,
    colors: ["#FF9AA2", "#FFB7B2", "#FFDAC1"],
    colorNames: ["Coral Pink", "Soft Pink", "Peach"],
    sizes: KIDS_SIZES,
    emoji: "👗",
    isSale: false,
    material: "Cotton Blend",
    fit: "Relaxed Fit",
    description:
      "Let your little one shine in this adorable Girls Frilled Frock. Made from soft, skin-friendly cotton blend fabric.",
  },
  {
    name: "Boys Casual Set",
    category: "boys",
    price: 1299,
    oldPrice: 1799,
    badge: "Sale",
    rating: 4.5,
    reviews: 83,
    colors: ["#85C1E9", "#1a1a1a", "#C9A465"],
    colorNames: ["Sky Blue", "Jet Black", "Caramel Gold"],
    sizes: KIDS_SIZES,
    emoji: "👕",
    isSale: true,
    material: "Cotton Jersey",
    fit: "Regular Fit",
    description:
      "The Boys Casual Set is designed for active little ones who need comfort without compromising on style.",
  },
  {
    name: "Unisex Hoodie",
    category: "boys",
    price: 1799,
    oldPrice: null,
    badge: null,
    rating: 4.7,
    reviews: 64,
    colors: ["#1a1a1a", "#85C1E9", "#FF9AA2"],
    colorNames: ["Midnight Black", "Sky Blue", "Coral Pink"],
    sizes: KIDS_SIZES,
    emoji: "🧥",
    isSale: false,
    material: "Fleece Cotton",
    fit: "Oversized Fit",
    description:
      "Keep your child warm and stylish in this cosy Unisex Hoodie. Made from plush fleece cotton, it provides excellent warmth.",
  },
  {
    name: "Party Wear Kurta",
    category: "girls",
    price: 999,
    oldPrice: 1499,
    badge: "Sale",
    rating: 4.3,
    reviews: 41,
    colors: ["#C9A465", "#D4A5B5", "#FFFFFF"],
    colorNames: ["Caramel Gold", "Dusty Rose", "Pure White"],
    sizes: KIDS_SIZES,
    emoji: "👘",
    isSale: true,
    material: "Art Silk",
    fit: "Regular Fit",
    description:
      "Dress your little one for every festive occasion in this beautiful Party Wear Kurta. Crafted from art silk fabric with intricate embroidery.",
  },
  {
    name: "Formal Suit Set",
    category: "men",
    price: 12999,
    oldPrice: 15999,
    badge: "Sale",
    rating: 4.9,
    reviews: 45,
    colors: ["#1a1a1a", "#2C2C2C", "#8B7355"],
    colorNames: ["Midnight Black", "Charcoal Grey", "Warm Tan"],
    sizes: ADULT_SIZES,
    emoji: "🤵",
    isSale: true,
    material: "Wool Blend",
    fit: "Tailored Fit",
    description:
      "Command attention in our premium Formal Suit Set, crafted from a refined wool blend that offers both sophistication and comfort.",
  },
  {
    name: "Embroidered Kurta",
    category: "women",
    price: 3799,
    oldPrice: null,
    badge: "New",
    rating: 4.8,
    reviews: 97,
    colors: ["#C9A465", "#D4A5B5", "#FFFFFF"],
    colorNames: ["Caramel Gold", "Dusty Rose", "Pure White"],
    sizes: ADULT_SIZES,
    emoji: "👘",
    isSale: false,
    material: "Cotton Silk",
    fit: "Regular Fit",
    description:
      "This beautifully crafted Embroidered Kurta combines traditional artistry with contemporary design.",
  },
  {
    name: "Denim Jacket",
    category: "men",
    price: 4599,
    oldPrice: 5999,
    badge: "Sale",
    rating: 4.6,
    reviews: 112,
    colors: ["#2C3E50", "#1a1a1a", "#85C1E9"],
    colorNames: ["Deep Navy", "Washed Black", "Light Blue"],
    sizes: ADULT_SIZES,
    emoji: "🧥",
    isSale: true,
    material: "100% Denim",
    fit: "Regular Fit",
    description:
      "A wardrobe classic that never goes out of style – our Denim Jacket is crafted from premium 100% denim for lasting durability.",
  },
  {
    name: "Summer Sundress",
    category: "women",
    price: 2799,
    oldPrice: null,
    badge: "New",
    rating: 4.7,
    reviews: 88,
    colors: ["#FFDAC1", "#FFB7B2", "#C9A465"],
    colorNames: ["Peachy Nude", "Soft Coral", "Caramel Gold"],
    sizes: ADULT_SIZES,
    emoji: "👗",
    isSale: false,
    material: "100% Cotton",
    fit: "Relaxed Fit",
    description:
      "Embrace the sunny season in this breezy Summer Sundress. Made from soft, lightweight 100% cotton, it keeps you cool and comfortable.",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/marc-fashion");
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Product.deleteMany({});
    await Admin.deleteMany({});

    // Create products
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);

    // Create default admin
    const admin = new Admin({
      name: "Marc Admin",
      email: "admin@marc.com",
      password: "admin123",
    });
    await admin.save();
    console.log("✅ Admin created: admin@marc.com / admin123");

    console.log("\n🎉 Seed complete! Start backend with: npm run dev");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();
