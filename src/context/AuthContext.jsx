import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null); // Chỉ set Firebase user
      setLoading(false);
    });
    return unsub;
  }, []);

  const startGuest = () => {
    const guest = { uid: "guest_" + Date.now(), email: "Guest User", isGuest: true };
    localStorage.setItem("guest_user", JSON.stringify(guest));
    setUser(guest);
  };

  const logout = async () => {
    if (user?.isGuest) {
      localStorage.removeItem("guest_user");
      localStorage.removeItem("guest_cvs");
      setUser(null);
      return;
    }
    try {
      await auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const value = { user, loading, setUser, logout, startGuest };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
