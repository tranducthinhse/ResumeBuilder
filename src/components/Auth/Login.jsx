// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, signInWithCustomToken } from "firebase/auth";
import { auth, provider } from "../../services/firebase";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { SiLinkedin } from "react-icons/si";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { startGuest } = useAuth(); // Lấy hàm Guest từ context

  // =========================
  // LOGIN EMAIL
  // =========================
  const handleEmail = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      nav("/dashboard");
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
    }
  };

  // =========================
  // LOGIN GOOGLE
  // =========================
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      nav("/dashboard");
    } catch (err) {
      setError("Không thể đăng nhập bằng Google. Thử lại sau!");
    }
  };

  // =========================
  // LOGIN LINKEDIN (OAuth)
  // =========================
  const LINKEDIN_CLIENT_ID = "LI_CLIENT_ID";
  const REDIRECT_URL = "https://<project>.web.app/auth/linkedin";
  const FUNCTION_URL = "https://<region>-<project>.cloudfunctions.net/linkedinAuth";

  const handleLinkedIn = () => {
    const linkedinUrl =
      "https://www.linkedin.com/oauth/v2/authorization?" +
      new URLSearchParams({
        response_type: "code",
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: REDIRECT_URL,
        scope: "r_liteprofile r_emailaddress",
      }).toString();

    const popup = window.open(linkedinUrl, "_blank", "width=600,height=600");

    window.addEventListener("message", async (event) => {
      if (event.data?.token) {
        try {
          await signInWithCustomToken(auth, event.data.token);
          nav("/dashboard");
        } catch (e) {
          setError("Không thể đăng nhập bằng LinkedIn!");
        }
      }
    });
  };

  // =========================
  // GUEST MODE
  // =========================
  const handleGuest = () => {
    startGuest(); // ✅ update state và localStorage
    nav("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🔐 Đăng nhập tài khoản
        </h2>

        {error && (
          <div className="text-red-600 bg-red-50 border border-red-300 rounded-md p-2 mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* FORM LOGIN EMAIL */}
        <form onSubmit={handleEmail} className="flex flex-col gap-4">
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
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
          >
            Đăng nhập
          </button>
        </form>

        {/* GOOGLE LOGIN */}
        <div className="mt-5">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition duration-200"
          >
            <FcGoogle size={22} />
            <span>Đăng nhập với Google</span>
          </button>
        </div>

        {/* LINKEDIN LOGIN */}
        <div className="mt-3">
          <button
            onClick={handleLinkedIn}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 hover:bg-blue-50 transition duration-200"
          >
            <SiLinkedin size={20} color="#0A66C2" />
            <span>Đăng nhập với LinkedIn</span>
          </button>
        </div>

        {/* GUEST MODE */}
        <div className="mt-4">
          <button
            onClick={handleGuest}
            className="w-full text-center py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            Dùng thử (Guest Mode)
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
