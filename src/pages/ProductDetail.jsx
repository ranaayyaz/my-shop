import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Flat shipping charges (image wale design ki tarah)
const SHIPPING = 250;

// Price ko Rs.1,000.00 wale format mein dikhane ke liye
const fmt = (n) => "Rs." + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });

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

  const subtotal = product.price * qty;
  const total = subtotal + SHIPPING;

  const placeOrder = async () => {
    // Guard: order save ho raha ho to dobara click par naya order nahi banna chahiye
    if (placing) return;
    if (!form.name || !form.phone || !form.address || !form.city) {
      alert("Please fill in all the details!");
      return;
    }
    setPlacing(true);
    try {
      await addDoc(collection(db, "orders"), {
        customerName: form.name,
        phone: form.phone,
        address: form.address + ", " + form.city,
        city: form.city,
        items: [{ name: product.name, qty, price: product.price }],
        shipping: SHIPPING,
        total,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      // Order save ho gaya — ab alert ki jagah professional confirmation popup dikhao
      setOrderPlaced(true);
    } catch (err) {
      setPlacing(false);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
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

      {/* Product Detail */}
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image Side */}
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-80 md:h-[450px] object-cover rounded-3xl shadow-xl"
            />
          </div>

          {/* Details Side */}
          <div>
            {product.category && (
              <span className="inline-block bg-violet-100 text-violet-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{product.name}</h1>
            <p className="text-3xl font-extrabold text-violet-900 mb-5">Rs {product.price}</p>
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Quantity Selector */}
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
              <span className="font-bold text-gray-900">Subtotal: Rs {subtotal}</span>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-violet-900 text-white py-3.5 rounded-xl font-bold hover:bg-violet-800 transition shadow-lg text-lg"
            >
              Order Now
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Cash on Delivery — Pay when your order arrives</p>
          </div>
        </div>
      </div>

      {/* Order Popup (Modal) — Cash on Delivery design */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

            {!orderPlaced ? (
              <>
                {/* Popup Header */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <h2 className="text-lg font-extrabold tracking-wide text-gray-900 uppercase">Cash on Delivery</h2>
                  <button onClick={() => setShowForm(false)} className="ml-auto text-gray-500 hover:text-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="px-5 py-4">
                  {/* Product Box */}
                  <div className="flex gap-3 border border-gray-200 rounded-xl p-3 mb-4">
                    <div className="relative shrink-0">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                        {qty}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-snug">{product.name}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{fmt(product.price)}</p>
                      <div className="inline-flex items-center border border-gray-300 rounded mt-2">
                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-2.5 py-1 font-bold text-gray-700 hover:bg-gray-100">−</button>
                        <span className="w-8 text-center text-sm font-bold">{qty}</span>
                        <button onClick={() => setQty(q => q + 1)} className="px-2.5 py-1 font-bold text-gray-700 hover:bg-gray-100">+</button>
                      </div>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gray-200/70 rounded-lg p-4 mb-4 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="text-gray-900">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Shipping</span>
                      <span className="text-gray-900">{fmt(SHIPPING)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-base pt-1">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{fmt(total)}</span>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <p className="text-sm font-medium text-gray-700 mb-1.5">Shipping method</p>
                  <div className="flex items-center gap-3 border-2 border-violet-900 rounded-xl px-4 py-3 mb-5">
                    <input type="radio" checked readOnly className="w-5 h-5 accent-blue-600" />
                    <span className="font-bold text-gray-900">Standard</span>
                    <span className="ml-auto text-gray-600">{fmt(SHIPPING)}</span>
                  </div>

                  {/* Address Form */}
                  <h3 className="text-center font-extrabold text-gray-900 mb-4">Enter your shipping address</h3>
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <input
                          placeholder="Full Name"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <input
                          placeholder="03001234567"
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Complete Address <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <input
                          placeholder="Address"
                          value={form.address}
                          onChange={e => setForm({ ...form, address: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <input
                          placeholder="City"
                          value={form.city}
                          onChange={e => setForm({ ...form, city: e.target.value })}
                          className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="w-full bg-violet-900 text-white py-3.5 rounded-lg mt-5 font-extrabold uppercase hover:bg-violet-800 transition shadow disabled:opacity-60"
                  >
                    {placing ? "Placing Order..." : `Complete Order - ${fmt(total)}`}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Professional Confirmation */}
                <div className="text-center px-6 py-8">
                  <div className="w-20 h-20 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
                  <p className="text-gray-500 mb-6">
                    Thank you, {form.name}. Your order has been placed successfully. We will contact you shortly on {form.phone} to confirm your delivery.
                  </p>

                  <div className="bg-gray-200/70 rounded-lg p-4 mb-6 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-700">{product.name} × {qty}</span>
                      <span className="text-gray-900">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Shipping</span>
                      <span className="text-gray-900">{fmt(SHIPPING)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-base pt-1">
                      <span className="text-gray-900">Total (Cash on Delivery)</span>
                      <span className="text-gray-900">{fmt(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => nav("/")}
                    className="w-full bg-violet-900 text-white py-3.5 rounded-xl font-bold hover:bg-violet-800 transition shadow-lg"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
