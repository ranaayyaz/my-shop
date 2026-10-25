import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "messages"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Naye messages sabse upar
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMessages(list);
    });
    return () => unsub();
  }, []);

  const deleteMessage = async (id) => {
    if (window.confirm("Kya aap ye message delete karna chahte hain?")) {
      await deleteDoc(doc(db, "messages", id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Customer Messages</h1>
          <Link to="/admin" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800">
            &larr; Back to Orders
          </Link>
        </div>

        {messages.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500 text-lg">Abhi tak koi message nahi aaya.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-3 border-b pb-2">
                <div>
                  <p className="font-bold text-gray-900">{m.name}</p>
                  <p className="text-sm text-blue-600">{m.email}</p>
                </div>
                <button onClick={() => deleteMessage(m.id)} className="text-red-400 hover:text-red-600">🗑️</button>
              </div>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}