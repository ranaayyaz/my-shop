import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("home"); // home | orders | products — dashboard ke 2 baray cards ke liye
  const nav = useNavigate();

  // Real-time orders fetch karna
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by newest first
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(list);
    });
    return () => unsub();
  }, []);

  // Real-time products fetch karna
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
  };

  const deleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteDoc(doc(db, "orders", id));
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const confirmOnWhatsApp = (o) => {
    let phone = (o.phone || "").replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "92" + phone.slice(1);
    const msg = `Hello ${o.customerName}, thank you for shopping at Aura Store! Your order of Rs ${o.total} has been CONFIRMED. We will deliver it to your address soon.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Dashboard hisaab (stats)
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const pendingCount = orders.length - deliveredCount;

  const logout = async () => {
    await signOut(auth);
    nav("/admin/login");
  };

  return (
    <div className="min-h-screen bg-violet-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-violet-950 via-violet-900 to-violet-950 text-white shadow-lg sticky top-0 z-10">
        <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"></div>
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <span className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
            <div className="leading-tight text-center sm:text-left">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">Admin <span className="text-amber-400">Dashboard</span></h1>
              <p className="text-[10px] font-bold tracking-[0.25em] text-violet-300 uppercase">Aura Store · Manage Your Store</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 whitespace-nowrap bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
              </svg>
              View Store
            </Link>
            <Link to="/admin/messages" className="flex items-center gap-1.5 whitespace-nowrap bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Messages
            </Link>
            <Link to="/admin/add-product" className="flex items-center gap-1.5 whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-violet-950 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Product
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 whitespace-nowrap bg-red-600 hover:bg-red-500 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {view === "home" && (<>
        {/* Dashboard Stats (Hisaab) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-3xl font-extrabold text-violet-900 mt-1">{orders.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Orders</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivered</p>
            <p className="text-3xl font-extrabold text-green-600 mt-1">{deliveredCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-3xl font-extrabold text-violet-900 mt-1">Rs {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        {/* Dashboard ke 2 baray Cards — click karne par apna section khulta hai */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div onClick={() => setView("orders")} className="bg-white rounded-3xl border-2 border-gray-200 hover:border-violet-600 shadow-sm transition cursor-pointer p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-violet-900 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5h11M9 12h11M9 19h11M4.5 5h.01M4.5 12h.01M4.5 19h.01" />
                </svg>
              </div>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-violet-950 text-xs font-extrabold px-3 py-1.5 rounded-full">{pendingCount} Pending</span>
              )}
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-5">Orders</h3>
            <p className="text-gray-500 mt-1">{orders.length} total orders — confirm karein, WhatsApp par batayein, deliver mark karein</p>
            <span className="inline-block mt-4 text-violet-900 font-extrabold text-sm">View Orders →</span>
          </div>
          <div onClick={() => setView("products")} className="bg-white rounded-3xl border-2 border-gray-200 hover:border-violet-600 shadow-sm transition cursor-pointer p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-violet-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
                </svg>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-extrabold px-3 py-1.5 rounded-full">{products.length} Products</span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-5">Manage Products</h3>
            <p className="text-gray-500 mt-1">Saare products aik jagah — edit karein, delete karein, prices badlein</p>
            <span className="inline-block mt-4 text-violet-900 font-extrabold text-sm">View Products →</span>
          </div>
        </div>
        </>)}

        {view === "orders" && (<>
        <button onClick={() => setView("home")} className="mb-5 inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-violet-400 text-gray-700 hover:text-violet-900 font-bold text-sm px-4 py-2 rounded-full shadow-sm transition">← Back to Dashboard</button>

        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
            Total: {orders.length}
          </span>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500 text-lg">Abhi tak koi order nahi aaya.</p>
          </div>
        )}

        {/* Orders Grid (Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3 border-b pb-3">
                  <div>
                    <p className="font-bold text-lg text-gray-900">{o.customerName}</p>
                    <p className="text-sm text-gray-600 mt-1">📞 {o.phone}</p>
                    <p className="text-sm text-gray-600">📍 {o.address}</p>
                    {o.createdAt?.seconds && (
                      <p className="text-xs text-gray-400 mt-1">🗓️ {new Date(o.createdAt.seconds * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-xl text-gray-900">Rs {o.total}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wide
                      ${o.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                        o.status === "delivered" ? "bg-green-100 text-green-800" : 
                        "bg-blue-100 text-blue-800"}`}
                    >
                      {o.status || "pending"}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Items</p>
                  {o.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">{item.name} × {item.qty}</span>
                      <span className="font-semibold text-gray-900">Rs {item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(o.id, "confirmed")}
                    className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(o.id, "delivered")}
                    className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition"
                  >
                    Deliver
                  </button>
                  <button
                    onClick={() => confirmOnWhatsApp(o)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => deleteOrder(o.id)}
                    className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>)}

        {view === "products" && (<>
        <button onClick={() => setView("home")} className="mb-5 inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-violet-400 text-gray-700 hover:text-violet-900 font-bold text-sm px-4 py-2 rounded-full shadow-sm transition">← Back to Dashboard</button>

        {/* Manage Products Section */}
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
            Total: {products.length}
          </span>
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500 text-lg">No products found.</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <p className="font-bold text-gray-900">{p.name}</p>
                <p className="font-extrabold text-gray-900 mt-1">Rs {p.price}</p>
                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/admin/add-product?edit=${p.id}`}
                    className="flex-1 text-center bg-violet-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-violet-700 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>)}
      </div>
    </div>
  );
}