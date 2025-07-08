"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  HomeIcon,
  UsersIcon,
  TruckIcon,
  RouteIcon as RoutesIcon,
  BadgeAlertIcon as AlertsIcon,
  ThermometerIcon as TemperaturesIcon,
  FlagIcon as ReportsIcon,
  LogOutIcon as LogoutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import type { User } from "../types"

interface OptionProps {
  icon?: React.ReactNode
  title: string
  selected: string
  setSelected: (title: string) => void
  open: boolean
  notifs?: number
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

interface SidebarProps {
  selected: string
  setSelected: (title: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ selected, setSelected }) => {
  const [open, setOpen] = useState<boolean>(true)
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = () => {
    logout()
  }

  // Define navigation options based on user role
  const getNavigationOptions = () => {
    const commonOptions = [
      {
        icon: <HomeIcon size={16} />,
        title: "Dashboard",
        hidden: false,
      },
    ]

    const adminOptions = [
      {
        icon: <UsersIcon size={16} />,
        title: "Usuarios",
        hidden: false,
      },
      {
        icon: <TruckIcon size={16} />,
        title: "Camiones",
        hidden: false,
      },
      {
        icon: <RoutesIcon size={16} />,
        title: "Rutas",
        hidden: false,
      },
      {
        icon: <AlertsIcon size={16} />,
        title: "Alertas",
        hidden: false,
        notifs: 3,
      },
      {
        icon: <TemperaturesIcon size={16} />,
        title: "Temperaturas",
        hidden: false,
      },
      {
        icon: <ReportsIcon size={16} />,
        title: "Reportes",
        hidden: false,
      },
    ]

    const driverOptions = [
      {
        icon: <TruckIcon size={16} />,
        title: "Mi Camión",
        hidden: false,
      },
      {
        icon: <RoutesIcon size={16} />,
        title: "Mis Rutas",
        hidden: false,
      },
      {
        icon: <TemperaturesIcon size={16} />,
        title: "Temperaturas",
        hidden: false,
      },
    ]

    if (user.role === "admin") {
      return [...commonOptions, ...adminOptions]
    } else {
      return [...commonOptions, ...driverOptions]
    }
  }

  const navigationOptions = getNavigationOptions()

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-white p-2 z-10"
      style={{
        width: open ? "225px" : "fit-content",
      }}
    >
      <TitleSection open={open} user={user} />

      <div className="space-y-1">
        {navigationOptions.map((option) => (
          <Option
            key={option.title}
            icon={option.icon}
            title={option.title}
            selected={selected}
            setSelected={setSelected}
            open={open}
            hidden={option.hidden}
          />
        ))}

        <Option
          icon={<LogoutIcon size={16} />}
          title="Cerrar Sesión"
          selected={selected}
          setSelected={setSelected}
          open={open}
          onClick={handleLogout}
        />
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  )
}

const Option: React.FC<OptionProps> = ({ icon, title, selected, setSelected, open, notifs, onClick, hidden }) => {
  if (hidden) return null

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setSelected(title)
    }
  }

  return (
    <motion.button
      layout
      onClick={handleClick}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
        selected === title ? "bg-blue-100 text-blue-800" : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <motion.div layout className="grid h-full w-10 place-content-center text-lg">
        {icon}
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-xs font-medium"
        >
          {title}
        </motion.span>
      )}

      {notifs && open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          style={{ y: "-50%" }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 flex items-center justify-center size-4 rounded bg-red-500 text-xs text-white"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  )
}

const TitleSection: React.FC<TitleSectionProps> = ({ open, user }) => {
  const getRoleLabel = (role: User["role"]): string => {
    const roleLabels = {
      admin: "Administrador",
      driver: "Conductor",
    }
    return roleLabels[role]
  }

  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100 p-2">
        <div className="flex items-center gap-2">
          <Logo profilePicture={user.profilePicture} />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-sm font-medium text-slate-800">
                {user.name} {user.lastName}
              </span>
              <span className="block text-xs text-slate-500">{getRoleLabel(user.role)}</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

const Logo: React.FC<{ profilePicture?: string }> = ({ profilePicture }) => {
  return (
    <motion.div layout className="grid size-10 shrink-0 place-content-center rounded-md bg-blue-600 overflow-hidden">
      {profilePicture ? (
        <img src={profilePicture || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <svg
          width="24"
          height="auto"
          viewBox="0 0 50 39"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="fill-slate-50"
        >
          <path d="M25 0L0 39H50L25 0Z" />
        </svg>
      )}
    </motion.div>
  )
}

const ToggleClose: React.FC<ToggleCloseProps> = ({ open, setOpen }) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100"
    >
      <div className="flex items-center p-2">
        <motion.div layout className="grid size-10 place-content-center text-lg">
          {open ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-xs font-medium"
          >
            Ocultar
          </motion.span>
        )}
      </div>
    </motion.button>
  )
}
