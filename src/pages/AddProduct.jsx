import { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [onSale, setOnSale] = useState(false);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Home & Kitchen");

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // Edit mode: jab URL me ?edit=<product id> ho to yehi page us product ko edit kare ga
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [existingImage, setExistingImage] = useState("");

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const snap = await getDoc(doc(db, "products", editId));
      if (snap.exists()) {
        const p = snap.data();
        setName(p.name || "");
        setPrice(p.price ?? "");
        setDescription(p.description || "");
        setCategory(p.category || "Home & Kitchen");
        setExistingImage(p.image || "");
        if (p.oldPrice) {
          setOnSale(true);
          setOldPrice(p.oldPrice);
        }
      }
    })();
  }, [editId]);

  // ===== Cloudinary image upload (2026-11-03) =====
  // Photo ab Firestore database ke ANDAR (data URL) save NAHI hoti — wahi site ki slow loading ki wajah thi.
  // Photo Cloudinary par jati hai aur database me sirf us ka chhota sa link save hota hai,
  // is liye website tez khulti hai. (Cloud name aur preset public hain — koi secret nahi.)
  const CLOUDINARY_CLOUD = "dlqzjthos";
  const CLOUDINARY_PRESET = "aura_unsigned";

  // Bari photo ko upload se pehle halka sa resize karna, taake upload tez ho
  const compressToBlob = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX || height > MAX) {
            const scale = MAX / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Image process nahi ho saki"))),
            "image/jpeg",
            0.82
          );
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Photo Cloudinary par bhejna aur us ka tez (auto-format/quality) link wapas lena
  const uploadToCloudinary = async (file) => {
    const blob = await compressToBlob(file);
    const form = new FormData();
    form.append("file", blob, "product.jpg");
    form.append("upload_preset", CLOUDINARY_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      throw new Error(data?.error?.message || "Photo upload fail ho gayi");
    }
    // Delivery link me auto format + auto quality + max width 1000 — photo har phone par tez khule gi
    return data.secure_url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_1000,c_limit/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image && !editId) {
      alert("Please select an image before submitting.");
      return;
    }

    setLoading(true);
    try {
      // Image: edit mode me purani image hi rahe gi, jab tak nayi na chuni jaye
      let imageUrl = existingImage;
      if (image) {
        // Photo Cloudinary par jayegi, database me sirf us ka link save hoga (site tez rakhne ke liye)
        imageUrl = await uploadToCloudinary(image);
      }

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
      const productData = {
        name,
        price: finalPrice,
        oldPrice: finalOldPrice,
        description,
        category,
        image: imageUrl,
      };

      if (editId) {
        // Edit mode: purana product hi update hoga, naya nahi bane ga
        await updateDoc(doc(db, "products", editId), productData);
        alert("Product updated successfully!");
      } else {
        await addDoc(collection(db, "products"), { ...productData, createdAt: serverTimestamp() });
        alert("Product added successfully!");
      }
      nav("/admin");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-violet-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{editId ? "Edit Product" : "Add New Product"}</h2>

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
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Gadgets & Electronics">Gadgets & Electronics</option>
              <option value="Fashion & Accessories">Fashion & Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            {editId && existingImage && !image && (
              <div className="mb-2">
                <img src={existingImage} alt="Current" className="w-24 h-24 object-cover rounded-lg border" />
                <p className="text-xs text-gray-500 mt-1">Current image — nayi file sirf tab chunein jab image badalni ho.</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              required={!editId}
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border p-2 rounded-lg bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-900 text-white py-3 rounded-xl font-bold hover:bg-violet-800 transition shadow-lg mt-4 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : editId ? "Update Product" : "Save Product"}
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
