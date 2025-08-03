"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { AuthContextType, User, LoginCredentials, RegisterFormData } from "../types"
import { authAPI } from "../services/api"
import { storage } from "../utils/storage"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    storage.setUser(updatedUser)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await authAPI.login(credentials)
      storage.setAuthData(response.token, response.user)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }, [])

  const register = useCallback(async (userData: RegisterFormData): Promise<void> => {
    try {
      const response = await authAPI.register(userData)
      storage.setAuthData(response.token, response.user)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }, [])

  const logout = useCallback((): void => {
    storage.clear()
    setUser(null)
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      const token = storage.getToken()
      const savedUser = storage.getUser()

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const currentUser = await authAPI.getProfile()
          setUser(currentUser)
          storage.setUser(currentUser)
        } catch (error) {
          // Token is invalid, clear storage
          storage.clear()
          setUser(null)
        }
      }

      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
