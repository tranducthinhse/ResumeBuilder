import React, { useState } from "react";
// 👇 Import Supabase (Lưu ý đường dẫn ../../)
import { supabase } from "../../services/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { SiLinkedin } from "react-icons/si";
import { FaLock } from "react-icons/fa";

// 👇 QUAN TRỌNG: Phải có chữ "default" ở đây
export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { startGuest } = useAuth();

  // =========================
  // LOGIN EMAIL (Supabase)
  // =========================
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
      });

      if (error) throw error;
      nav("/dashboard");
    } catch (err) {
      if (err.message.includes("Invalid login credentials")) {
        setError("Email hoặc mật khẩu không đúng.");
      } else if (err.message.includes("Email not confirmed")) {
        setError("Vui lòng kích hoạt email trước khi đăng nhập.");
      } else {
        setError("Đăng nhập thất bại: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN SOCIAL (Google/LinkedIn)
  // =========================
  const handleSocialLogin = async (provider) => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider, // 'google'
      options: {
          // Supabase sẽ tự động dùng Redirect URI đã cấu hình ở Bước 3
          redirectTo: window.location.origin + "/dashboard" 
      }
    });
    nav("/dashboard");
    if (error) throw error;
  } catch (err) {
    setError("Lỗi kết nối: " + err.message);
  }
};

  // =========================
  // GUEST MODE
  // =========================
  const handleGuest = () => {
    startGuest();
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
          <FaLock className="text-blue-600" /> Đăng nhập
        </h2>

        {error && (
          <div className="text-red-600 bg-red-50 border border-red-300 rounded-md p-2 mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* FORM LOGIN EMAIL */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Mật khẩu"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`p-3 text-white font-semibold rounded-lg transition duration-200 ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">Hoặc</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* SOCIAL LOGIN */}
        <div className="flex gap-3">
          <button
            onClick={() => handleSocialLogin('google')}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
          >
            <FcGoogle size={22} />
            <span className="text-sm font-medium">Google</span>
          </button>
          
          <button
            onClick={() => handleSocialLogin('linkedin')}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-blue-50 transition"
          >
            <SiLinkedin size={20} color="#0A66C2" />
            <span className="text-sm font-medium">LinkedIn</span>
          </button>
        </div>

        {/* GUEST MODE */}
        <div className="mt-4">
          <button
            onClick={handleGuest}
            className="w-full text-center py-2 text-sm text-gray-600 hover:text-gray-800 underline decoration-dotted"
          >
            Dùng thử không cần đăng nhập (Guest Mode)
          </button>
        </div>

        <p className="text-center text-sm mt-6 text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}