import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Message Firebase mein save karna
      await addDoc(collection(db, "messages"), {
        name: form.name,
        email: form.email,
        message: form.message,
        createdAt: serverTimestamp(),
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", email: "", message: "" });
      }, 3000);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Header */}
      <header className="bg-violet-900 text-white py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold tracking-widest uppercase flex items-center gap-2">
            <span>🛒</span> Aura Store
          </Link>
          <Link to="/" className="text-sm font-semibold hover:text-violet-200 transition">
            &larr; Back to Shop
          </Link>
        </div>
      </header>

      {/* Contact Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-gray-500">Have a question or need help with your order? We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Contact Info */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-violet-50 p-3 rounded-full text-xl">📍</div>
                <div>
                  <h3 className="font-bold text-gray-800">Our Location</h3>
                  <p className="text-gray-500 text-sm">Lahore, Pakistan</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-violet-50 p-3 rounded-full text-xl">📞</div>
                <div>
                  <h3 className="font-bold text-gray-800">Phone Number</h3>
                  <p className="text-gray-500 text-sm">+92 328 4433025</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-violet-50 p-3 rounded-full text-xl">✉️</div>
                <div>
                  <h3 className="font-bold text-gray-800">Email Address</h3>
                  <p className="text-gray-500 text-sm">support@aurastore.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-semibold">
                ✅ Message sent successfully! We'll reply soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <textarea 
                  placeholder="Your Message" 
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button type="submit" className="w-full bg-violet-900 text-white py-3 rounded-xl font-bold hover:bg-violet-800 transition shadow-lg">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}