"use client"

import type { AxiosError } from "axios"
import type React from "react"
import { useState } from "react"
import { useForm } from "../hooks/useForm"
import { authAPI } from "../services/api"
import type { ApiError, RegisterFormData } from "../types"
import { formatPhoneNumber, sanitizePhoneInput, validateRegisterForm } from "../utils/validation"

const initialValues: RegisterFormData = {
  name: "",
  lastName: "",
  secondLastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  status: "Available",
  role: "driver",
  license: null as any,
  profilePicture: null as any,
}

interface RegisterFormProps {
  onSuccess?: () => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [successMessage, setSuccessMessage] = useState<string>("")

  const { values, errors, isSubmitting, updateField, setError, handleSubmit, reset } = useForm({
    initialValues,
    validate: validateRegisterForm,
    onSubmit: async (data) => {
      try {
        setSuccessMessage("")

        const formattedData = {
          ...data,
          phoneNumber: formatPhoneNumber(data.phoneNumber),
        }

        const formData = new FormData()
        formData.append("name", formattedData.name.trim())
        formData.append("lastName", formattedData.lastName.trim())
        if (formattedData.secondLastName) {
          formData.append("secondLastName", formattedData.secondLastName.trim())
        }
        formData.append("email", formattedData.email.trim().toLowerCase())
        formData.append("password", formattedData.password)
        formData.append("phoneNumber", formattedData.phoneNumber)
        if (formattedData.status) {
          formData.append("status", formattedData.status)
        }
        formData.append("role", formattedData.role)
        formData.append("license", formattedData.license)
        formData.append("profilePicture", formattedData.profilePicture)

        // Llamar directamente a la API sin usar el contexto de auth
        const response = await authAPI.registerWithoutLogin(formData)

        setSuccessMessage(
            `Usuario ${response.user.name} ${response.user.lastName} registrado exitosamente con el ID #${response.user.id}`,
        )
        reset()

        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>
        const message = axiosError.response?.data?.msg || "Error al registrar usuario"
        setError("email", message)
      }
    },
  })

  const handleInputChange =
    (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value

      if (field === "name" || field === "lastName" || field === "secondLastName") {
        value = value.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']/g, "")
      } else if (field === "phoneNumber") {
        value = sanitizePhoneInput(value)
      } else if (field === "email") {
        value = value.toLowerCase().trim()
      }

      updateField(field, value)
      setSuccessMessage("")
    }

  const handleFileChange = (field: "license" | "profilePicture") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    updateField(field, file)
    setSuccessMessage("") // Clear success message when user selects file
  }

  return (
    <div className="max-w-4xl mx-auto">
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-600">*</span>
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
              placeholder="Type the name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Only letters, spaces, hyphens (-) and apostrophes (') are allowed.
            </p>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-600">*</span>
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
              placeholder="Type the last name"
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Solo se permiten letras, espacios, guiones (-) y apostrofes (')
            </p>
          </div>

          <div>
            <label htmlFor="secondLastName" className="block text-sm font-medium text-gray-700 mb-2">
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
              placeholder="Type the second last name"
            />
            {errors.secondLastName && <p className="mt-1 text-sm text-red-600">{errors.secondLastName}</p>}
            <p className="mt-1 text-xs text-gray-500">Only letters, spaces, hyphens and apostrophes</p>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-600">*</span>
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
          <p className="mt-1 text-xs text-gray-500">Debe ser un email válido (ejemplo: usuario@dominio.com)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleInputChange("password")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Minimum 6 characters"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={values.phoneNumber}
              onChange={handleInputChange("phoneNumber")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1234567890 or 1234567890"
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
            <p className="mt-1 text-xs text-gray-500">Only numbers, spaces, hyphens, parentheses and + sign</p>
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Rol <span className="text-red-600">*</span>
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

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
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
            <option value="Unavailable">Unavailable</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange("profilePicture")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.profilePicture && <p className="mt-1 text-sm text-red-600">{errors.profilePicture}</p>}
          </div>
          <div>
            <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-2">
              Driver license <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              id="license"
              name="license"
              accept="image/*"
              onChange={handleFileChange("license")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.license && <p className="mt-1 text-sm text-red-600">{errors.license}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registrando...
              </div>
            ) : (
              "Registrar Usuario"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegisterForm
