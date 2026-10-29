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

// Floating WhatsApp button — sirf customer pages par (admin par nahi)
function WhatsAppFloat() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;
  return (
    <a
      href="https://wa.me/923284433025?text=Hello%20Aura%20Store!%20I%20have%20a%20question."
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    </a>
  );
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
        <Route path="/product/:category/:slug" element={<ProductDetail />} />
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
      <WhatsAppFloat />
      </CartProvider>
    </BrowserRouter>
  );
}
