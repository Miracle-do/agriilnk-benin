import { useState, useEffect } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, MapPin, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "PRODUCTEUR") {
      fetchMyProducts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyProducts = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "products"),
        where("sellerId", "==", user.id)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Product[];
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#2D6A4F]">
            Bonjour, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user.role === "PRODUCTEUR" ? "🌾 Producteur" : "🛒 Acheteur"} •{" "}
            {user.commune && user.department ? `${user.commune}, ${user.department}` : user.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Rôle</p>
          <p className="font-semibold text-gray-700">
            {user.role === "PRODUCTEUR" ? "Producteur" : "Acheteur"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Email</p>
          <p className="font-semibold text-gray-700 text-sm truncate">{user.email}</p>
        </div>
        {user.phone && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">Téléphone</p>
            <p className="font-semibold text-gray-700">{user.phone}</p>
          </div>
        )}
      </div>

      {/* Section Producteur */}
      {user.role === "PRODUCTEUR" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Mes annonces</h2>
            <Link
              to="/publier"
              className="flex items-center gap-2 bg-[#2D6A4F] hover:bg-[#245a42] text-white text-sm font-medium px-4 py-2 rounded-xl transition"
            >
              <Plus size={16} />
              Nouvelle annonce
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <span className="text-5xl">🌱</span>
              <p className="text-gray-500 mt-4">Vous n'avez pas encore d'annonces</p>
              <Link
                to="/publier"
                className="inline-block mt-4 bg-[#2D6A4F] text-white text-sm font-medium px-6 py-2.5 rounded-xl"
              >
                Publier ma première annonce
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-[#D8F3DC] rounded-xl flex items-center justify-center flex-shrink-0">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-2xl">🌿</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{product.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin size={11} />
                      <span>{product.commune}, {product.department}</span>
                    </div>
                    <p className="text-sm font-bold text-[#2D6A4F] mt-1">
                      {product.price.toLocaleString("fr-FR")} FCFA / {product.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.available
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {product.available ? "Disponible" : "Indisponible"}
                    </span>
                    <Link
                      to={"/produit/" + product.id}
                      className="p-2 text-gray-400 hover:text-[#2D6A4F] transition"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section Acheteur */}
      {user.role === "ACHETEUR" && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <span className="text-5xl">🛒</span>
          <p className="text-gray-500 mt-4 text-lg">Découvrez nos produits agricoles</p>
          <Link
            to="/marketplace"
            className="inline-block mt-4 bg-[#2D6A4F] text-white text-sm font-medium px-6 py-2.5 rounded-xl"
          >
            Aller à la marketplace
          </Link>
        </div>
      )}
    </div>
  );
}