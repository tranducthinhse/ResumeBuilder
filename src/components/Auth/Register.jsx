import React, { useState } from "react";
import { supabase } from "../../services/supabase"; // ✅ Import Supabase
import { useNavigate, Link } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";

export default function Register() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState(""); // Thông báo thành công
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    try {
      // Gọi API đăng ký của Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: pass,
        options: {
          // Bạn có thể lưu thêm metadata nếu muốn
          data: {
            full_name: "", // Để trống hoặc lấy từ input khác
          },
        },
      });

      if (error) throw error;

      // ⚠️ Quan trọng: Supabase mặc định bắt xác thực Email
      // Nếu đăng ký thành công nhưng không có session, nghĩa là cần xác thực email
      if (data.user && !data.session) {
        setMsg("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản trước khi đăng nhập.");
      } else {
        // Nếu bạn tắt "Confirm Email" trong settings Supabase, nó sẽ vào đây
        nav("/dashboard");
      }

    } catch (err) {
      console.error(err);
      if (err.message.includes("already registered")) {
          setError("Email này đã được sử dụng.");
      } else if (err.message.includes("Password should be")) {
          setError("Mật khẩu phải có ít nhất 6 ký tự.");
      } else {
          setError("Đăng ký thất bại: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
          <FaUserPlus className="text-green-600 text-3xl" /> Đăng ký tài khoản
        </h2>

        {/* Thông báo lỗi */}
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-300 rounded-md p-2 mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Thông báo thành công (Check mail) */}
        {msg && (
          <div className="text-green-700 bg-green-50 border border-green-300 rounded-md p-3 mb-4 text-sm text-center">
            {msg}
          </div>
        )}

        {/* FORM REGISTER */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Mật khẩu (Tối thiểu 6 ký tự)"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className={`p-3 text-white font-semibold rounded-lg transition duration-200 ${
                loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}