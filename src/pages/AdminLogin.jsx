import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      nav("/admin"); // Login successful, go to admin panel
    } catch (err) {
      setError("Incorrect email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-violet-900 to-violet-700 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
        {/* Aura Store Logo — bilkul header wala */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-violet-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-3xl font-extrabold tracking-tight mt-3">
            <span className="text-violet-950">Aura</span><span className="text-amber-500">Store</span>
          </p>
          <p className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mt-1">Premium Shopping</p>
          <div className="w-12 h-px bg-gray-200 mx-auto my-5"></div>
          <h1 className="text-xl font-extrabold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your store</p>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}
        
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-violet-900 text-white py-3 rounded-xl font-bold hover:bg-violet-800 transition shadow-lg mt-2"
          >
            Login
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">Authorized access only · Aura Store Management</p>
      </div>
    </div>
  );
}