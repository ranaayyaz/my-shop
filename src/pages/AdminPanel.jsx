import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";

export default function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

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
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
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

  const logout = async () => {
    await signOut(auth);
    nav("/admin/login");
  };

  return (
    <div className="min-h-screen bg-violet-50">
      {/* Admin Header */}
      <header className="bg-violet-900 text-white p-4 shadow-md sticky top-0 z-10">
  <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
    <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left">Admin Dashboard</h1>

    <div className="flex flex-wrap justify-center gap-2">
      <Link to="/admin/messages" className="flex-1 sm:flex-none text-center whitespace-nowrap bg-blue-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition">
        Messages
      </Link>
      <Link to="/admin/add-product" className="flex-1 sm:flex-none text-center whitespace-nowrap bg-green-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-700 transition">
        + Add Product
      </Link>
      <button onClick={logout} className="flex-1 sm:flex-none whitespace-nowrap bg-red-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition">
        Logout
      </button>
    </div>
  </div>
</header>


      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
            Total: {orders.length}
          </span>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500 text-lg">No orders found.</p>
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

        {/* Manage Products Section */}
<div className="flex justify-between items-end mt-12 mb-6">
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
        <button
          onClick={() => deleteProduct(p.id)}
          className="w-full mt-3 bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
        >
          Delete Product
        </button>
      </div>
    </div>
  ))}
</div>

      </div>
    </div>
  );
}