"use client"

import { ChevronLeftIcon, ChevronRightIcon, EditIcon, SearchIcon, UserIcon, UserPlusIcon } from "lucide-react"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { authAPI } from "../services/api"
import type { User } from "../types"
import { formatPhoneNumber } from "../utils/validation"
import EditUserModal from "./EditUserModal"
import RegisterUserModal from "./RegisterUserModal"

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { user: currentUser } = useAuth()

  const USERS_PER_PAGE = 20

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await authAPI.getAllUsers()
          console.log("Respuesta de getAllUsers:", response)  // <-- AGREGA ESTO
      setUsers(response)
    } catch (error: any) {
      console.error("Error loading users:", error)
      setError(error.response?.data?.msg || "Error al cargar usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserRegistered = () => {
    setShowRegisterModal(false)
    loadUsers()
  }

  const handleUserUpdated = () => {
    setEditingUser(null)
    loadUsers()
  }

  const getRoleLabel = (role: User["role"]): string => {
    const roleLabels = {
      admin: "Administrator",
      driver: "Driver",
    }
    return roleLabels[role]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const displayPhoneNumber = (phone: string): string => {
    return formatPhoneNumber(phone)
  }

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users

    const searchLower = searchTerm.toLowerCase().trim()

    return users.filter((user) => {
      const fullName = `${user.name || ""} ${user.lastName || ""} ${user.secondLastName || ""}`.toLowerCase()
      const email = (user.email || "").toLowerCase()
      const phone = (user.phoneNumber || "").toLowerCase()
      const userId = user.id ? user.id.toString() : ""

      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        userId.includes(searchLower)
      )
    })
  }, [users, searchTerm])

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  const startIndex = (currentPage - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  const handleEditUser = (user: User) => {
    const userToEdit = {
      ...user,
      id: user.id || (user as any)._id,
    }
    setEditingUser(userToEdit)
  }

  const statusStyles = {
    Available:        'bg-green-100  text-green-800',
    'On Trip':        'bg-blue-100   text-blue-800',
    'Unavailable': 'bg-yellow-100 text-yellow-800',
    Disabled:         'bg-red-100   text-red-800',
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 p-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Acceso Denegado</h3>
                <p className="mt-1 text-sm">Solo los administradores pueden acceder a esta sección.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
<div className="min-h-screen w-full relative bg-white z-0">
  {/* Cool Blue Glow Top */}
  <div
    className="absolute inset-0 z-[-1]"
    style={{
      background: "#ffffff",
      backgroundImage: `
        radial-gradient(
          circle at top center,
          rgba(70, 130, 180, 0.5),
          transparent 70%
        )
      `,
      filter: "blur(80px)",
      backgroundRepeat: "no-repeat",
    }}
  />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-xl">
                    <UserIcon className="h-6 w-6 text-white"/>
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900">User management</h1>
                </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="text-sm">Total users:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {users.length}
                    </span>
                  </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowRegisterModal(!showRegisterModal)}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <UserPlusIcon className="h-5 w-5 " />
                  {showRegisterModal ? "Cancel" : "Register User"}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Register Modal */}
          {showRegisterModal && (
            <RegisterUserModal
              isOpen={showRegisterModal}
              onClose={() => setShowRegisterModal(false)}
              onSuccess={handleUserRegistered}
            />
          )}

          {/* Search Bar */}
          <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone number, or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <h2 className="text-xl font-medium text-gray-900">
                List of Users
                {searchTerm && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (showing {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""})
                  </span>
                )}
              </h2>
              <p className="text-slate-600 text-sm mt-1">Manage and monitor users</p>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : "Comienza registrando el primer usuario del sistema"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          USER
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          CONTACT
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          ROLE
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          STATUS
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          REGISTRED
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          DOCUMENTS
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                  src={user.profilePicture || "/placeholder.svg"}
                                  alt={`${user.name} ${user.lastName}`}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg"
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name} {user.lastName}
                                </div>
                                <div className="text-xs text-gray-400">ID: {user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{user.email}</div>
                            <div className="text-sm text-slate-900">{displayPhoneNumber(user.phoneNumber)}</div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ${
                                user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                              }`}
                            >
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                                  ${statusStyles[user.status] || statusStyles.Disabled
                                }`}
                              >
                                {user.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.registrationDate)}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-3">
                              {user.license && (
                                <a
                                  href={user.license}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                  License
                                </a>
                              )}
                              {user.profilePicture && (
                                <a
                                  href={user.profilePicture}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                  Photo
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-00 transition-colors"
                            >
                              <EditIcon className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
                          <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> de{" "}
                          <span className="font-medium">{filteredUsers.length}</span> resultado
                          {filteredUsers.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>

                          {/* Page Numbers */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === currentPage
                                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              )
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span
                                  key={page}
                                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                >
                                  ...
                                </span>
                              )
                            }
                            return null
                          })}

                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Edit User Modal */}
          {editingUser && (
            <EditUserModal
              user={editingUser}
              isOpen={!!editingUser}
              onClose={() => setEditingUser(null)}
              onSuccess={handleUserUpdated}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default UserManagement
