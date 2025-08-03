"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import MainLayout from "./MainLayout"

interface AuthGuardProps {
  children?: React.ReactNode
  fallback?: React.ReactNode
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback = <div>Acceso denegado</div> }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  // Si está autenticado, renderiza MainLayout (no necesita children)
  return <MainLayout />
}

export default AuthGuard
