import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";


export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showSearch, setShowSearch] = useState(false); // Search bar toggle karne ke liye

  // Cart ab shared hai (CartContext se) — add yahan karo, Cart page par nazar ayega
  const { addToCart, totalItems } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(d => {
        const data = d.data();
        let price = Number(data.price);
        let oldPrice = data.oldPrice ? Number(data.oldPrice) : null;
        // Ulti bhari hui prices ko dikhane se pehle khud seedha kar do
        if (oldPrice && oldPrice < price) {
          const temp = price;
          price = oldPrice;
          oldPrice = temp;
        }
        return { id: d.id, ...data, price, oldPrice };
      }));
    };
    fetchProducts();
  }, []);

  // Search filter
 const filteredProducts = products.filter(p =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
  (selectedCategory === "All" || p.category === selectedCategory)
);


  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-violet-950 via-violet-800 to-violet-950 text-white text-[11px] md:text-xs py-2 px-4 text-center tracking-[0.2em] font-semibold uppercase">
        ✨ Welcome to Aura Store — Discover Premium Quality, Delivered to Your Doorstep.
      </div>

      {/* Premium Header */}
      <header className="bg-gradient-to-r from-violet-950 via-violet-900 to-violet-950 text-white sticky top-0 z-20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Row: Logo + Search + Icons */}
          <div className="flex items-center justify-between gap-3 md:gap-6 py-3.5 relative">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 md:gap-3 shrink-0">
              <span className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl md:text-2xl shadow-lg ring-1 ring-white/20">
                🛒
              </span>
              <span className="leading-none">
                <span className="block text-lg md:text-2xl font-extrabold tracking-[0.14em] uppercase">
                  Aura <span className="text-amber-400">Store</span>
                </span>
                <span className="hidden sm:block text-[9px] md:text-[10px] font-semibold tracking-[0.32em] uppercase text-violet-200 mt-1">
                  Premium Shopping
                </span>
              </span>
            </Link>

            {/* Search Bar (Desktop — hamesha nazar ati hai) */}
            <div className="hidden md:block flex-1 max-w-xl relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-full py-2.5 pl-5 pr-12 text-sm text-white placeholder:text-violet-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 focus:border-white transition"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-4 top-2.5 text-violet-200 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">

              {/* Search Icon (sirf mobile par — desktop par upar wali search bar hai) */}
              <button onClick={() => setShowSearch(!showSearch)} className="md:hidden w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition" title="Search">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart — Cart page kholta hai */}
              <Link to="/cart" className="relative w-10 h-10 md:w-11 md:h-11 rounded-full hover:bg-white/10 flex items-center justify-center transition" title="Your Cart">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {/* Cart Count Badge */}
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full ring-2 ring-violet-950">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

        </div>

        {/* Dropdown Search Bar (Mobile — icon click par) */}
        {showSearch && (
          <div className="md:hidden absolute top-full left-0 w-full bg-violet-950 border-t border-white/10 p-4 shadow-xl">
            <div className="max-w-3xl mx-auto relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 text-white border border-white/20 rounded-full py-2.5 px-4 pl-11 focus:outline-none focus:border-amber-400 placeholder:text-violet-200 transition"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-3 text-violet-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Image */}
      <div className="bg-violet-50 relative overflow-hidden">
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
            <a href="#products" className="inline-block bg-violet-900 text-white px-8 py-3 rounded-full font-bold hover:bg-violet-800 transition shadow-lg">
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
          <div className="w-24 h-1 bg-violet-900 mx-auto mt-4 mb-3"></div>
          <p className="text-gray-500 text-sm">Handpicked just for you</p>
        </div>
{/* Category Buttons */}
<div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
  {["All", "Clothing", "Electronics", "Accessories"].map(cat => (
    <button
      key={cat}
      onClick={() => setSelectedCategory(cat)}
      className={`px-5 py-2 rounded-full text-sm font-bold transition shadow-sm ${selectedCategory === cat ? "bg-violet-900 text-white" : "bg-white text-gray-700 border border-gray-200 hover:border-violet-400 hover:text-violet-900"}`}
    >
      {cat}
    </button>
  ))}
</div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.length === 0 && (
            <p className="col-span-full text-center py-10 text-gray-500">No products found.</p>
          )}

          {filteredProducts.map(p => (
            <div key={p.id} className="group flex flex-col">
              <div className="relative overflow-hidden rounded-xl">
                <Link to={`/product/${p.id}`}>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                {p.oldPrice && Number(p.oldPrice) > Number(p.price) && (
                  <span className="absolute bottom-3 left-3 bg-white text-gray-900 text-xs font-semibold px-4 py-1.5 rounded-full shadow">
                    Sale
                  </span>
                )}
              </div>
              <div className="pt-3 flex flex-col flex-grow">
                <Link to={`/product/${p.id}`}>
                  <h3 className="font-medium text-gray-800 text-sm md:text-base leading-snug hover:text-violet-900">{p.name}</h3>
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm md:text-base">
                    {p.oldPrice && Number(p.oldPrice) > Number(p.price) && (
                      <span className="text-gray-400 line-through mr-2">Rs {p.oldPrice}</span>
                    )}
                    <span className="font-semibold text-gray-900">Rs {p.price}</span>
                  </p>
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-violet-900 text-white p-2.5 rounded-full hover:bg-violet-700 transition-colors shadow-md flex items-center justify-center shrink-0"
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

    </div>
  );
}
