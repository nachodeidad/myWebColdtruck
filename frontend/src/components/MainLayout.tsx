"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "./Sidebar"
import Dashboard from "./Dashboard"
import UserManagement from "./UserManagement"
import TruckManagement from "./Admin/Truck/TruckManagement"
import TripManagement from "./Admin/Trip/TripManagement"
import MyTrips from "./MyTrips"

const MainLayout: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState("Dashboard")

  const renderContent = () => {
    switch (selectedSection) {
      case "Dashboard":
        return <Dashboard />
      case "Users":
        return <UserManagement />
      case "Trucks":
        return (
          <TruckManagement />
        )
      case "Rutes":
        return <TripManagement />
      case "Alerts":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Alertas del Sistema</h2>
            <p>Sección en desarrollo...</p>
          </div>
        )
      case "Temperatures":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Control de Temperaturas</h2>
            <p>Sección en desarrollo...</p>
          </div>
        )
      case "Reports":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Reportes</h2>
            <p>Sección en desarrollo...</p>
          </div>
        )
      case "Mi Camión":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Mi Camión</h2>
            <p>Información de tu camión asignado...</p>
          </div>
        )
      case "Mis Rutas":
        return <MyTrips />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar selected={selectedSection} setSelected={setSelectedSection} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}

export default MainLayout
