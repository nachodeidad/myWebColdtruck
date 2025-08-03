"use client"

import { motion } from "framer-motion"
import {
  BadgeAlertIcon as AlertsIcon,
  Box,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  LogOutIcon as LogoutIcon,
  Menu,
  RouteIcon as RoutesIcon,
  TruckIcon,
  UsersIcon,
  X
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import type { User } from "../types"

interface OptionProps {
  icon?: React.ReactNode
  title: string
  selected: string
  setSelected: (title: string) => void
  open: boolean
  onClick?: () => void
  hidden?: boolean
  isMobile?: boolean
  closeMobileMenu?: () => void
}

interface TitleSectionProps {
  open: boolean
  user: User
  selected: string
  setSelected: (title: string) => void
}

interface ToggleCloseProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

interface SidebarProps {
  selected: string
  setSelected: (title: string) => void
}

type NavOption = {
  icon: React.ReactNode
  title: string
  hidden: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ selected, setSelected }) => {
  const [open, setOpen] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsMobileMenuOpen(false)
      }
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileMenuOpen) {
        const sidebar = document.getElementById('sidebar')
        const menuButton = document.getElementById('mobile-menu-button')
        
        if (
          sidebar && 
          !sidebar.contains(event.target as Node) &&
          menuButton &&
          !menuButton.contains(event.target as Node)
        ) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, isMobileMenuOpen])

  if (!user) return null

  const handleLogout = () => {
    logout()
    if (isMobile) setIsMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    if (isMobile) setIsMobileMenuOpen(false)
  }

  const getNavigationOptions = () => {
    const adminOptions = [
      {
        icon: <HomeIcon size={20} />,
        title: "Dashboard",
        hidden: false,
      },
      {
        icon: <UsersIcon size={20} />,
        title: "Users",
        hidden: false,
      },
      {
        icon: <TruckIcon size={20} />,
        title: "Trucks",
        hidden: false,
      },
      {
        icon: <RoutesIcon size={20} />,
        title: "Trips",
        hidden: false,
      },
      {
        icon: <Box size={20} />,
        title: "Boxs",
        hidden: false,
      },
      {
        icon: <AlertsIcon size={20} />,
        title: "Alerts",
        hidden: false,
      },
    ]

    const driverOptions = [
      {
        icon: <TruckIcon size={20} />,
        title: "Mi Camión",
        hidden: false,
      },
      {
        icon: <RoutesIcon size={20} />,
        title: "Mis Rutas",
        hidden: false,
      },
    ]

    return user.role === "admin" ? [...adminOptions] : [...driverOptions]
  }

  const navigationOptions = getNavigationOptions()

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      {isMobile && (
        <button
          id="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-xl shadow-lg border border-blue-500 hover:bg-blue-700 transition-colors duration-200"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Overlay para móvil */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.nav
        id="sidebar"
        layout
        className={`
          ${isMobile ? 
            `fixed top-0 left-0 h-full z-40 shadow-2xl transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }` 
            : 
            "sticky top-0 z-10 h-screen shrink-0 shadow-2xl"
          }
          bg-blue-600 border-r border-blue-500 transition-all duration-300 ease-in-out
          ${open ? "w-64 p-4" : "w-20 p-3"}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Botón de cierre en móvil */}
          {isMobile && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                {/* <X size={20} /> */}
              </button>
            </div>
          )}

          <TitleSection open={open} user={user} selected={selected} setSelected={setSelected} />

          <div className="flex-1 mt-6 space-y-2">
            {navigationOptions.map((option) => (
              <Option
                key={option.title}
                icon={option.icon}
                title={option.title}
                selected={selected}
                setSelected={setSelected}
                open={open}
                hidden={option.hidden}
                isMobile={isMobile}
                closeMobileMenu={closeMobileMenu}
              />
            ))}
          </div>

          <div className="mt-auto space-y-2">
            <div className="h-px bg-blue-500 my-4" />
            <Option
              icon={<LogoutIcon size={18} />}
              title="Sign Out"
              selected={selected}
              setSelected={setSelected}
              open={open}
              onClick={handleLogout}
              isMobile={isMobile}
              closeMobileMenu={closeMobileMenu}
            />
            {!isMobile && <ToggleClose open={open} setOpen={setOpen} />}
          </div>
        </div>
      </motion.nav>
    </>
  )
}

const Option: React.FC<OptionProps> = ({ 
  icon, 
  title, 
  selected, 
  setSelected, 
  open, 
  onClick, 
  hidden, 
  isMobile, 
  closeMobileMenu 
}) => {
  if (hidden) return null

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setSelected(title)
    }
    
    // Cerrar menú móvil después de seleccionar
    if (isMobile && closeMobileMenu) {
      closeMobileMenu()
    }
  }

  const isSelected = selected === title

  return (
    <motion.button
      layout
      onClick={handleClick}
      className={`relative flex h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group ${
        isSelected
          ? "bg-blue-700 text-white shadow-lg border border-blue-700"
          : "text-white hover:bg-blue-700 hover:text-white"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
<span
  className={`grid place-content-center transition-colors
    ${open ? "h-6 w-6" : "h-10 w-10"}
    ${isSelected ? "text-white" : "text-blue-200 group-hover:text-white"}
  `}
>
  {icon}
</span>


      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ delay: 0.1 }}
          className="truncate"
        >
          {title}
        </motion.span>
      )}
    </motion.button>
  )
}

const TitleSection: React.FC<TitleSectionProps> = ({ open, user, selected, setSelected }) => {
  const getRoleLabel = (role: User["role"]): string => {
    const roleLabels = { admin: "Administrador", driver: "Conductor" }
    return roleLabels[role]
  }

  const handleProfileClick = () => {
    setSelected("Profile")
  }

  const isSelected = selected === "Profile"

  return (
    <motion.button
      layout
      onClick={handleProfileClick}
      className={`flex rounded-xl border p-3 shadow-lg w-full transition-all duration-200
        ${open ? "justify-start gap-3" : "justify-center"}
        ${isSelected ? "bg-blue-100 border-blue-600 ring-2 ring-blue-300" : "bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300"}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-700 ring-2 ring-blue-300">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 50 39" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 0L0 39H50L25 0Z" />
              </svg>
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ delay: 0.1 }}
          className="flex-1 min-w-0 text-left"
        >
          <div className={`text-sm font-semibold truncate ${
            isSelected ? "text-blue-900" : "text-blue-900"
          }`}>
            {user.name} {user.lastName} {user.secondLastName}
          </div>
          <div className={`text-xs truncate ${
            isSelected ? "text-blue-600" : "text-blue-600"
          }`}>{getRoleLabel(user.role)}</div>
        </motion.div>
      )}
    </motion.button>
  )
}


const ToggleClose: React.FC<ToggleCloseProps> = ({ open, setOpen }) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen(!open)}
      className="flex items-center justify-center w-full h-10 rounded-xl bg-white border border-blue-200 text-blue-600 hover:text-blue-900 hover:bg-blue-50 transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-5 w-5 place-content-center">
          {open ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
        </span>
        {open && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-medium"
          >
            Ocultar
          </motion.span>
        )}
      </div>
    </motion.button>
  )
}