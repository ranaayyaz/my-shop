import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [searchTerm, setSearchTerm] = useState("");

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
      {/* Premium Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Empty div for flex balance on desktop */}
          <div className="hidden md:block w-32"></div>

          {/* Store Name Centered */}
        <h1 className="text-3xl font-extrabold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2">
  <span>🛒</span> Aura Store
</h1>

          {/* Cart Button */}
          <button
            onClick={() => setShowCheckout(true)}
            className="flex items-center gap-2 bg-white text-gray-900 px-5 py-2 rounded-full font-bold hover:bg-gray-200 transition shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cart ({cart.reduce((s, i) => s + i.qty, 0)})
          </button>
        </div>
      </header>

      {/* Hero Section & Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Discover Your Style</h2>
          <p className="text-gray-500 mb-6 max-w-lg">Premium quality products, delivered straight to your doorstep.</p>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-full py-3 px-5 pl-12 focus:outline-none focus:ring-2 focus:ring-gray-900 transition shadow-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

      {/* Checkout Modal (Modern Design) */}
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
    </div>
  );
}