// Home page par footer se upar wala "Why Choose Us" section — bharosay walay 4 points
const FEATURES = [
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

export default function WhyChooseUs() {
  return (
    <section className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-16">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-amber-500 font-bold tracking-[0.25em] uppercase text-xs">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Why Shop With Aura Store?</h2>
          <p className="text-gray-500 mt-3">We make online shopping simple, safe and worry-free — just the way it should be.</p>
        </div>

        {/* 4 Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-10">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="bg-white rounded-3xl border-2 border-gray-200 hover:border-violet-500 shadow-sm transition-colors duration-300 p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-violet-900 flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
  );
}
