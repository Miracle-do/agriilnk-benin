import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/types";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  "Tous", "Céréales", "Maraîchage", "Fruits",
  "Tubercules", "Légumineuses", "Anacarde", "Élevage"
];

const DEPARTMENTS = [
  "Tous", "Alibori", "Atacora", "Atlantique", "Borgou",
  "Collines", "Couffo", "Donga", "Littoral",
  "Mono", "Ouémé", "Plateau", "Zou"
];

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [department, setDepartment] = useState("Tous");
  const [showFilters, setShowFilters] = useState(false);

const fetchProducts = async () => {
    try {
      const q = query(
        collection(db, "products"),
        where("available", "==", true),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(data);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Tous" || p.category === category;
    const matchDepartment = department === "Tous" || p.department === department;
    return matchSearch && matchCategory && matchDepartment;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D6A4F]">Marketplace Agricole</h1>
        <p className="text-gray-500 mt-1">Achetez directement auprès des producteurs béninois</p>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher maïs, tomates, igname..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] bg-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition ${
            showFilters
              ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#2D6A4F]"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filtres
        </button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Département</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Catégories pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              category === c
                ? "bg-[#2D6A4F] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[#2D6A4F]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="h-40 bg-gray-100 rounded-xl mb-4" />
              <div className="h-4 bg-gray-100 rounded mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl">🌾</span>
          <p className="text-gray-500 mt-4 text-lg">Aucun produit trouvé</p>
          <p className="text-gray-400 text-sm mt-1">Essayez d'autres filtres ou revenez plus tard</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} produit(s) disponible(s)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <Link
                key={product.id}
                to={`/produit/${product.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div className="h-44 bg-[#D8F3DC] flex items-center justify-center">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🌿</span>
                  )}
                </div>

                {/* Infos */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-[#2D6A4F] transition">
                      {product.title}
                    </h3>
                    <span className="text-xs bg-[#D8F3DC] text-[#2D6A4F] px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                      {product.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>

                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <MapPin size={12} />
                    <span>{product.commune}, {product.department}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#2D6A4F]">
                        {product.price.toLocaleString("fr-FR")} FCFA
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/ {product.unit}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      Qté: {product.quantity}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-500">🧑‍🌾 {product.sellerName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}