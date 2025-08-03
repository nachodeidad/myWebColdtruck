import axios, { type AxiosResponse, type AxiosError } from "axios"
import type { LoginCredentials, RegisterFormData, AuthResponse, User, ApiError } from "../types"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token and block modifications for unavailable users
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["x-auth-token"] = token
    }
    if (config.method && config.method.toLowerCase() !== "get") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as User
          if (user.status === "Unavailable") {
            return Promise.reject({
              response: { status: 403, data: { msg: "User unavailable" } },
            })
          }
          if (user.status === "Disabled") {
            return Promise.reject({
              response: { status: 403, data: { msg: "Account disabled" } },
            })
          }
        } catch {}
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    if (
      error.response?.status === 403 &&
      error.response.data?.msg === "Account disabled"
    ) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/disabled"
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials)
    return response.data
  },

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    const formData = new FormData()

    // Append text fields (number removed)
    formData.append("name", userData.name)
    formData.append("lastName", userData.lastName)
    if (userData.secondLastName) {
      formData.append("secondLastName", userData.secondLastName)
    }
    formData.append("email", userData.email)
    formData.append("password", userData.password)
    formData.append("phoneNumber", userData.phoneNumber)
    if (userData.status) {
      formData.append("status", userData.status)
    }
    formData.append("role", userData.role)

    // Append required files
    formData.append("license", userData.license)
    formData.append("profilePicture", userData.profilePicture)

    const response = await api.post<AuthResponse>("/auth/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  // Nueva función para registrar sin hacer login automático
  async registerWithoutLogin(formData: FormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register-only", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>("/auth/profile")
    return response.data
  },

  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/auth/users")
    return response.data
  },

  async updateUser(userId: string, userData: FormData): Promise<User> {
    const response = await api.put<User>(`/auth/users/${userId}`, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
}

export default api
