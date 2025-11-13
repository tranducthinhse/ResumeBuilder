import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";

export default function Register() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      nav("/dashboard");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.");
      } else if (err.code === "auth/weak-password") {
        setError("Mật khẩu quá yếu. Vui lòng dùng ít nhất 6 ký tự.");
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại!");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
          <FaUserPlus className="text-green-600 text-3xl" /> Đăng ký tài khoản
        </h2>

        {error && (
          <div className="text-red-600 bg-red-50 border border-red-300 rounded-md p-2 mb-4 text-sm text-center">
            {error}
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
            placeholder="Mật khẩu"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="submit"
            className="p-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
          >
            Đăng ký
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
