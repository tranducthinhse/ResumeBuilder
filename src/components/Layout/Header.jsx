import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaUserCircle } from "react-icons/fa"; // ✅ Import thêm icon này

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleEditProfile = () => navigate("/profile");

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
          Resume<span className="text-gray-800">Builder</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              
              {/* 👇 SỬA LỖI Ở ĐÂY: Nếu có avatar thì hiện ảnh, không thì hiện Icon */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border object-cover"
                  onError={(e) => {
                    // Nếu link ảnh bị lỗi, tự động ẩn đi và hiện icon thay thế (hoặc thay bằng ảnh default khác)
                    e.target.style.display = 'none'; 
                    // Mẹo: Bạn có thể render FaUserCircle ngay bên cạnh nếu muốn fallback phức tạp hơn
                  }}
                />
              ) : (
                <FaUserCircle size={32} className="text-gray-400" />
              )}

              <span className="text-gray-700 text-sm hidden sm:inline font-medium">
                {user.isGuest ? "Khách (Guest)" : user.email?.split('@')[0]}
              </span>

              {!user.isGuest && (
                <button
                  onClick={handleEditProfile}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
                >
                  Hồ sơ
                </button>
              )}

              <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 font-medium border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition text-sm"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}