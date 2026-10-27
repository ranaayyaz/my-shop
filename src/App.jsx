import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
      <Routes>
        {/* Customer Store */}
        <Route path="/" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        
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
    </BrowserRouter>
  );
}