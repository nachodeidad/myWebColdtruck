"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import type { User } from "../types"

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleLabel = (role: User["role"]): string => {
    const roleLabels = {
      admin: "Administrator",
      driver: "Driver",
    }
    return roleLabels[role]
  }

  const getRoleColor = (role: User["role"]): string => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        Los Datos que pienso:<br />
        Total viajes activos osea que tengan el status In Transit <br />
        Total de viajes para hoy de rango fecha<br />
        total de viajes completados de rango fecha <br />
        total de alertas de rango fecha<br />
        grafica de tempetura y humedad promedio mediante un rango fecha<br />
      </div>
    </div>
  )
}

export default Dashboard
