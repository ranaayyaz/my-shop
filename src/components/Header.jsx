import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Website ka shared header — har page par bilkul aik jaisa nazar ata hai.
// Search sirf Home (Shop) page par kaam karti hai, is liye wahan se search ki values ati hain.
// Baaki pages par sirf logo, cart aur Back to Shop ayega — design bilkul same rahega.
export default function Header({ searchTerm, onSearchChange, showSearch, onToggleSearch, showBack = false }) {
  const { totalItems } = useCart();
  const hasSearch = typeof onSearchChange === "function";

  return (
    <>
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

            {/* Search Bar (Desktop — sirf Home page par, jahan search kaam karti hai) */}
            {hasSearch && (
              <div className="hidden md:block flex-1 max-w-xl relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={onSearchChange}
                  className="w-full bg-white/10 border border-white/20 rounded-full py-2.5 pl-5 pr-12 text-sm text-white placeholder:text-violet-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 focus:border-white transition"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-4 top-2.5 text-violet-200 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}

            {/* Icons */}
            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">

              {/* Back to Shop (Home ke ilawa baaki pages par) */}
              {showBack && (
                <Link to="/" className="hidden sm:block text-sm font-semibold hover:text-amber-400 transition mr-1">
                  &larr; Back to Shop
                </Link>
              )}

              {/* Search Icon (sirf mobile par aur sirf Home page par) */}
              {hasSearch && (
                <button onClick={onToggleSearch} className="md:hidden w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition" title="Search">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

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

        {/* Dropdown Search Bar (Mobile — icon click par, sirf Home page par) */}
        {hasSearch && showSearch && (
          <div className="md:hidden absolute top-full left-0 w-full bg-violet-950 border-t border-white/10 p-4 shadow-xl">
            <div className="max-w-3xl mx-auto relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full bg-white/10 text-white border border-white/20 rounded-full py-2.5 px-4 pl-11 focus:outline-none focus:border-amber-400 placeholder:text-violet-200 transition"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-3 text-violet-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
