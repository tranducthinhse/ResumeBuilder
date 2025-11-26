import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./pages/Dashboard";
import CreateCV from "./pages/CreateCV";
import ViewCV from "./pages/ViewCV";
import Header from "./components/Layout/Header";
import Profile from "./pages/Profile";
import Editor from "./pages/Editor"; 
import CompareCV from "./pages/CompareCV"; // ✅ Đã import trang so sánh

function PrivateRoute({ children }) {
  const { user } = useAuth();
  // Đợi loading xong mới check user (tránh đá ra login oan)
  // Tuy nhiên ở đây ta check đơn giản:
  return user ? children : <Navigate to="/login" />;
}

// Component layout xử lý hiển thị (Full màn hình cho Editor/Compare)
function Layout({ children }) {
  const location = useLocation();
  
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  
  // Các trang cần không gian rộng (ẩn container giới hạn)
  const isFullWidthPage = 
      location.pathname.startsWith("/editor") || 
      location.pathname.startsWith("/compare");

  if (isAuthPage) {
    return (
      <main className="min-h-screen flex justify-center items-center bg-gray-100">
        {children}
      </main>
    );
  }

  if (isFullWidthPage) {
    return (
      <main className="h-screen bg-gray-100 overflow-hidden"> 
        {children}
      </main>
    );
  }

  // Các trang thường (Dashboard, Profile...)
  return (
    <main className="container mx-auto p-4 pb-20">
      {children}
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Route xem CV công khai (không cần PrivateRoute để người lạ xem được) */}
            <Route path="/view/:id" element={<ViewCV />} />

            {/* Private Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/editor/new"
              element={
                <PrivateRoute>
                  <CreateCV />
                </PrivateRoute>
              }
            />

            <Route
              path="/editor/:id"
              element={
                <PrivateRoute>
                  <Editor />
                </PrivateRoute>
              }
            />

            {/* ✅ Route So sánh (FR-4.2) */}
            <Route 
               path="/compare/:id1/:id2" 
               element={
                  <PrivateRoute>
                     <CompareCV />
                  </PrivateRoute>
               } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}