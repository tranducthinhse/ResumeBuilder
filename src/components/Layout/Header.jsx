import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
              <img
                src={user.avatar || "https://via.placeholder.com/32"}
                alt="avatar"
                className="w-8 h-8 rounded-full border"
              />
              <span className="text-gray-700 text-sm hidden sm:inline">
                {user.isGuest ? "Guest User" : user.email}
              </span>

              {!user.isGuest && (
                <button
                  onClick={handleEditProfile}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
                >
                  Chỉnh sửa hồ sơ
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
