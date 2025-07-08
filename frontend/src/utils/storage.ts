import type { User } from "../types"

const TOKEN_KEY = "token"
const USER_KEY = "user"

export const storage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null

    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY)
  },

  clear(): void {
    this.removeToken()
    this.removeUser()
  },

  setAuthData(token: string, user: User): void {
    this.setToken(token)
    this.setUser(user)
  },
}
