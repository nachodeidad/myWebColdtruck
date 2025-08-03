import axios from "axios"
import type { LoginData, RegisterData, AuthResponse, User } from "../types/User"

const API_URL = "http://localhost:5000/api/auth"

const api = axios.create({
  baseURL: API_URL,
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers["x-auth-token"] = token
  }
  return config
})

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post("/login", data)
    return response.data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const formData = new FormData()

    // NO incluir el campo "number"
    formData.append("name", data.name)
    formData.append("lastName", data.lastName)
    formData.append("email", data.email)
    formData.append("password", data.password)
    formData.append("phoneNumber", data.phoneNumber)

    if (data.role) {
      formData.append("role", data.role)
    }

    if (data.license) {
      formData.append("license", data.license)
    }

    if (data.profilePicture) {
      formData.append("profilePicture", data.profilePicture)
    }

    const response = await api.post("/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get("/profile")
    return response.data
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  getToken(): string | null {
    return localStorage.getItem("token")
  },

  setAuthData(token: string, user: User) {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
  },
}

export default api
