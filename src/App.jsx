// src/App.jsx
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

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// Component layout để xác định trang nào cần căn giữa
function Layout({ children }) {
  const location = useLocation();
  const centerRoutes = ["/login", "/register"];
  const isCentered = centerRoutes.includes(location.pathname);

  return (
    <main
      className={
        isCentered
          ? "min-h-screen flex justify-center items-center bg-gray-100"
          : "container mx-auto p-4"
      }
    >
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
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <CreateCV />
                </PrivateRoute>
              }
            />
            <Route path="/view/:uid/:cvId" element={<ViewCV />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
