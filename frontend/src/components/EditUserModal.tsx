"use client"

import type { AxiosError } from "axios"
import { BadgeIcon, CameraIcon, FileTextIcon, MailIcon, PhoneIcon, UserIcon, XIcon } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "../hooks/useForm"
import { authAPI } from "../services/api"
import type { ApiError, User } from "../types"
import { formatPhoneNumber, sanitizePhoneInput, validateEditUserForm } from "../utils/validation"

interface EditUserData {
  name: string
  lastName: string
  secondLastName?: string
  email: string
  phoneNumber: string
  role: "admin" | "driver"
  status?: "Available" | "On Trip" | "Unavailable" | "Disabled"
  profilePicture?: File | null
  license?: File | null
}

interface EditUserModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSuccess }) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [licensePreview, setLicensePreview] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const initialValues: EditUserData = {
    name: user.name,
    lastName: user.lastName,
    secondLastName: user.secondLastName || "",
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    profilePicture: null,
    license: null,
  }

  const { values, errors, isSubmitting, updateField, setError, handleSubmit, reset } = useForm({
    initialValues,
    validate: validateEditUserForm,
    onSubmit: async (data) => {
      try {
        setIsUpdating(true)
        setErrorMessage("")

        console.log("🔄 Iniciando actualización de usuario...")
        console.log("📋 Datos del usuario:", {
          userId: user.id,
          userIdType: typeof user.id,
          userIdLength: user.id?.length,
          userName: user.name,
          userEmail: user.email,
        })

        // Verificar que el ID del usuario sea válido
        if (user.id === undefined || user.id === null || user.id === "") {
          console.error("❌ ID de usuario inválido:", user.id)
          throw new Error("ID de usuario inválido")
        }

        // Create FormData for file uploads
        const formData = new FormData()
        formData.append("name", data.name.trim())
        formData.append("lastName", data.lastName.trim())
        if (data.secondLastName) {
          formData.append("secondLastName", data.secondLastName.trim())
        }
        formData.append("email", data.email.trim().toLowerCase())
        formData.append("phoneNumber", formatPhoneNumber(data.phoneNumber))
        formData.append("role", data.role)
        if (data.status) {
          formData.append("status", data.status)
        }

        // Add files if they were selected
        if (data.profilePicture) {
          formData.append("profilePicture", data.profilePicture)
          console.log("📸 Agregando foto de perfil:", data.profilePicture.name)
        }
        if (data.license) {
          formData.append("license", data.license)
          console.log("📄 Agregando licencia:", data.license.name)
        }

        // Make actual API call usando el ID original del usuario
        console.log("🌐 Enviando petición a la API con ID:", user.id)
        const updatedUser = await authAPI.updateUser(user.id, formData)

        console.log("✅ Usuario actualizado exitosamente:", updatedUser)
        onSuccess()
        onClose()
      } catch (error) {
        console.error("❌ Error completo:", error)

        const axiosError = error as AxiosError<ApiError>
        let message = "Error desconocido al actualizar usuario"

        if (axiosError.response?.data?.msg) {
          message = axiosError.response.data.msg
        } else if (axiosError.response?.status === 404) {
          message = "Usuario no encontrado"
        } else if (axiosError.response?.status === 403) {
          message = "No tienes permisos para actualizar este usuario"
        } else if (axiosError.response?.status === 401) {
          message = "Sesión expirada. Por favor, inicia sesión nuevamente"
        } else if (axiosError.response?.status === 500) {
          message = "Error interno del servidor"
        } else if (axiosError.response?.status === 400) {
          message = axiosError.response.data?.msg || "Datos inválidos"
        } else if (axiosError.message) {
          message = axiosError.message
        }

        setErrorMessage(message)
        setError("email", message)
      } finally {
        setIsUpdating(false)
      }
    },
  })

  const handleInputChange =
    (field: keyof EditUserData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value

      // Apply specific formatting/sanitization based on field
      if (field === "name" || field === "lastName" || field === "secondLastName") {
        // Remove special characters except letters, spaces, hyphens, and apostrophes
        value = value.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']/g, "")
      } else if (field === "phoneNumber") {
        // Sanitize phone input
        value = sanitizePhoneInput(value)
      } else if (field === "email") {
        // Convert email to lowercase and trim
        value = value.toLowerCase().trim()
      }

      updateField(field, value)
      setErrorMessage("") // Clear error when user starts typing
    }

  const handleFileChange = (field: "profilePicture" | "license") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    updateField(field, file)
    setErrorMessage("") // Clear error when user selects file

    // Create preview URL
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (field === "profilePicture") {
          setProfilePreview(result)
        } else {
          setLicensePreview(result)
        }
      }
      reader.readAsDataURL(file)
    } else {
      if (field === "profilePicture") {
        setProfilePreview(null)
      } else {
        setLicensePreview(null)
      }
    }
  }

  useEffect(() => {
    if (user) {
      updateField("name", user.name)
      updateField("lastName", user.lastName)
      updateField("secondLastName", user.secondLastName || "")
      updateField("email", user.email)
      updateField("phoneNumber", user.phoneNumber)
      updateField("role", user.role)
      updateField("status", user.status)
      updateField("profilePicture", null)
      updateField("license", null)
      setProfilePreview(null)
      setLicensePreview(null)
      setErrorMessage("")
    }
  }, [user])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                    src={profilePreview || user.profilePicture || "/placeholder.svg"}
                    alt={`${user.name} ${user.lastName}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                  <p className="text-sm text-gray-500">ID: {user.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
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
                    <p className="text-sm font-medium">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      <UserIcon className="h-4 w-4 inline mr-1" />
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={values.name}
                      onChange={handleInputChange("name")}
                      required
                      maxLength={50}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Solo letras, espacios, guiones y apostrofes"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      <UserIcon className="h-4 w-4 inline mr-1" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleInputChange("lastName")}
                      required
                      maxLength={50}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Solo letras, espacios, guiones y apostrofes"
                    />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>

                <div>
                  <label htmlFor="secondLastName" className="block text-sm font-medium text-gray-700 mb-1">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Second Last Name
                  </label>
                  <input
                    type="text"
                    id="secondLastName"
                    name="secondLastName"
                    value={values.secondLastName}
                    onChange={handleInputChange("secondLastName")}
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Solo letras, espacios, guiones y apostrofes"
                  />
                  {errors.secondLastName && <p className="mt-1 text-sm text-red-600">{errors.secondLastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      <MailIcon className="h-4 w-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={values.email}
                      onChange={handleInputChange("email")}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="usuario@ejemplo.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      <PhoneIcon className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={values.phoneNumber}
                      onChange={handleInputChange("phoneNumber")}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1234567890 o 1234567890"
                    />
                    {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    <BadgeIcon className="h-4 w-4 inline mr-1" />
                    Role 
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={values.role}
                    onChange={handleInputChange("role")}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="driver">Driver</option>
                    <option value="admin">Administrator</option>
                  </select>
                  {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                </div>

                <div className="mt-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={values.status}
                    onChange={handleInputChange("status")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Documentos</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Profile Picture */}
                  <div>
                    <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-2">
                      <CameraIcon className="h-4 w-4 inline mr-1" />
                      Profile Picture
                    </label>

                    {/* Current/Preview Image */}
                    <div className="mb-3">
                      <img
                        src={profilePreview || user.profilePicture || "/placeholder.svg"}
                        alt="Vista previa de perfil"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                        }}
                      />
                    </div>

                    <input
                      type="file"
                      id="profilePicture"
                      name="profilePicture"
                      accept="image/*"
                      onChange={handleFileChange("profilePicture")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Formats: JPG, PNG, GIF. Maximum 5MB.</p>
                  </div>

                  {/* License */}
                  <div>
                    <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-2">
                      <FileTextIcon className="h-4 w-4 inline mr-1" />
                      Driver license
                    </label>

                    {/* Current/Preview Image */}
                    <div className="mb-3">
                      <img
                        src={licensePreview || user.license || "/placeholder.svg"}
                        alt="Vista previa de licencia"
                        className="w-full h-32 object-cover border-2 border-gray-200 rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                        }}
                      />
                    </div>

                    <input
                      type="file"
                      id="license"
                      name="license"
                      accept="image/*"
                      onChange={handleFileChange("license")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Formats: JPG, PNG, GIF. Maximum 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> If you don't select new images, the current ones will be kept. Changes will be applied immediately upon saving.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || isUpdating}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting || isUpdating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUpdating}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditUserModal
