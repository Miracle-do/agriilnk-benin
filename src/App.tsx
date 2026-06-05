import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Marketplace from "@/pages/Marketplace";
import PublierAnnonce from "@/pages/PublierAnnonce";
import ProduitDetail from "@/pages/ProduitDetail";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Pages sans navbar */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Pages avec navbar */}
      <Route element={<Layout />}>
      <Route path="/produit/:id" element={<ProduitDetail />} />
      <Route path="/publier" element={<ProtectedRoute><PublierAnnonce /></ProtectedRoute>} />
       <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/marketplace" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}