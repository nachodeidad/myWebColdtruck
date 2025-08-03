"use client"

import { Calendar, ChevronLeftIcon, ChevronRightIcon, EditIcon, Lock, Plus, SearchIcon, UsersIcon } from "lucide-react"
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
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
      console.log("Respuesta de getAllUsers:", response)
      setUsers(response)
      // Set current user as selected by default
      if (response.length > 0 && currentUser) {
        const currentUserData = response.find(u => u.id === currentUser.id) || response[0]
        setSelectedUser(currentUserData)
      }
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
    let filtered = users

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((user) => {
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
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    return filtered
  }, [users, searchTerm, roleFilter, statusFilter])

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  const startIndex = (currentPage - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter])

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

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
  }

  const statusStyles = {
    Available: 'bg-green-100 text-green-800',
    'On Trip': 'bg-blue-100 text-blue-800',
    'Unavailable': 'bg-yellow-100 text-yellow-800',
    Disabled: 'bg-red-100 text-red-800',
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-600',
  };

  const roleStyles = {
    admin: 'bg-purple-100 text-purple-800',
    driver: 'bg-blue-100 text-blue-800',
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
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
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-1 justify-center py-5 px-6">
        <div className="flex gap-6 w-full max-w-[1400px]">
          {/* User Profile Sidebar */}
          {selectedUser && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-[#cedbe8] overflow-hidden">
                {/* Profile Header */}
                <div className="flex p-4">
                  <div className="flex w-full flex-col gap-4 items-center">
                    <div className="flex gap-4 flex-col items-center">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 border-2 border-[#cedbe8]"
                        style={{
                          backgroundImage: `url("${selectedUser.profilePicture || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlPViCqVyGRxdQtmHT-5rBlQoa1XJsMwkOdQ3A-hEWfkYMRLG-S-LRYCLcGteHqbSF4Kk&usqp=CAU"}")`,
                        }}
                      />
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                          {selectedUser.name} {selectedUser.lastName} {selectedUser.secondLastName}
                        </p>
                        <p className="text-[#49739c] text-base font-normal leading-normal text-center">
                          {getRoleLabel(selectedUser.role)}
                        </p>
                        <p className="text-[#49739c] text-base font-normal leading-normal text-center">
                          #{selectedUser.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="px-4 pb-4">
                  <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
                    Contact
                  </h3>
                  <div className="grid grid-cols-[20%_1fr] gap-x-6">
                    <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-5">
                      <p className="text-[#49739c] text-sm font-normal leading-normal">Email</p>
                      <p className="text-[#0d141c] text-sm font-normal leading-normal">{selectedUser.email}</p>
                    </div>
                    {selectedUser.phoneNumber && (
                      <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-5">
                        <p className="text-[#49739c] text-sm font-normal leading-normal">Phone</p>
                        <p className="text-[#0d141c] text-sm font-normal leading-normal">
                          {displayPhoneNumber(selectedUser.phoneNumber)}
                        </p>
                      </div>
                    )}
                    <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-5">
                      <p className="text-[#49739c] text-sm font-normal leading-normal">Role</p>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleStyles[selectedUser.role] || roleStyles.driver
                            }`}
                        >
                          {getRoleLabel(selectedUser.role)}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-5">
                      <p className="text-[#49739c] text-sm font-normal leading-normal">Status</p>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[selectedUser.status] || statusStyles.Disabled
                            }`}
                        >
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* History Section */}
                <div className="px-4 pb-4">
                  <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
                    History
                  </h3>
                  <div className="grid grid-cols-[40px_1fr] gap-x-2">
                    <div className="flex flex-col items-center gap-1 pt-3">
                      <Calendar className="h-6 w-6 text-[#0d141c]" />
                      <div className="w-[1.5px] bg-[#cedbe8] h-2 grow"></div>
                    </div>
                    <div className="flex flex-1 flex-col py-3">
                      <p className="text-[#0d141c] text-base font-medium leading-normal">Account Created</p>
                      <p className="text-[#49739c] text-base font-normal leading-normal">
                        {formatDate(selectedUser.registrationDate)}
                      </p>
                    </div>

                    {/* Documents */}
                    {(selectedUser.license || selectedUser.profilePicture) && (
                      <>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-[1.5px] bg-[#cedbe8] h-2"></div>
                          <Lock className="h-6 w-6 text-[#0d141c]" />
                          <div className="w-[1.5px] bg-[#cedbe8] h-2 grow"></div>
                        </div>
                        <div className="flex flex-1 flex-col py-3">
                          <p className="text-[#0d141c] text-base font-medium leading-normal">Documents</p>
                          <div className="flex flex-col gap-1 mt-2">
                            {selectedUser.license && (
                              <a
                                href={selectedUser.license}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0c7ff2] hover:text-blue-800 font-medium transition-colors text-sm"
                              >
                                License
                              </a>
                            )}
                            {selectedUser.profilePicture && (
                              <a
                                href={selectedUser.profilePicture}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0c7ff2] hover:text-blue-800 font-medium transition-colors text-sm"
                              >
                                Photo
                              </a>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="flex justify-start items-center gap-4 text-[#0d141c] tracking-tight text-[32px] font-bold leading-tight">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <UsersIcon className="h-6 w-6 text-white"/>
                </div>
                <div>
                  Users Management
                </div>
              </p>
              <button
                onClick={() => setShowRegisterModal(!showRegisterModal)}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus
                  className={`h-5 w-5 transition-transform duration-200`}
                />
                <span className="truncate">{showRegisterModal ? "Cancel" : "Add New User"}</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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

            {/* Search Bar and Filters */}
            <div className="px-4 py-3 space-y-4">
              {/* Search Bar */}
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-[#49739c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-lg border-r-0">
                    <SearchIcon className="h-6 w-6" />
                  </div>
                  <input
                    placeholder="Search users..."
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-full placeholder:text-[#49739c] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </label>

              {/* Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-[#49739c] text-sm font-medium">Role:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-[#cedbe8] bg-white text-[#0d141c] text-sm focus:outline-0 focus:ring-2 focus:ring-[#0c7ff2] focus:border-[#0c7ff2]"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Administrator</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[#49739c] text-sm font-medium">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-[#cedbe8] bg-white text-[#0d141c] text-sm focus:outline-0 focus:ring-2 focus:ring-[#0c7ff2] focus:border-[#0c7ff2]"
                  >
                    <option value="all">All Status</option>
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="Disabled">Disabled</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(roleFilter !== "all" || statusFilter !== "all" || searchTerm.trim()) && (
                  <button
                    onClick={() => {
                      setRoleFilter("all")
                      setStatusFilter("all")
                      setSearchTerm("")
                    }}
                    className="text-[#0c7ff2] hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-lg border border-[#cedbe8] bg-slate-50">
                {isLoading ? (
                  <div className="w-full p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c7ff2]"></div>
                    <p className="mt-4 text-[#49739c]">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="w-full p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-[#49739c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-[#0d141c]">
                      {searchTerm || roleFilter !== "all" || statusFilter !== "all" ? "No users found" : "No registered users"}
                    </h3>
                    <p className="mt-1 text-sm text-[#49739c]">
                      {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                        ? "Try different search terms or filters"
                        : "Start by registering the first user"}
                    </p>
                  </div>
                ) : (
                  <table className="flex-1">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-3 text-left text-[#0d141c] text-sm font-medium leading-normal">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-[#0d141c] text-sm font-medium leading-normal">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-[#0d141c] text-sm font-medium leading-normal">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user) => (
                        <tr
                          key={user.id}
                          className={`border-t border-t-[#cedbe8] hover:bg-gray-200 transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-50' : ''
                            }`}
                          onClick={() => handleUserClick(user)}
                        >
                          <td className="h-[72px] px-4 py-2 text-[#0d141c] text-sm font-normal leading-normal">
                            #{user.id} {user.name} {user.lastName} {user.secondLastName}
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#49739c] text-sm font-normal leading-normal">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleStyles[user.role] || roleStyles.driver
                                }`}
                            >
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[user.status] || statusStyles.Disabled
                                }`}
                            >
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedUser && currentUser?.id !== selectedUser.id && (
              <div className="px-4 py-3">
                <button
                  onClick={() => handleEditUser(selectedUser)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#e7edf4] text-[#0d141c] text-sm font-medium rounded-lg hover:bg-[#d1dae6] transition-colors"
                >
                  <EditIcon className="h-4 w-4" />
                  Edit User
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-[#cedbe8]">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-[#cedbe8] text-sm font-medium rounded-md text-[#0d141c] bg-white hover:bg-[#e7edf4] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#cedbe8] text-sm font-medium rounded-md text-[#0d141c] bg-white hover:bg-[#e7edf4] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#49739c]">
                      Showing <span className="font-medium text-[#0d141c]">{startIndex + 1}</span> to{" "}
                      <span className="font-medium text-[#0d141c]">{Math.min(endIndex, filteredUsers.length)}</span> of{" "}
                      <span className="font-medium text-[#0d141c]">{filteredUsers.length}</span> result
                      {filteredUsers.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#cedbe8] bg-white text-sm font-medium text-[#49739c] hover:bg-[#e7edf4] disabled:opacity-50 disabled:cursor-not-allowed"
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
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                  ? "z-10 bg-[#0c7ff2] border-[#0c7ff2] text-white"
                                  : "bg-white border-[#cedbe8] text-[#49739c] hover:bg-[#e7edf4]"
                                }`}
                            >
                              {page}
                            </button>
                          )
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 border border-[#cedbe8] bg-white text-sm font-medium text-[#49739c]"
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
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#cedbe8] bg-white text-sm font-medium text-[#49739c] hover:bg-[#e7edf4] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}

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

      {/* Register Modal */}
      <RegisterUserModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleUserRegistered}
      />
    </div>
  )
}

export default UserManagement