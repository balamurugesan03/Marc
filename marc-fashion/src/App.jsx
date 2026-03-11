import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider }    from "./context/AuthContext";
import { CartProvider }    from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductProvider } from "./context/ProductContext";
import Navbar       from "./components/layout/Navbar";
import Footer       from "./components/layout/Footer";
import Home         from "./pages/Home";
import Men          from "./pages/Men";
import Women        from "./pages/Women";
import Boys        from "./pages/Boys";
import Girls       from "./pages/Girls";
import Footwear     from "./pages/Footwear";
import Accessories  from "./pages/Accessories";
import Innerwear      from "./pages/Innerwear";
import Undergarments  from "./pages/Undergarments";
import Toys         from "./pages/Toys";
import Wallet       from "./pages/Wallet";
import ShawlHijab   from "./pages/ShawlHijab";
import About        from "./pages/About";
import Contact      from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import Checkout     from "./pages/Checkout";
import SizeGuide    from "./pages/SizeGuide";
import Returns      from "./pages/Returns";
import Shipping     from "./pages/Shipping";
import Login        from "./pages/Login";
import Signup       from "./pages/Signup";
import Profile      from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ProductProvider>
      <CartProvider>
        <WishlistProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/"           element={<Home />} />
              <Route path="/men"        element={<Men />} />
              <Route path="/women"      element={<Women />} />
              <Route path="/boys"        element={<Boys />} />
              <Route path="/girls"       element={<Girls />} />
              <Route path="/footwear"    element={<Footwear />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/innerwear"      element={<Innerwear />} />
              <Route path="/undergarments" element={<Undergarments />} />
              <Route path="/toys"        element={<Toys />} />
              <Route path="/wallet"      element={<Wallet />} />
              <Route path="/shawl-hijab" element={<ShawlHijab />} />
              <Route path="/about"      element={<About />} />
              <Route path="/contact"    element={<Contact />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout"   element={<Checkout />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/returns"    element={<Returns />} />
              <Route path="/shipping"   element={<Shipping />} />
              <Route path="/login"      element={<Login />} />
              <Route path="/signup"     element={<Signup />} />
              <Route path="/profile"    element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </WishlistProvider>
      </CartProvider>
      </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
