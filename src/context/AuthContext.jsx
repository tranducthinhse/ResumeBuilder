import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase"; // ✅ Import Supabase

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm cập nhật state user cục bộ (nếu cần đổi avatar ngay lập tức v.v.)
  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  useEffect(() => {
    // 1. Kiểm tra session hiện tại khi F5 trang
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          formatAndSetUser(session.user);
        } else {
          checkGuestMode(); // Nếu không có user, check xem có phải Guest không
        }
      } catch (error) {
        console.error("Auth session check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 2. Lắng nghe sự kiện Login / Logout / Token Refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        formatAndSetUser(session.user);
        setLoading(false);
      } else {
        // Khi logout, check lại xem có muốn về chế độ Guest không
        // Nhưng thường logout xong user mong muốn clear hết
        if (!localStorage.getItem("guest_user")) {
           setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper: Định dạng dữ liệu user từ Supabase cho gọn
  const formatAndSetUser = (supabaseUser) => {
    setUser({
      uid: supabaseUser.id,
      email: supabaseUser.email,
      // Supabase lưu tên, avatar trong user_metadata
      ...supabaseUser.user_metadata, 
      isGuest: false
    });
  };

  // Helper: Check chế độ khách từ LocalStorage
  const checkGuestMode = () => {
    const guestStr = localStorage.getItem("guest_user");
    if (guestStr) {
      setUser(JSON.parse(guestStr));
    } else {
      setUser(null);
    }
  };

  // --- ACTIONS ---

  const startGuest = () => {
    const guest = { uid: "guest_" + Date.now(), email: "Guest User", isGuest: true };
    localStorage.setItem("guest_user", JSON.stringify(guest));
    setUser(guest);
  };

  const logout = async () => {
    // Nếu là Guest
    if (user?.isGuest) {
      localStorage.removeItem("guest_user");
      setUser(null);
      return;
    }

    // Nếu là User thật (Supabase)
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const value = { user, loading, setUser, updateUser, logout, startGuest };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}