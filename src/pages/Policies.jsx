import Header from "../components/Header";

// Teeno policy pages ka aik hi saaf design
function PolicyLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBack />
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-400 mt-2">Last updated: October 2026</p>
          <div className="w-full h-px bg-gray-100 my-6"></div>
          <div className="text-gray-600 leading-relaxed space-y-6 text-[15px]">{children}</div>
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 mt-8">
            <p className="font-bold text-gray-900">Questions?</p>
            <p className="text-sm mt-1">
              Contact us on WhatsApp <span className="font-semibold text-gray-900">0328 4433025</span>, call{" "}
              <span className="font-semibold text-gray-900">+92 328 4433025</span> or email{" "}
              <span className="font-semibold text-gray-900">support@aurastore.com</span> (Mon–Sat, 9:00 AM – 6:00 PM).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function H2({ children }) {
  return <h2 className="text-lg font-extrabold text-gray-900">{children}</h2>;
}

// ---------------- Shipping & Delivery ----------------
export function ShippingInfo() {
  return (
    <PolicyLayout title="Shipping & Delivery">
      <div>
        <H2>Delivery Areas</H2>
        <p className="mt-2">We deliver all across Pakistan — every city and town, straight to your doorstep.</p>
      </div>
      <div>
        <H2>Delivery Time</H2>
        <p className="mt-2">
          Orders are packed and dispatched within 1–2 working days. Delivery usually takes 2–4 working days for major
          cities and 3–5 working days for other areas. In rare cases (bad weather, strikes or courier delays) delivery
          may take a little longer — we appreciate your patience.
        </p>
      </div>
      <div>
        <H2>Shipping Charges</H2>
        <p className="mt-2">
          A flat shipping fee of <strong className="text-gray-900">Rs 250</strong> applies to every order. The exact
          total, including shipping, is always shown to you before you place your order — no hidden charges.
        </p>
      </div>
      <div>
        <H2>Cash on Delivery</H2>
        <p className="mt-2">
          All orders are Cash on Delivery. You pay in cash to the courier only when your parcel arrives — no advance
          payment is required.
        </p>
      </div>
      <div>
        <H2>Order Confirmation</H2>
        <p className="mt-2">
          After you place an order, our team may call or WhatsApp you to confirm your details before dispatch. Please
          make sure your phone number and address are correct so your order is not delayed.
        </p>
      </div>
    </PolicyLayout>
  );
}

// ---------------- Refund & Exchange ----------------
export function RefundPolicy() {
  return (
    <PolicyLayout title="Refund & Exchange Policy">
      <div>
        <H2>7-Day Easy Exchange</H2>
        <p className="mt-2">
          If you change your mind, you can exchange any unused item within 7 days of delivery. The item must be
          unused, unwashed and returned with its original tags and packaging.
        </p>
      </div>
      <div>
        <H2>Damaged or Wrong Item</H2>
        <p className="mt-2">
          If you receive a damaged, defective or wrong item, please inform us within 48 hours of delivery and share a
          photo on WhatsApp. We will arrange a replacement or a full refund — whichever you prefer.
        </p>
      </div>
      <div>
        <H2>How Refunds Work</H2>
        <p className="mt-2">
          Since orders are Cash on Delivery, approved refunds are sent to you through bank transfer, JazzCash or
          Easypaisa within 5–7 working days after we receive the returned item and check it.
        </p>
      </div>
      <div>
        <H2>Non-Returnable Items</H2>
        <p className="mt-2">
          For hygiene and safety reasons, items that have been used or washed cannot be returned or exchanged, unless
          they arrived damaged or defective.
        </p>
      </div>
      <div>
        <H2>How to Start a Return</H2>
        <p className="mt-2">
          Simply message us on WhatsApp at 0328 4433025 with your name and order details, and our team will guide you
          through the process.
        </p>
      </div>
    </PolicyLayout>
  );
}

// ---------------- Privacy Policy ----------------
export function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <div>
        <H2>Information We Collect</H2>
        <p className="mt-2">
          When you place an order or contact us, we collect only the details needed to serve you: your name, phone
          number, delivery address and the details of your order.
        </p>
      </div>
      <div>
        <H2>How We Use Your Information</H2>
        <ul className="mt-2 list-disc pl-5 space-y-1.5">
          <li>To process, confirm and deliver your orders</li>
          <li>To contact you about your order (call or WhatsApp)</li>
          <li>To handle returns, exchanges and support requests</li>
          <li>To improve our store and service</li>
        </ul>
      </div>
      <div>
        <H2>We Never Sell Your Data</H2>
        <p className="mt-2">
          Your personal information is never sold or rented to anyone. It is shared only with the courier company,
          and only as much as is needed to deliver your parcel.
        </p>
      </div>
      <div>
        <H2>Data Security</H2>
        <p className="mt-2">
          Your order data is stored securely using Google Firebase services, and access is limited to our store team.
        </p>
      </div>
      <div>
        <H2>Your Rights</H2>
        <p className="mt-2">
          You can ask us at any time to correct or delete your personal information. Just contact us on WhatsApp or
          email and we will take care of it.
        </p>
      </div>
    </PolicyLayout>
  );
}
