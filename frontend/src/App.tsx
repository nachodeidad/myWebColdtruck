"use client";

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";
import LoginForm from "./components/LoginForm";
import LandingPage from "./pages/LandingPage";
import MainLayout from "./components/MainLayout";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/main"
            element={
              <AuthGuard fallback={<Navigate to="/login" replace />}>
                <MainLayout />
              </AuthGuard>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
