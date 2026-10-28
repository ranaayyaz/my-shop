import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";

// Flat shipping charges (detail page wale popup ki tarah)
const SHIPPING = 250;

// Price ko Rs.1,000.00 wale format mein dikhane ke liye
const fmt = (n) => "Rs." + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CartPage() {
  const nav = useNavigate();
  const { cart, removeFromCart, updateQty, clearCart, subtotal, totalItems } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const total = subtotal + (cart.length > 0 ? SHIPPING : 0);

  const placeOrder = async () => {
    // Guard: order save ho raha ho to dobara click par naya order nahi banna chahiye
    if (placing) return;
    if (cart.length === 0) return;
    if (!form.name || !form.phone || !form.address || !form.city) {
      alert("Please fill in all the details!");
      return;
    }
    setPlacing(true);
    try {
      const orderItems = cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }));
      await addDoc(collection(db, "orders"), {
        customerName: form.name,
        phone: form.phone,
        address: form.address + ", " + form.city,
        city: form.city,
        items: orderItems,
        shipping: SHIPPING,
        total,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      // Confirmation ke liye order ki copy rakho, phir cart khali kar do
      setPlacedOrder({ name: form.name, phone: form.phone, items: orderItems, total });
      clearCart();
    } catch (err) {
      setPlacing(false);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header showBack />

      {placedOrder ? (
        /* ===== Order Confirmed ===== */
        <div className="max-w-xl mx-auto px-4 py-14">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-6">
              Thank you, {placedOrder.name}. Your order has been placed successfully. We will contact you shortly on {placedOrder.phone} to confirm your delivery.
            </p>

            <div className="bg-gray-200/70 rounded-lg p-4 mb-6 text-sm space-y-1.5 text-left">
              {placedOrder.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-700">{i.name} × {i.qty}</span>
                  <span className="text-gray-900">{fmt(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping</span>
                <span className="text-gray-900">{fmt(SHIPPING)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-base pt-1">
                <span className="text-gray-900">Total (Cash on Delivery)</span>
                <span className="text-gray-900">{fmt(placedOrder.total)}</span>
              </div>
            </div>

            <button
              onClick={() => nav("/")}
              className="w-full bg-violet-900 text-white py-3.5 rounded-xl font-bold hover:bg-violet-800 transition shadow-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : cart.length === 0 ? (
        /* ===== Empty Cart ===== */
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-5 bg-violet-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-violet-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products and they will show up here.</p>
          <Link to="/" className="inline-block bg-violet-900 text-white px-8 py-3 rounded-full font-bold hover:bg-violet-800 transition shadow-lg">
            Continue Shopping
          </Link>
        </div>
      ) : (
        /* ===== Cart Page ===== */
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Your Cart</h1>
          <p className="text-gray-500 mb-8">{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(i => (
                <div key={i.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-center">
                  <Link to={`/product/${i.id}`} className="shrink-0">
                    <img src={i.image} alt={i.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${i.id}`}>
                      <h3 className="font-bold text-gray-900 leading-snug hover:text-violet-900">{i.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">{fmt(i.price)} each</p>
                    <div className="inline-flex items-center border border-gray-300 rounded mt-2">
                      <button onClick={() => updateQty(i.id, i.qty - 1)} className="px-3 py-1 font-bold text-gray-700 hover:bg-gray-100 rounded-l">−</button>
                      <span className="w-8 text-center text-sm font-bold">{i.qty}</span>
                      <button onClick={() => updateQty(i.id, i.qty + 1)} className="px-3 py-1 font-bold text-gray-700 hover:bg-gray-100 rounded-r">+</button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-gray-900">{fmt(i.price * i.qty)}</p>
                    <button onClick={() => removeFromCart(i.id)} className="text-red-400 hover:text-red-600 transition mt-2" title="Remove item">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <Link to="/" className="inline-block text-violet-900 font-bold hover:underline pt-2">
                &larr; Continue Shopping
              </Link>
            </div>

            {/* Order Summary + Delivery Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">Order Summary</h2>
              <div className="bg-gray-200/70 rounded-lg p-4 text-sm space-y-1.5 mb-5">
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

              <p className="text-sm font-medium text-gray-700 mt-5 mb-1.5">Payment Method</p>
              <div className="flex items-center gap-3 border-2 border-violet-900 rounded-xl px-4 py-3 mb-5">
                <input type="radio" checked readOnly className="w-5 h-5 accent-violet-900" />
                <span className="font-bold text-gray-900">Cash on Delivery</span>
                <span className="ml-auto text-gray-500 text-sm">Pay at your doorstep</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full bg-violet-900 text-white py-3.5 rounded-lg font-extrabold uppercase hover:bg-violet-800 transition shadow disabled:opacity-60"
              >
                {placing ? "Placing Order..." : `Complete Order - ${fmt(total)}`}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Cash on Delivery — Pay when your order arrives</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
