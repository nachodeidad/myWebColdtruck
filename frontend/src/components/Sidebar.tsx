"use client"

import { motion } from "framer-motion"
import {
  BadgeAlertIcon as AlertsIcon,
  Box,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  LogOutIcon as LogoutIcon,
  RouteIcon as RoutesIcon,
  ThermometerIcon as TemperaturesIcon,
  TruckIcon,
  UsersIcon,
  X
} from "lucide-react"
import React, { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import type { User } from "../types"

interface SidebarProps {
  selected: string
  setSelected: (title: string) => void
}

interface OptionProps {
  icon?: React.ReactNode
  title: string
  selected: string
  setSelected: (title: string) => void
  open: boolean
  onClick?: () => void
  hidden?: boolean
}

interface TitleSectionProps {
  open: boolean
  user: User
}

interface ToggleCloseProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const Sidebar: React.FC<SidebarProps> = ({ selected, setSelected }) => {
  const [open, setOpen] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { user, logout } = useAuth()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!user) return null

  const handleLogout = () => logout()

  const navigationOptions = user.role === "admin"
    ? [
        { icon: <HomeIcon size={20} />, title: "Dashboard", hidden: false },
        { icon: <UsersIcon size={20} />, title: "Users", hidden: false },
        { icon: <TruckIcon size={20} />, title: "Trucks", hidden: false },
        { icon: <RoutesIcon size={20} />, title: "Trips", hidden: false },
        { icon: <Box size={20} />, title: "Boxs", hidden: false },
        { icon: <AlertsIcon size={20} />, title: "Alerts", hidden: false },
      ]
    : [
        { icon: <HomeIcon size={20} />, title: "Dashboard", hidden: false },
        { icon: <TruckIcon size={20} />, title: "Mi Camión", hidden: false },
        { icon: <RoutesIcon size={20} />, title: "Mis Rutas", hidden: false },
        { icon: <TemperaturesIcon size={20} />, title: "Temperaturas", hidden: false },
      ]

  return (
    <>
      {/* Botón para abrir en mobile */}
      {isMobile && !isMobileMenuOpen && (
        <button
          className="fixed top-4 left-4 z-50 rounded bg-blue-600 p-2 border border-white  text-white shadow-lg"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <motion.nav
        layout
        className={`
          ${isMobile ? 
            `fixed top-0 left-0 h-full z-40 bg-blue-600 shadow-xl transition-transform transform ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }` 
            : 
            `sticky top-0 h-screen z-10 bg-blue-600`
          }
          ${open ? "w-56 p-4" : "w-16 p-2"} transition-all duration-300 ease-in-out
        `}
      >
        <div className="grid items-center">
          {isMobile && (
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-1 pb-2 flex justify-end">
              <X className=""/>
            </button>
          )}
          <TitleSection open={open} user={user} />
        </div>

        <div className="mt-4 space-y-1">
          {navigationOptions.map((option) => (
            !option.hidden && (
              <Option
                key={option.title}
                icon={option.icon}
                title={option.title}
                selected={selected}
                setSelected={(title) => {
                  setSelected(title)
                  if (isMobile) setIsMobileMenuOpen(false)
                }}
                open={open}
              />
            )
          ))}
          <Option
            icon={<LogoutIcon size={18} />}
            title="Cerrar Sesión"
            selected={selected}
            setSelected={setSelected}
            open={open}
            onClick={handleLogout}
          />
        </div>

        {!isMobile && <ToggleClose open={open} setOpen={setOpen} />}
      </motion.nav>
    </>
  )
}

const Option: React.FC<OptionProps> = ({ icon, title, selected, setSelected, open, onClick, hidden }) => {
  if (hidden) return null

  const handleClick = () => {
    onClick ? onClick() : setSelected(title)
  }

  return (
    <motion.button
      layout
      onClick={handleClick}
      className={`relative flex h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        selected === title ? "bg-white text-blue-900" : "text-white hover:bg-white hover:text-blue-900"
      }`}
    >
      <span className="grid h-full w-6 place-content-center">{icon}</span>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.span>
      )}
    </motion.button>
  )
}

const TitleSection: React.FC<TitleSectionProps> = ({ open, user }) => {
  const getRoleLabel = (role: User["role"]): string => {
    const roleLabels = { admin: "Administrador", driver: "Conductor" }
    return roleLabels[role]
  }

  return (
    <motion.button
      layout
      className="flex items-center gap-3 rounded-md bg-white hover:bg-gray-100 p-2 text-blue-900 w-full"
    >
      <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-600">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <svg width="24" height="auto" viewBox="0 0 50 39" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 0L0 39H50L25 0Z" />
          </svg>
        )}
      </div>
      {open && (
        <div>
          <span className="block text-sm font-semibold">{user.name} {user.lastName}</span>
          <span className="block text-xs text-blue-900">{getRoleLabel(user.role)}</span>
        </div>
      )}
    </motion.button>
  )
}

const ToggleClose: React.FC<ToggleCloseProps> = ({ open, setOpen }) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen(!open)}
      className="absolute bottom-2 left-0 right-0 mx-auto w-full rounded-md p-2 hover:bg-white"
    >
      <div className="flex items-center justify-center gap-2 text-white hover:text-blue-600">
        <span className="grid h-6 w-6 place-content-center">
          {open ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
        </span>
        {open && <span className="text-xs font-medium">Ocultar</span>}
      </div>
    </motion.button>
  )
}
