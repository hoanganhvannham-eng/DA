import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'

// ─── Token storage keys ───────────────────────────────────────────────────────
const TOKEN_KEY = 'auth_token'
const USER_KEY  = 'auth_user'

/**
 * Auth feature service — handles all authentication API calls.
 * Token is stored in localStorage and injected via axios interceptor.
 */
export const authService = {
  /**
   * Register a new user account.
   * @param {{ email: string, name: string, password: string, confirmPassword: string }} data
   * @returns {Promise<{ message: string, userId: string }>}
   */
  register: async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data)
    return response.data
  },

  /**
   * Verify email with the token from verification link.
   * @param {string} token - raw verification token
   * @returns {Promise<{ message: string }>}
   */
  verifyEmail: async (token) => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      params: { token },
    })
    return response.data
  },

  /**
   * Resend verification email.
   * @param {string} email
   * @returns {Promise<{ message: string }>}
   */
  resendVerification: async (email) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
      email,
    })
    return response.data
  },

  /**
   * [DEV ONLY] Manually activate a PENDING account.
   * Only works when backend runs with "dev" or "local" Spring profile.
   * Vite sets import.meta.env.DEV = true automatically in dev mode.
   * @param {string} email
   * @returns {Promise<{ message: string }>}
   */
  devActivateAccount: async (email) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.DEV.ACTIVATE_ACCOUNT}?email=${encodeURIComponent(email)}`
    )
    return response.data
  },

  /**
   * Login with email/password.
   * Stores JWT and user info in localStorage on success.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, expiresIn: number, user: { role: string } }>}
   */
  login: async ({ email, password }) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password })
    const data = response.data
    // Persist token & user for subsequent requests
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data
  },

  /**
   * Logout — revokes server-side session, clears local storage.
   * Silently ignores server errors (token may already be expired).
   */
  logout: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    try {
      if (token) {
        await apiClient.post(
          API_ENDPOINTS.AUTH.LOGOUT,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch {
      // Session may already be expired — still clear local state
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  /**
   * Request a password reset email (UC03b).
   * Always returns a generic message (anti-enumeration BR-PWD-03).
   * @param {string} email
   * @returns {Promise<{ message: string }>}
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
    return response.data
  },

  /**
   * Reset password using the token from the email link (UC03b).
   * @param {{ token: string, newPassword: string, confirmPassword: string }} data
   * @returns {Promise<{ message: string }>}
   */
  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
      confirmPassword,
    })
    return response.data
  },

  // ─── Token helpers ────────────────────────────────────────────────────────

  /** Returns the stored JWT string, or null if not logged in. */
  getToken: () => localStorage.getItem(TOKEN_KEY),

  /** Returns the stored user object, or null. */
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY)
    try { return raw ? JSON.parse(raw) : null } catch { return null }
  },

  /** True if a token exists in storage (does NOT validate expiry). */
  isLoggedIn: () => Boolean(localStorage.getItem(TOKEN_KEY)),
}
