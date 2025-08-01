"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import type { User } from "../types"
import { CalendarIcon, MailIcon, PhoneIcon, UserIcon, BadgeIcon } from "lucide-react"

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Control Panel</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.name}</p>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-20 w-20 rounded-full border-4 border-white object-cover"
                  src={user.profilePicture || "/placeholder.svg"}
                  alt={`${user.name} ${user.lastName}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-white">
                  {user.name} {user.lastName}
                </h2>
                <div className="flex items-center mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                      user.role,
                    )}`}
                  >
                    <BadgeIcon className="h-4 w-4 mr-1" />
                    {getRoleLabel(user.role)}
                  </span>
                  <span className="ml-4 text-blue-100 text-sm">ID: {user.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-sm text-gray-900">{user.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm text-gray-900">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Registration Date</p>
                  <p className="text-sm text-gray-900">{formatDate(user.registrationDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* License Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Driver license</h3>
            </div>
            <div className="p-6">
              {user.license ? (
                <div className="text-center">
                  <img
                    src={user.license || "/placeholder.svg"}
                    alt="Licencia de conducir"
                    className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                    style={{ maxHeight: "300px" }}
                  />
                  <div className="mt-4">
                    <a
                      href={user.license}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      View full size
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No license available</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Picture Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
            </div>
            <div className="p-6">
              {user.profilePicture ? (
                <div className="text-center">
                  <img
                    src={user.profilePicture || "/placeholder.svg"}
                    alt="Foto de perfil"
                    className="mx-auto h-48 w-48 rounded-full object-cover border-4 border-gray-200 shadow-sm"
                  />
                  <div className="mt-4">
                    <a
                      href={user.profilePicture}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      View full size
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No profile picture available</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
