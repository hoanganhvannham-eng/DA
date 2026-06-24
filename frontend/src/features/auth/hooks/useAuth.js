import { useAuthContext } from '../../../app/providers'

/**
 * useAuth — hook để consume AuthContext trong bất kỳ component nào.
 *
 * @returns {{ user: object|null, isLoggedIn: boolean, login: Function, logout: Function }}
 *
 * @example
 * const { user, isLoggedIn, login, logout } = useAuth()
 */
export function useAuth() {
  return useAuthContext()
}
