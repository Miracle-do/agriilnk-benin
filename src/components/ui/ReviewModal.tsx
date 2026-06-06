import { useState } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { createNotification } from "@/lib/notifications";
import StarRating from "./StarRating";
import { X } from "lucide-react";

interface ReviewModalProps {
  sellerId: string;
  sellerName: string;
  productId: string;
  productTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  sellerId,
  sellerName,
  productId,
  productTitle,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!user) return;
    if (rating === 0) {
      setError("Veuillez choisir une note");
      return;
    }

    setLoading(true);
    try {
      // Vérifier si l'utilisateur a déjà noté ce produit
      const existing = await getDocs(
        query(
          collection(db, "reviews"),
          where("productId", "==", productId),
          where("userId", "==", user.id)
        )
      );

      if (!existing.empty) {
        setError("Vous avez déjà noté ce produit");
        return;
      }

      // Ajouter l'avis
      await addDoc(collection(db, "reviews"), {
        productId,
        productTitle,
        sellerId,
        sellerName,
        userId: user.id,
        userName: user.name,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });

      // Recalculer la moyenne du produit
      const allReviews = await getDocs(
        query(collection(db, "reviews"), where("productId", "==", productId))
      );

      const total = allReviews.docs.reduce((sum, d) => sum + d.data().rating, 0);
      const average = total / allReviews.docs.length;

      await updateDoc(doc(db, "products", productId), {
        rating: Math.round(average * 10) / 10,
        reviewCount: allReviews.docs.length,
      });

      // Notifier le vendeur
      await createNotification(
        sellerId,
        "Nouvel avis sur votre produit",
        user.name + " a laissé " + rating + " étoile(s) sur " + productTitle,
        "info",
        "/dashboard"
      );

      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Noter ce produit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-2">Produit</p>
        <p className="font-semibold text-gray-800 mb-6">{productTitle}</p>

        <p className="text-sm text-gray-500 mb-2">Votre note</p>
        <div className="mb-6">
          <StarRating rating={rating} onRate={setRating} size={32} />
        </div>

        <p className="text-sm text-gray-500 mb-2">Commentaire (optionnel)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Partagez votre expérience..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F] resize-none mb-4"
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#2D6A4F] hover:bg-[#245a42] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Envoi en cours..." : "Envoyer mon avis"}
        </button>
      </div>
    </div>
  );
}