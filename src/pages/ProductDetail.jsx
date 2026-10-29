import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDocs, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Header from "../components/Header";

// Flat shipping charges (image wale design ki tarah)
const SHIPPING = 250;
// Is amount ya zyada ke order par delivery FREE hai
const FREE_LIMIT = 3000;
// Expected delivery date (aaj se 4 din baad) — customer ko dikhane ke liye
const expectedDate = () =>
  new Date(Date.now() + 4 * 24 * 3600 * 1000).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

// Price ko Rs.1,000.00 wale format mein dikhane ke liye
const fmt = (n) => "Rs." + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Product ke naam ko URL ke qabil banana (e.g. "Slogan Print T-Shirt" -> "slogan-print-t-shirt")
const slugify = (t) =>
  (t || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
// Kisi bhi product ka saaf URL: /product/<category>/<product-name>
const productPath = (p) => `/product/${slugify(p.category || "products")}/${slugify(p.name)}`;


// Why Choose Us section ke 4 points (footer se upar wala section — isi file ke andar hai)
const WHY_FEATURES = [
  {
    title: "Fast Nationwide Delivery",
    text: "Your order is packed with care and delivered to your doorstep, anywhere in Pakistan.",
    icon: (
      <>
        <path d="M14 17V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1" />
        <path d="M14 9h4l3.2 3.2a1 1 0 0 1 .3.7V16a1 1 0 0 1-1 1h-1.5" />
        <path d="M9 17h5" />
        <circle cx="6.5" cy="17.5" r="1.8" />
        <circle cx="16.5" cy="17.5" r="1.8" />
      </>
    ),
  },
  {
    title: "Cash on Delivery",
    text: "No advance payment needed — pay in cash only when your order arrives at your door.",
    icon: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.4" />
        <path d="M6 12h.01M18 12h.01" strokeWidth={3} />
      </>
    ),
  },
  {
    title: "Premium Quality",
    text: "Every product is carefully selected and quality-checked before it is dispatched to you.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.2l2.4 2.4 4.6-5" />
      </>
    ),
  },
  {
    title: "Friendly Support",
    text: "Questions about your order? Reach us Mon–Sat, 9 AM – 6 PM on call, email or WhatsApp.",
    icon: (
      <>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
      </>
    ),
  },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setQty(1);
      setShowForm(false);
      setOrderPlaced(false);
      // URL wale naam (slug) se product dhundo — link ab /product/<category>/<name> hai
      const all = await getDocs(collection(db, "products"));
      const list = all.docs.map(d => ({ id: d.id, ...d.data() }));
      const found = list.find(x => slugify(x.name) === slug);
      if (found) {
        setProduct(found);
        // Related Products: usi category ki baqi products
        setRelated(list.filter(x => x.id !== found.id && x.category === found.category).slice(0, 4));
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

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
  const shippingFee = subtotal >= FREE_LIMIT ? 0 : SHIPPING;
  const total = subtotal + shippingFee;

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
        shipping: shippingFee,
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
      <Header showBack />

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

            {/* Expected delivery — customer ko date nazar aati hai */}
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 mb-5">
              <span className="text-xl">🚚</span>
              <p className="text-sm">
                Order today — expected delivery by <strong>{expectedDate()}</strong>
                {subtotal >= FREE_LIMIT ? (
                  <> · <strong>Your delivery is FREE!</strong></>
                ) : (
                  <> · Add <strong>Rs {(FREE_LIMIT - subtotal).toLocaleString()}</strong> more for FREE delivery</>
                )}
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-violet-900 text-white py-3.5 rounded-xl font-bold hover:bg-violet-800 transition shadow-lg text-lg"
            >
              Order Now
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Cash on Delivery — Pay when your order arrives</p>

            {/* Bharosay wali strip — Order Now ke bilkul paas */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="bg-white border border-gray-200 rounded-xl py-3 px-1 text-center">
                <p className="text-lg">💵</p>
                <p className="text-[11px] font-bold text-gray-700 mt-1 leading-tight">Cash on Delivery</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl py-3 px-1 text-center">
                <p className="text-lg">🚚</p>
                <p className="text-[11px] font-bold text-gray-700 mt-1 leading-tight">Delivery in 2–5 Days</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl py-3 px-1 text-center">
                <p className="text-lg">↩️</p>
                <p className="text-[11px] font-bold text-gray-700 mt-1 leading-tight">7-Day Easy Exchange</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-amber-500 font-bold tracking-[0.25em] uppercase text-xs">More to Explore</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1.5">You May Also Like</h2>
            </div>
            <Link to="/" className="text-sm font-bold text-violet-900 hover:text-amber-500 transition whitespace-nowrap">View All →</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
            {related.map(p => {
              const pOnSale = p.oldPrice && Number(p.oldPrice) > Number(p.price);
              return (
                <Link key={p.id} to={productPath(p)} className="group bg-white rounded-3xl border-2 border-gray-200 hover:border-violet-500 shadow-md transition-colors duration-300 overflow-hidden flex flex-col">
                  <div className="relative overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500" />
                    {pOnSale && (
                      <span className="absolute bottom-3 left-3 bg-white text-gray-900 text-xs font-semibold px-4 py-1.5 rounded-full shadow">Sale</span>
                    )}
                  </div>
                  <div className="p-4">
                    {p.category && <span className="text-[11px] font-bold tracking-wider uppercase text-violet-600">{p.category}</span>}
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-snug mt-1 line-clamp-2 min-h-10 md:min-h-12">{p.name}</h3>
                    <div className="mt-2">
                      <p className={`text-xs text-gray-400 line-through h-4 ${pOnSale ? "" : "invisible"}`}>{pOnSale ? `Rs ${p.oldPrice}` : "Rs 0"}</p>
                      <p className="font-extrabold text-violet-900 text-base md:text-lg leading-tight">Rs {p.price}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Why Choose Us — footer se upar wala section */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-amber-500 font-bold tracking-[0.25em] uppercase text-xs">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Why Shop With Aura Store?</h2>
            <p className="text-gray-500 mt-3">We make online shopping simple, safe and worry-free — just the way it should be.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-10">
            {WHY_FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-3xl border-2 border-gray-200 hover:border-violet-500 shadow-sm transition-colors duration-300 p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-violet-900 flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-extrabold text-gray-900 mt-4">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mt-1.5">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                      <span className={shippingFee === 0 ? "font-bold text-green-600" : "text-gray-900"}>{shippingFee === 0 ? "FREE" : fmt(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-base pt-1">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{fmt(total)}</span>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <p className="text-sm font-medium text-gray-700 mb-1.5">Shipping method</p>
                  <div className="flex items-center gap-3 border-2 border-amber-500 rounded-xl px-4 py-3 mb-5">
                    <input type="radio" checked readOnly className="w-5 h-5 accent-blue-600" />
                    <span className="font-bold text-gray-900">Standard</span>
                    <span className={`ml-auto ${shippingFee === 0 ? "font-bold text-green-600" : "text-gray-600"}`}>{shippingFee === 0 ? "FREE" : fmt(shippingFee)}</span>
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
                  <p className="text-gray-500 mb-4">
                    Thank you, {form.name}. Your order has been placed successfully. We will contact you shortly on {form.phone} to confirm your delivery.
                  </p>
                  <p className="inline-block bg-green-50 border border-green-200 text-green-800 text-sm font-semibold rounded-full px-4 py-1.5 mb-6">
                    🚚 Expected delivery by {expectedDate()}
                  </p>

                  <div className="bg-gray-200/70 rounded-lg p-4 mb-6 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-700">{product.name} × {qty}</span>
                      <span className="text-gray-900">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Shipping</span>
                      <span className={shippingFee === 0 ? "font-bold text-green-600" : "text-gray-900"}>{shippingFee === 0 ? "FREE" : fmt(shippingFee)}</span>
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
