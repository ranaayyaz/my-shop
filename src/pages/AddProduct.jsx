import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // Yahan apni ImgBB API Key dalein
  const IMGBB_API_KEY = "f0aa6a980b771529c1146ba8d5ba7411";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Product ki image select karein!");
      return;
    }

    setLoading(true);
    try {
      // 1. Image ko FormData mein dalna
      const formData = new FormData();
      formData.append("image", image);

      // 2. ImgBB API par image upload karna
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Image upload nahi hui. API Key check karein.");
      }

      const imageUrl = data.data.url; // ImgBB ka direct image link

      // 3. Firestore mein product save karna
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        description,
        image: imageUrl,
      });

      alert("Product successfully add ho gaya!");
      nav("/admin"); 
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  // ... (Baaki ka form wala code bilkul same rahega jo pehle tha) ...
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Product</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-900"
              placeholder="E.g., Premium T-Shirt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-900"
              placeholder="E.g., 1500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-900"
              placeholder="Product ki tafseel..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border p-2 rounded-lg bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg mt-4 disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Save Product"}
          </button>
          
          <button
            type="button"
            onClick={() => nav("/admin")}
            className="w-full text-gray-500 hover:text-gray-800 text-sm mt-2"
          >
            Wapas jayen
          </button>
        </form>
      </div>
    </div>
  );
}