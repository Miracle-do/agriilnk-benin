import { Link } from "react-router-dom";
import { ShoppingBag, Truck, Shield, TrendingUp, ArrowRight } from "lucide-react";

const features = [
  {
    icon: "🌾",
    title: "Producteurs vérifiés",
    description: "Achetez directement auprès d'agriculteurs béninois de confiance.",
  },
  {
    icon: "💰",
    title: "Prix justes",
    description: "Pas d'intermédiaires. Les producteurs fixent leurs propres prix.",
  },
  {
    icon: "📍",
    title: "Partout au Bénin",
    description: "Des produits disponibles dans les 12 départements du Bénin.",
  },
  {
    icon: "📱",
    title: "Simple et rapide",
    description: "Trouvez, contactez et achetez en quelques clics.",
  },
];

const categories = [
  { emoji: "🌽", name: "Céréales" },
  { emoji: "🍅", name: "Maraîchage" },
  { emoji: "🥭", name: "Fruits" },
  { emoji: "🍠", name: "Tubercules" },
  { emoji: "🫘", name: "Légumineuses" },
  { emoji: "🥜", name: "Anacarde" },
  { emoji: "🐄", name: "Élevage" },
];

const stats = [
  { value: "12", label: "Départements", icon: <Shield size={20} /> },
  { value: "100+", label: "Producteurs", icon: <TrendingUp size={20} /> },
  { value: "500+", label: "Produits", icon: <ShoppingBag size={20} /> },
  { value: "24h", label: "Livraison rapide", icon: <Truck size={20} /> },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2D6A4F] to-[#52B788] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🌿 La plateforme agricole du Bénin
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Connectons les agriculteurs aux acheteurs
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            AgriLink Bénin facilite la vente directe de produits agricoles entre producteurs et acheteurs dans tout le Bénin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/marketplace"
              className="flex items-center justify-center gap-2 bg-white text-[#2D6A4F] font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 transition"
            >
              <ShoppingBag size={20} />
              Explorer la marketplace
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-4 rounded-2xl transition"
            >
              Devenir producteur
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center text-[#2D6A4F] mb-2">{stat.icon}</div>
              <p className="text-3xl font-bold text-[#2D6A4F]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catégories */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Toutes les catégories
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Des produits frais directement des champs béninois
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={"/marketplace"}
                className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:border-[#2D6A4F] hover:shadow-sm transition group"
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <p className="text-xs font-medium text-gray-600 group-hover:text-[#2D6A4F]">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Pourquoi AgriLink Bénin ?
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Une solution pensée pour les agriculteurs et acheteurs béninois
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-[#2D6A4F] transition"
              >
                <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-[#2D6A4F] to-[#52B788] rounded-3xl p-12 text-white">
          <span className="text-5xl mb-4 block">🌱</span>
          <h2 className="text-2xl font-bold mb-3">Prêt à commencer ?</h2>
          <p className="text-white/80 mb-8">
            Rejoignez des centaines de producteurs et acheteurs qui font confiance à AgriLink Bénin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="bg-white text-[#2D6A4F] font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition"
            >
              Créer un compte gratuit
            </Link>
            <Link
              to="/marketplace"
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-xl transition"
            >
              Explorer les produits
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-4 text-center text-sm text-gray-400">
        <p>© 2025 AgriLink Bénin — La plateforme agricole du Bénin 🌿</p>
      </footer>
    </div>
  );
}