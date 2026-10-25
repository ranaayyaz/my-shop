import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false); // Search bar toggle karne ke liye

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchProducts();
  }, []);

  const addToCart = (p) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === p.id);
      if (exists) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Saari details bharein!");
      return;
    }
    try {
      await addDoc(collection(db, "orders"), {
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        total,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Shukriya! Aapka order confirm ho gaya hai. Hum jald contact karenge.");
      setCart([]);
      setForm({ name: "", phone: "", address: "" });
      setShowCheckout(false);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Search filter
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Top Announcement Bar */}
      <div className="bg-black text-white text-xs md:text-sm py-2 px-4 text-center tracking-widest font-medium uppercase">
        ✨ Welcome to Aura Store — Discover Premium Quality, Delivered to Your Doorstep.
      </div>

      {/* Premium Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center relative">
          
          {/* Store Name */}
          <h1 className="text-xl md:text-3xl font-extrabold tracking-widest uppercase cursor-pointer flex items-center gap-2">
            <span>🛒</span> Aura Store
          </h1>

          {/* Icons (Search & Cart) */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Search Icon */}
            <button onClick={() => setShowSearch(!showSearch)} className="hover:text-gray-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Bag Icon with Badge */}
            <button onClick={() => setShowCheckout(true)} className="relative hover:text-gray-300 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {/* Cart Count Badge */}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Search Bar (Jab icon par click ho) */}
        {showSearch && (
          <div className="absolute top-full left-0 w-full bg-gray-800 p-4 shadow-xl">
            <div className="max-w-3xl mx-auto relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-full py-2 px-4 pl-10 focus:outline-none focus:border-gray-400 transition"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Image */}
      <div className="bg-gray-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
          
          {/* Text Side */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">New Collection 2026</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Discover Your <br className="hidden md:block"/> Perfect Style
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto md:mx-0 text-lg">
              Premium quality products, curated just for you. Shop the latest trends and get them delivered straight to your doorstep.
            </p>
            <a href="#products" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg">
              Shop Now
            </a>
          </div>

          {/* Image Side */}
          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-0 bg-gray-300 rounded-3xl transform translate-x-4 translate-y-4 -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Shopping" 
              className="w-full h-64 md:h-96 object-cover rounded-3xl shadow-xl"
            />
          </div>

        </div>
      </div>

           {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-8">
        
        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 uppercase tracking-wide">Featured Products</h2>
          <div className="w-24 h-1 bg-gray-900 mx-auto mt-4 mb-3"></div>
          <p className="text-gray-500 text-sm">Handpicked just for you</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.length === 0 && (
            <p className="col-span-full text-center py-10 text-gray-500">Koi product nahi mila.</p>
          )}
          
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
              <div className="relative overflow-hidden">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-40 md:h-60 object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">{p.name}</h3>
                <p className="text-gray-500 text-xs md:text-sm mb-3 flex-grow line-clamp-2">{p.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  <p className="font-extrabold text-lg md:text-xl text-gray-900">Rs {p.price}</p>
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-gray-900 text-white p-2.5 rounded-full hover:bg-gray-700 transition-colors shadow-md flex items-center justify-center"
                    title="Add to Cart"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl transform transition-transform">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Aapka cart khali hai.</p>
                <button onClick={() => setShowCheckout(false)} className="text-blue-600 font-semibold hover:underline">Continue Shopping</button>
              </div>
            ) : (
              <>
                <div className="max-h-48 overflow-y-auto mb-6 pr-2">
                  {cart.map(i => (
                    <div key={i.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{i.name}</span>
                        <span className="text-sm text-gray-500">Qty: {i.qty} × Rs {i.price}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-900">Rs {i.price * i.qty}</span>
                        <button onClick={() => removeFromCart(i.id)} className="text-red-400 hover:text-red-600 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Amount</span>
                  <span className="font-extrabold text-2xl text-gray-900">Rs {total}</span>
                </div>

                <h3 className="font-semibold text-gray-800 mb-3">Delivery Details</h3>
                <div className="space-y-3">
                  <input
                    placeholder="Full Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  />
                  <input
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  />
                  <textarea
                    placeholder="Complete Address"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                    rows={2}
                  />
                </div>

                <button
                  onClick={placeOrder}
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl mt-6 font-bold hover:bg-gray-800 transition shadow-lg text-lg"
                >
                  Confirm Order
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">Cash on Delivery</p>
              </>
            )}
          </div>
        </div>
      )}
            {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-extrabold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <span>🛒</span> Aura Store
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Discover premium quality products at unbeatable prices. We deliver happiness straight to your doorstep with cash on delivery.
            </p>
            <div className="flex gap-4">
              {/* Social Icons */}
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-white hover:text-gray-900 transition text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-white hover:text-gray-900 transition text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="#products" className="hover:text-white transition">Shop Products</a></li>
              <li><a href="/contact" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span>📍</span> Lahore, Pakistan
              </li>
              <li className="flex items-center gap-3">
                <span>📞</span> +92 328 4433025
              </li>
              <li className="flex items-center gap-3">
                <span>✉️</span> support@aurastore.com
              </li>
            </ul>
          </div>

        </div>
        
        {/* Copyright Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Aura Store. All rights reserved. Made with ❤️ in Pakistan.</p>
        </div>
      </footer>
    </div>
  );
}