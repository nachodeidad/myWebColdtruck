// User types
export interface User {
  id: string
  name: string
  lastName: string
  secondLastName?: string
  email: string
  phoneNumber: string
  status: "Available" | "On Trip" | "Unavailable" | "Disabled"
  role: UserRole
  license: string // Required
  profilePicture: string // Required
  registrationDate: string
}

export type UserRole = "admin" | "driver" // Only admin and driver

// Auth types
export interface AuthResponse {
  token: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  lastName: string
  secondLastName?: string
  email: string
  password: string
  phoneNumber: string
  status?: "Available" | "On Trip" | "Unavailable" | "Disabled"
  role: UserRole
  license: File // Required
  profilePicture: File // Required
}

// API Error type
export interface ApiError {
  msg: string
  errors?: Array<{
    field: string
    message: string
  }>
}

// Form state types
export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
}

// Auth context types
export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterFormData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

export * from "./Rute";
export * from "./Trip";
export * from "./Truck"

