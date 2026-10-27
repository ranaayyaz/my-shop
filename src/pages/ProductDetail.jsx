import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Product not found.</p>
        <Link to="/" className="text-violet-900 font-bold hover:underline">&larr; Back to Shop</Link>
      </div>
    );
  }

  const total = product.price * qty;

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Please fill in all the details!");
      return;
    }
    try {
      await addDoc(collection(db, "orders"), {
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        items: [{ name: product.name, qty, price: product.price }],
        total,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Thank you! Your order has been confirmed. We will contact you soon.");
      nav("/");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-violet-900 text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold tracking-widest uppercase flex items-center gap-2">
            <span>🛒</span> Aura Store
          </Link>
          <Link to="/" className="text-sm font-semibold hover:text-violet-200 transition">
            &larr; Back to Shop
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-80 md:h-[450px] object-cover rounded-3xl shadow-xl"
            />
          </div>

          <div>
            {product.category && (
              <span className="inline-block bg-violet-100 text-violet-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{product.name}</h1>
            <p className="text-3xl font-extrabold text-violet-900 mb-5">Rs {product.price}</p>
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <span className="font-bold text-gray-800">Quantity:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 bg-white font-bold text-xl hover:border-violet-500 hover:text-violet-900 transition"
                >
                  −
                </button>
                <span className="font-extrabold text-xl w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 bg-white font-bold text-xl hover:border-violet-500 hover:text-violet-900 transition"
                >
                  +
                </button>
              </div>
              <span className="font-bold text-gray-900">Total: Rs {total}</span>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-violet-900 text-white py-3.5 rounded-xl font-bold hover:bg-violet-800 transition shadow-lg text-lg"
            >
              Order Now
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Cash on Delivery — Pay when your order arrives</p>

            {showForm && (
              <div className="mt-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">Delivery Details</h3>
                <div className="space-y-3">
                  <input
                    placeholder="Full Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                  />
                  <input
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                  />
                  <textarea
                    placeholder="Complete Address"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                    rows={2}
                  />
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full bg-violet-900 text-white py-3 rounded-xl mt-4 font-bold hover:bg-violet-800 transition shadow-lg"
                >
                  Confirm Order — Rs {total}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
