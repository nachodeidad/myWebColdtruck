import type { LoginCredentials, RegisterFormData } from "../types"

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, "")
  // Phone should have between 7 and 15 digits (international standard)
  return cleanPhone.length >= 7 && cleanPhone.length <= 15
}

export const validateName = (name: string): boolean => {
  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']+$/
  return nameRegex.test(name.trim()) && name.trim().length >= 2
}

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "")

  // If phone doesn't start with country code, assume it needs a +
  if (cleanPhone.length > 0 && !phone.startsWith("+")) {
    return `+${cleanPhone}`
  }

  return phone.startsWith("+") ? phone : `+${cleanPhone}`
}

export const sanitizePhoneInput = (phone: string): string => {
  // Allow only digits, spaces, hyphens, parentheses, and plus sign
  return phone.replace(/[^\d\s\-$$$$+]/g, "")
}

export const validateLoginForm = (data: LoginCredentials): Partial<Record<keyof LoginCredentials, string>> => {
  const errors: Partial<Record<keyof LoginCredentials, string>> = {}

  if (!data.email) {
    errors.email = "Email es requerido"
  } else if (!validateEmail(data.email)) {
    errors.email = "Por favor ingresa un email válido"
  }

  if (!data.password) {
    errors.password = "Contraseña es requerida"
  } else if (!validatePassword(data.password)) {
    errors.password = "La contraseña debe tener al menos 6 caracteres"
  }

  return errors
}

export const validateRegisterForm = (data: RegisterFormData): Partial<Record<keyof RegisterFormData, string>> => {
  const errors: Partial<Record<keyof RegisterFormData, string>> = {}

  // Validate name
  if (!data.name.trim()) {
    errors.name = "Nombre es requerido"
  } else if (!validateName(data.name)) {
    errors.name = "El nombre solo puede contener letras, espacios, guiones y apostrofes"
  } else if (data.name.trim().length < 2) {
    errors.name = "El nombre debe tener al menos 2 caracteres"
  } else if (data.name.trim().length > 50) {
    errors.name = "El nombre no puede exceder 50 caracteres"
  }

  // Validate lastName
  if (!data.lastName.trim()) {
    errors.lastName = "Apellido es requerido"
  } else if (!validateName(data.lastName)) {
    errors.lastName = "El apellido solo puede contener letras, espacios, guiones y apostrofes"
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = "El apellido debe tener al menos 2 caracteres"
  } else if (data.lastName.trim().length > 50) {
    errors.lastName = "El apellido no puede exceder 50 caracteres"
  }

  // Validate secondLastName (optional)
  if (data.secondLastName && data.secondLastName.trim()) {
    if (!validateName(data.secondLastName)) {
      errors.secondLastName = "El segundo apellido solo puede contener letras, espacios, guiones y apostrofes"
    } else if (data.secondLastName.trim().length > 50) {
      errors.secondLastName = "El segundo apellido no puede exceder 50 caracteres"
    }
  }

  // Validate email
  if (!data.email) {
    errors.email = "Email es requerido"
  } else if (!validateEmail(data.email)) {
    errors.email = "Por favor ingresa un email válido (ejemplo: usuario@dominio.com)"
  }

  // Validate password
  if (!data.password) {
    errors.password = "Contraseña es requerida"
  } else if (!validatePassword(data.password)) {
    errors.password = "La contraseña debe tener al menos 6 caracteres"
  }

  // Validate phone number
  if (!data.phoneNumber) {
    errors.phoneNumber = "Número de teléfono es requerido"
  } else if (!validatePhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = "Por favor ingresa un número de teléfono válido (7-15 dígitos)"
  }

  // Validate role
  if (!data.role) {
    errors.role = "Rol es requerido"
  }

  if (
    data.status &&
    !["Available", "On Trip", "Unavailable", "Disabled"].includes(data.status)
  ) {
    errors.status = "Estatus inválido"
  }

  if (
    data.status &&
    !["Available", "On Trip", "Unavailable", "Disabled"].includes(data.status)
  ) {
    errors.status = "Estatus inválido"
  }

  // Validate files
  if (!data.license) {
    errors.license = "Imagen de licencia es requerida"
  }

  if (!data.profilePicture) {
    errors.profilePicture = "Foto de perfil es requerida"
  }

  return errors
}

// Validation for edit user form
export const validateEditUserForm = (data: {
  name: string
  lastName: string
  secondLastName?: string
  email: string
  phoneNumber: string
  role: string
  status?: string
}): Partial<Record<keyof typeof data, string>> => {
  const errors: Partial<Record<keyof typeof data, string>> = {}

  // Validate name
  if (!data.name.trim()) {
    errors.name = "Nombre es requerido"
  } else if (!validateName(data.name)) {
    errors.name = "El nombre solo puede contener letras, espacios, guiones y apostrofes"
  } else if (data.name.trim().length < 2) {
    errors.name = "El nombre debe tener al menos 2 caracteres"
  } else if (data.name.trim().length > 50) {
    errors.name = "El nombre no puede exceder 50 caracteres"
  }

  // Validate lastName
  if (!data.lastName.trim()) {
    errors.lastName = "Apellido es requerido"
  } else if (!validateName(data.lastName)) {
    errors.lastName = "El apellido solo puede contener letras, espacios, guiones y apostrofes"
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = "El apellido debe tener al menos 2 caracteres"
  } else if (data.lastName.trim().length > 50) {
    errors.lastName = "El apellido no puede exceder 50 caracteres"
  }

  // Validate email
  if (!data.email.trim()) {
    errors.email = "Email es requerido"
  } else if (!validateEmail(data.email)) {
    errors.email = "Por favor ingresa un email válido (ejemplo: usuario@dominio.com)"
  }

  // Validate phone number
  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = "Número de teléfono es requerido"
  } else if (!validatePhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = "Por favor ingresa un número de teléfono válido (7-15 dígitos)"
  }

  // Validate role
  if (!data.role) {
    errors.role = "Rol es requerido"
  }

  return errors
}
