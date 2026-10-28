import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [onSale, setOnSale] = useState(false);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Clothing");

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // Yahan apni ImgBB API Key dalein
  const IMGBB_API_KEY = "f0aa6a980b771529c1146ba8d5ba7411";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image before submitting.");
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
        throw new Error("Image upload failed. Please try again.");
      }

      const imageUrl = data.data.url; // ImgBB ka direct image link

      // 3. Firestore mein product save karna
      let finalPrice = Number(price);
      let finalOldPrice = null;
      // Sale sirf tab, jab switch ON ho aur Old Price bhari gayi ho
      if (onSale && oldPrice) {
        finalOldPrice = Number(oldPrice);
        // Agar prices ulti bhar di jayen to khud seedha kar do
        if (finalOldPrice < finalPrice) {
          const temp = finalPrice;
          finalPrice = finalOldPrice;
          finalOldPrice = temp;
        }
      }
      await addDoc(collection(db, "products"), {
        name,
        price: finalPrice,
        oldPrice: finalOldPrice,
        description,
        category,
        image: imageUrl,
      });

      alert("Product added successfully!");
      nav("/admin");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-violet-50 p-4">
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

          <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-lg p-3">
            <span className="text-sm font-medium text-gray-700">Put this product on Sale?</span>
            <button
              type="button"
              onClick={() => setOnSale(!onSale)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${onSale ? "bg-violet-900 text-white" : "bg-gray-200 text-gray-600"}`}
            >
              {onSale ? "ON" : "OFF"}
            </button>
          </div>

          {onSale && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Old Price (Sale se pehle wali price)</label>
              <input
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-violet-600"
                placeholder="E.g., 5000"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-900"
              placeholder="Please provide a brief description of the product."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-violet-600 bg-white"
            >
              <option value="Clothing">Clothing</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
            </select>
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
            className="w-full bg-violet-900 text-white py-3 rounded-xl font-bold hover:bg-violet-800 transition shadow-lg mt-4 disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Save Product"}
          </button>

          <button
            type="button"
            onClick={() => nav("/admin")}
            className="w-full text-gray-500 hover:text-gray-800 text-sm mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
