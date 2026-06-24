import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'

export const adminUserService = {
  getFilteredUsers: async ({ keyword, role, page, size } = {}) => {
    const params = {}
    if (keyword) params.keyword = keyword
    if (role) params.role = role
    if (page) params.page = page
    if (size) params.size = size
    const response = await apiClient.get(API_ENDPOINTS.ADMIN_USER.LIST, { params })
    return response.data
  },

  updateUserStatus: async (userId, status) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ADMIN_USER.STATUS.replace(':id', userId),
      { status }
    )
    return response.data
  },

  assignRole: async (userId, newRole) => {
    const response = await apiClient.put(
      API_ENDPOINTS.ADMIN_USER.ROLE.replace(':id', userId),
      { newRole }
    )
    return response.data
  },
}
