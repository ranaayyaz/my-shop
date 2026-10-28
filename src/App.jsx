import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AddProduct from "./pages/AddProduct";
import AdminMessages from "./pages/AdminMessages";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import CartPage from "./pages/CartPage";
import { PrivacyPolicy, RefundPolicy, ShippingInfo } from "./pages/Policies";
import { CartProvider } from "./context/CartContext";
// Footer sirf customer pages par — admin pages (/admin...) par nahi
function FooterGate() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;
  return <Footer />;
}

export default function App() {
  const [user, setUser] = useState(undefined);

  // Check karna ke admin login hai ya nahi
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Jab tak check ho raha hai, loading dikhao
  if (user === undefined) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
      <Routes>
        {/* Customer Store */}
        <Route path="/" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-info" element={<ShippingInfo />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Panel (Protected - sirf login hone par khulega) */}
        <Route
          path="/admin"
          element={user ? <AdminPanel /> : <Navigate to="/admin/login" />}
        />
        <Route
  path="/admin/add-product"
  element={user ? <AddProduct /> : <Navigate to="/admin/login" />}
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/messages" element={user ? <AdminMessages /> : <Navigate to="/admin/login" />} />
      </Routes>

      {/* Footer — customer pages par (admin par nahi) */}
      <FooterGate />
      </CartProvider>
    </BrowserRouter>
  );
}
