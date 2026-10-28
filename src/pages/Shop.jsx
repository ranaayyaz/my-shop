import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
// Home page ke barray banners (carousel) — image ya text badalna ho to sirf yahin se badle ga
const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    tag: "New Collection 2026",
    title: "Discover Your Perfect Style",
    text: "Premium quality clothing, curated just for you — delivered straight to your doorstep.",
    cta: "Shop Clothing",
    category: "Clothing",
  },
  {
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
    tag: "Latest Tech",
    title: "Electronics That Upgrade Your Life",
    text: "Headphones, gadgets and much more — genuine products at prices you will love.",
    cta: "Shop Electronics",
    category: "Electronics",
  },
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80",
    tag: "Premium Accessories",
    title: "Details That Complete Your Look",
    text: "Watches and accessories crafted to stand out — finish your style the right way.",
    cta: "Shop Accessories",
    category: "Accessories",
  },
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    tag: "Season Sale",
    title: "Big Savings, Every Single Week",
    text: "Fresh deals on selected products — grab your favourites before they are gone.",
    cta: "Shop Now",
    category: "All",
  },
];




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

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showSearch, setShowSearch] = useState(false); // Search bar toggle karne ke liye

  // Cart ab shared hai (CartContext se) — add yahan karo, Cart page par nazar ayega
  const { addToCart } = useCart();

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

  // Banner carousel — har 5 second mein khud agli slide, hover par ruk jata hai
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setCurrentSlide(s => (s + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused]);

  const goToCategory = (cat) => {
    setSelectedCategory(cat);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  // Search filter
 const filteredProducts = products.filter(p =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
  (selectedCategory === "All" || p.category === selectedCategory)
);


  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      <Header
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        showSearch={showSearch}
        onToggleSearch={() => setShowSearch(!showSearch)}
      />

      {/* Hero Banner Carousel */}
      <section
        className="relative overflow-hidden bg-violet-950"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((s, idx) => (
            <div key={idx} className="relative w-full shrink-0 h-[380px] md:h-[480px]">
              <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-950/85 via-violet-950/50 to-transparent"></div>
              <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
                <span className="text-amber-400 font-bold tracking-[0.25em] uppercase text-xs md:text-sm mb-3">{s.tag}</span>
                <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 max-w-2xl">{s.title}</h2>
                <p className="text-violet-100 text-base md:text-lg mb-7 max-w-xl">{s.text}</p>
                <div>
                  <button
                    onClick={() => goToCategory(s.category)}
                    className="bg-amber-500 text-violet-950 px-8 py-3.5 rounded-full font-extrabold hover:bg-amber-400 transition shadow-xl"
                  >
                    {s.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pichli / Agli slide ke arrows */}
        <button
          onClick={() => setCurrentSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white flex items-center justify-center transition"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide(s => (s + 1) % SLIDES.length)}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white flex items-center justify-center transition"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Neeche wale dots — konsi slide chal rahi hai */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${currentSlide === idx ? "w-8 bg-amber-400" : "w-2.5 bg-white/50 hover:bg-white"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

           {/* Products Section */}
      <section id="products" className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-20">

          {/* Section Header + Category Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
            <div>
              <span className="text-amber-500 font-bold tracking-[0.25em] uppercase text-xs">Our Collection</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Featured Products</h2>
              <p className="text-gray-500 mt-2">
                Handpicked just for you — {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "Clothing", "Electronics", "Accessories"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition ${selectedCategory === cat ? "bg-violet-900 text-white shadow-lg" : "bg-white text-gray-700 border border-gray-200 hover:border-violet-400 hover:text-violet-900 shadow-sm"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 mb-10"></div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-gray-200 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-violet-100 rounded-full flex items-center justify-center text-2xl">🔍</div>
              <p className="text-gray-700 font-bold text-lg">No products found</p>
              <p className="text-gray-500 text-sm mt-1">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {filteredProducts.map(p => {
                const onSale = p.oldPrice && Number(p.oldPrice) > Number(p.price);
                const discount = onSale ? Math.round((1 - Number(p.price) / Number(p.oldPrice)) * 100) : 0;
                return (
                  <div key={p.id} className="group bg-white rounded-3xl border-2 border-gray-200 hover:border-violet-500 shadow-md transition-colors duration-300 overflow-hidden flex flex-col">
                    <div className="relative overflow-hidden">
                      <Link to={`/product/${p.id}`}>
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      {onSale && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow">
                          -{discount}% OFF
                        </span>
                      )}
                      {onSale && (
                        <span className="absolute bottom-3 left-3 bg-white text-gray-900 text-xs font-semibold px-4 py-1.5 rounded-full shadow">
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      {p.category && (
                        <span className="text-[11px] font-bold tracking-wider uppercase text-violet-600">{p.category}</span>
                      )}
                      <Link to={`/product/${p.id}`}>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-snug mt-1 line-clamp-2 min-h-10 md:min-h-12 hover:text-violet-900">{p.name}</h3>
                      </Link>
                      {/* Rating — 5 yellow stars + 5.0 (design placeholder) */}
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                        <span className="text-xs font-bold text-gray-700 ml-1.5">5.0</span>
                      </div>
                      <div className="flex items-end justify-between mt-auto pt-2">
                        <div>
                          <p className={`text-xs text-gray-400 line-through h-4 ${onSale ? "" : "invisible"}`}>{onSale ? `Rs ${p.oldPrice}` : "Rs 0"}</p>
                          <p className="font-extrabold text-violet-900 text-base md:text-lg leading-tight">Rs {p.price}</p>
                        </div>
                        <button
                          onClick={() => addToCart(p)}
                          className="bg-violet-900 text-white p-2.5 rounded-full hover:bg-violet-700 hover:scale-110 transition shadow-md flex items-center justify-center shrink-0"
                          title="Add to Cart"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

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

    </div>
  );
}
