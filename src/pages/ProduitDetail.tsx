import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/types";
import { MapPin,Phone,  ArrowLeft, ShoppingCart, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import StarRating from "@/components/ui/StarRating";
import ReviewModal from "@/components/ui/ReviewModal";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: unknown;
}

export default function ProduitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchReviews = async () => {
    if (!id) return;
    const q = query(collection(db, "reviews"), where("productId", "==", id));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Review[];
    setReviews(data);
  };

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
    fetchReviews();
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

          <div className="flex items-center gap-1 text-sm text-gray-400 mb-2">
            <MapPin size={14} />
            <span>{product.commune}, {product.department}</span>
          </div>

          {(product as Product & { rating?: number; reviewCount?: number }).rating && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating
                rating={(product as Product & { rating?: number }).rating}
                readonly
                size={16}
              />
              <span className="text-sm text-gray-400">
                ({(product as Product & { reviewCount?: number }).reviewCount || 0} avis)
              </span>
            </div>
          )}

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

      {/* Avis */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Avis ({reviews.length})
          </h2>
          {user && user.id !== product.sellerId && !reviewSuccess && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-2 text-sm bg-[#F4A261] hover:bg-[#e8935a] text-white font-medium px-4 py-2 rounded-xl transition"
            >
              <Star size={16} />
              Laisser un avis
            </button>
          )}
          {reviewSuccess && (
            <span className="text-sm text-green-600 font-medium">✅ Avis envoyé !</span>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <span className="text-4xl">⭐</span>
            <p className="text-gray-400 mt-3">Aucun avis pour ce produit</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">{review.userName}</p>
                  <StarRating rating={review.rating} readonly size={16} />
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showReviewModal && (
        <ReviewModal
          sellerId={product.sellerId}
          sellerName={product.sellerName}
          productId={product.id}
          productTitle={product.title}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            setReviewSuccess(true);
            fetchReviews();
          }}
        />
      )}
    </div>
  );
}