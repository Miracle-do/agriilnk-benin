import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { uploadImage } from "@/lib/cloudinary";
import { ImagePlus, X, Loader } from "lucide-react";

const CATEGORIES = [
  "Céréales", "Maraîchage", "Fruits",
  "Tubercules", "Légumineuses", "Anacarde", "Élevage"
];

const DEPARTMENTS = [
  "Alibori", "Atacora", "Atlantique", "Borgou",
  "Collines", "Couffo", "Donga", "Littoral",
  "Mono", "Ouémé", "Plateau", "Zou"
];

export default function PublierAnnonce() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    unit: "",
    quantity: "",
    category: "",
    department: user?.department || "",
    commune: user?.commune || "",
  });

  if (user?.role !== "PRODUCTEUR") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <span className="text-5xl">🚫</span>
        <h2 className="text-xl font-bold text-gray-700 mt-4">Accès réservé aux producteurs</h2>
        <p className="text-gray-400 mt-2">Seuls les producteurs peuvent publier des annonces.</p>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 4) {
      setError("Maximum 4 photos par annonce");
      return;
    }

    setUploadingImages(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }
      setImages([...images, ...uploadedUrls]);
    } catch {
      setError("Erreur lors de l'upload des photos");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.category) {
      setError("Veuillez choisir une catégorie");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        unit: form.unit,
        quantity: parseInt(form.quantity),
        category: form.category,
        department: form.department,
        commune: form.commune,
        images: images,
        available: true,
        sellerId: user.id,
        sellerName: user.name,
        sellerPhone: user.phone || "",
        createdAt: serverTimestamp(),
      });

      navigate("/marketplace");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la publication. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Publier une annonce</h1>
        <p className="text-gray-500 mt-1">Renseignez les informations de votre produit</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">

        {/* Upload photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos du produit <span className="text-gray-400 font-normal">(max 4)</span>
          </label>

          <div className="grid grid-cols-4 gap-3">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={url}
                  alt={"photo " + (index + 1)}
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {images.length < 4 && (
              <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#2D6A4F] transition">
                {uploadingImages ? (
                  <Loader size={20} className="text-gray-400 animate-spin" />
                ) : (
                  <>
                    <ImagePlus size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Ajouter</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
              </label>
            )}
          </div>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
          <input
            type="text" name="title" value={form.title}
            onChange={handleChange} required placeholder="Ex: Maïs local blanc"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]"
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            name="category" value={form.category}
            onChange={handleChange} required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F]"
          >
            <option value="">Choisir une catégorie</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description" value={form.description}
            onChange={handleChange} required rows={4}
            placeholder="Décrivez votre produit : qualité, variété, conditions de stockage..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] resize-none"
          />
        </div>

        {/* Prix + Unité */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
            <input
              type="number" name="price" value={form.price}
              onChange={handleChange} required min="0" placeholder="Ex: 15000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
            <input
              type="text" name="unit" value={form.unit}
              onChange={handleChange} required placeholder="Ex: sac 100kg"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]"
            />
          </div>
        </div>

        {/* Quantité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantité disponible</label>
          <input
            type="number" name="quantity" value={form.quantity}
            onChange={handleChange} required min="1" placeholder="Ex: 50"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]"
          />
        </div>

        {/* Département + Commune */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
            <select
              name="department" value={form.department}
              onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F]"
            >
              <option value="">Choisir</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
            <input
              type="text" name="commune" value={form.commune}
              onChange={handleChange} required placeholder="Ex: Bohicon"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]"
            />
          </div>
        </div>

        <button
          type="submit" disabled={loading || uploadingImages}
          className="w-full bg-[#2D6A4F] hover:bg-[#245a42] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? "Publication en cours..." : "Publier l'annonce"}
        </button>
      </form>
    </div>
  );
}