import type React from "react"
import { useState } from "react"
import { Toaster } from "react-hot-toast"
import AlertManagement from "./Admin/Alert/AlertManagement"
import Management from "./Admin/Box&Cargo/Management"
import TripManagement from "./Admin/Trip/TripManagement"
import TruckManagement from "./Admin/Truck/TruckManagement"
import Dashboard from "./Dashboard"
import MyTrips from "./MyTrips"
import Profile from "./Profile/Profile"
import { Sidebar } from "./Sidebar"
import UserManagement from "./UserManagement"

const MainLayout: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState("Dashboard")

  const renderContent = () => {
    switch (selectedSection) {
      case "Profile":
        return <Profile />
      case "Dashboard":
        return <Dashboard />
      case "Users":
        return <UserManagement />
      case "Trucks":
        return (
          <TruckManagement />
        )
      case "Trips":
        return <TripManagement />
      case "Boxs":
        return <Management />
      case "Alerts":
        return <AlertManagement />
      case "Temperatures":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Temperatures</h2>
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
    <div className="flex h-screen bg-gray-100 z-[-3]">
      <Sidebar selected={selectedSection} setSelected={setSelectedSection} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: "16x",
            borderRadius: "8px",
          },
          success: {
            style: {
              background: "#49ad6e",
              color: "white",
            },
            iconTheme: {
              primary: "#ffffff",
              secondary: "#22c55e",
            },
          },
          error: {
            style: {
              background: "#ef4444",
              color: "white",
            },
            iconTheme: {
              primary: "#ffffff",
              secondary: "#ef4444",
            },
          },
        }}
      />
    </div>
  )
}

export default MainLayout
