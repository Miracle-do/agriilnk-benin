import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "PRODUCTEUR" | "ACHETEUR";
  department?: string;
  commune?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = async (data: RegisterData) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    await updateProfile(firebaseUser, { displayName: data.name });
    const userData = {
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      role: data.role,
      department: data.department || "",
      commune: data.commune || "",
      avatar: "",
      createdAt: new Date(),
    };
    await setDoc(doc(db, "users", firebaseUser.uid), userData);
    setUser({ id: firebaseUser.uid, ...userData });
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (!userDoc.exists()) {
      const userData = {
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        phone: "",
        role: "ACHETEUR" as const,
        department: "",
        commune: "",
        avatar: firebaseUser.photoURL || "",
        createdAt: new Date(),
      };
      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      setUser({ id: firebaseUser.uid, ...userData });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithEmail, loginWithGoogle, register, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export { useAuth };