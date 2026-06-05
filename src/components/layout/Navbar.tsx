import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Plus, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#2D6A4F] rounded-xl flex items-center justify-center">
            <span className="text-lg">🌿</span>
          </div>
          <span className="font-bold text-[#2D6A4F] text-lg">AgriLink</span>
          <span className="text-xs bg-[#D8F3DC] text-[#2D6A4F] px-2 py-0.5 rounded-full font-medium">
            Bénin
          </span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/marketplace" className="text-sm text-gray-600 hover:text-[#2D6A4F] font-medium transition">
            Marketplace
          </Link>
          {user?.role === "PRODUCTEUR" && (
            <Link
              to="/publier"
              className="flex items-center gap-1.5 text-sm bg-[#F4A261] hover:bg-[#e8935a] text-white px-4 py-2 rounded-xl font-medium transition"
            >
              <Plus size={16} />
              Publier une annonce
            </Link>
          )}
        </div>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#2D6A4F] transition"
              >
                <div className="w-8 h-8 bg-[#D8F3DC] rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <User size={16} className="text-[#2D6A4F]" />
                  )}
                </div>
                <span className="font-medium">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-[#2D6A4F] font-medium">
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-sm bg-[#2D6A4F] hover:bg-[#245a42] text-white px-4 py-2 rounded-xl font-medium transition"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Burger mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-600"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link
            to="/marketplace"
            onClick={() => setMenuOpen(false)}
            className="block text-sm text-gray-600 font-medium py-2"
          >
            🛒 Marketplace
          </Link>
          {user?.role === "PRODUCTEUR" && (
            <Link
              to="/publier"
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-[#F4A261] font-medium py-2"
            >
              ➕ Publier une annonce
            </Link>
          )}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-gray-600 font-medium py-2"
              >
                👤 Mon Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block text-sm text-red-500 font-medium py-2"
              >
                🚪 Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 font-medium py-2">
                Connexion
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-sm text-[#2D6A4F] font-medium py-2">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}