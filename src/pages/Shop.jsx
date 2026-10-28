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
