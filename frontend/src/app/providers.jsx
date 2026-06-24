import React, { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../features/auth/services/authService'

// ─── AuthContext ──────────────────────────────────────────────────────────────

/**
 * AuthContext — cung cấp trạng thái authentication toàn cục.
 *
 * Shape: { user, isLoggedIn, login, logout }
 *   - user: { role: string } | null
 *   - isLoggedIn: boolean
 *   - login(userData): void  — gọi sau khi login thành công
 *   - logout(): Promise<void> — gọi API logout + clear state
 */
export const AuthContext = createContext(null)

/**
 * AuthProvider — wrap toàn bộ app để share auth state.
 *
 * Khởi tạo từ localStorage để giữ trạng thái khi reload trang.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser())

  /**
   * Gọi sau khi login thành công để cập nhật auth state.
   * authService.login() đã lưu vào localStorage — ở đây chỉ sync React state.
   * @param {{ role: string }} userData - user object từ login response
   */
  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  /**
   * Đăng xuất: gọi API revoke session + clear localStorage + reset React state.
   */
  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = {
    user,
    isLoggedIn: Boolean(user),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth — hook nội bộ (internal), chỉ dùng trong AuthProvider.
 * Các component nên import useAuth từ features/auth/hooks/useAuth.js
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}
