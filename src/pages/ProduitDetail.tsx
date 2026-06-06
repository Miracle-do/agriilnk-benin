import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/types";
import { MapPin, Phone, ArrowLeft, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProduitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [contacted, setContacted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 bg-gray-100 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-100 rounded mb-4 w-2/3" />
        <div className="h-4 bg-gray-100 rounded mb-2" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl">😕</span>
        <h2 className="text-xl font-bold text-gray-700 mt-4">Produit introuvable</h2>
        <button
          onClick={() => navigate("/marketplace")}
          className="mt-4 text-[#2D6A4F] font-medium"
        >
          Retour à la marketplace
        </button>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/marketplace")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2D6A4F] transition mb-6"
      >
        <ArrowLeft size={16} />
        Retour à la marketplace
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-72 md:h-96 bg-[#D8F3DC] rounded-2xl flex items-center justify-center overflow-hidden">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl">🌿</span>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
            <span className="text-xs bg-[#D8F3DC] text-[#2D6A4F] px-3 py-1 rounded-full font-medium ml-2 flex-shrink-0">
              {product.category}
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
            <MapPin size={14} />
            <span>{product.commune}, {product.department}</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="bg-[#F8FAF5] rounded-xl p-4 mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-[#2D6A4F]">
                {product.price.toLocaleString("fr-FR")}
              </span>
              <span className="text-gray-500">FCFA / {product.unit}</span>
            </div>
            <p className="text-sm text-gray-400">
              Quantité disponible :{" "}
              <span className="font-medium text-gray-600">
                {product.quantity} {product.unit}
              </span>
            </p>
          </div>

          {user && user.id !== product.sellerId && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité souhaitée
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#2D6A4F] transition"
                >
                  -
                </button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#2D6A4F] transition"
                >
                  +
                </button>
                <span className="text-sm text-gray-400 ml-2">
                  Total :{" "}
                  <span className="font-bold text-[#2D6A4F]">
                    {totalPrice.toLocaleString("fr-FR")} FCFA
                  </span>
                </span>
              </div>
            </div>
          )}

          {user ? (
            user.id === product.sellerId ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-3 text-sm text-center">
                C'est votre annonce
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/messages?userId=" + product.sellerId + "&userName=" + product.sellerName)}
                  className="w-full flex items-center justify-center gap-2 bg-[#2D6A4F] hover:bg-[#245a42] text-white font-semibold py-3 rounded-xl transition"
                >
                  <ShoppingCart size={18} />
                  Contacter le vendeur
                </button>
                {contacted && (
                  <div className="bg-[#D8F3DC] border border-[#52B788] text-[#2D6A4F] rounded-xl p-4 text-sm">
                    <p className="font-semibold mb-1">📞 Coordonnées du vendeur</p>
                    <p className="font-bold text-lg">{product.sellerName}</p>
                    {product.sellerPhone && (
                      
                        <a href={"tel:" + product.sellerPhone}
                        className="flex items-center gap-2 mt-2 text-[#2D6A4F] font-medium"
                      >
                        <Phone size={16} />
                        {product.sellerPhone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#2D6A4F] hover:bg-[#245a42] text-white font-semibold py-3 rounded-xl transition"
            >
              Connectez-vous pour contacter le vendeur
            </button>
          )}
        </div>
      </div>
    </div>
  );
}