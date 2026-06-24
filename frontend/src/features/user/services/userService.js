import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'

/**
 * User feature service — xử lý API calls cho tính năng Hồ Sơ Cá Nhân (UC03).
 *
 * Tất cả requests yêu cầu JWT token (đã được inject tự động bởi apiClient interceptor).
 */
export const userService = {
  /**
   * Lấy thông tin hồ sơ cá nhân của user đang đăng nhập.
   * GET /api/v1/profile
   *
   * @returns {Promise<{
   *   name: string, email: string, phone: string|null, address: string|null,
   *   joinedDate: string, role: string,
   *   borrowCount: number|null, totalFines: number|null
   * }>}
   *
   * @note borrowCount và totalFines hiện tại luôn null (module borrow/fine chưa triển khai).
   *       Sẽ có giá trị khi modules tương ứng được implement.
   */
  getProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE.GET)
    return response.data
  },

  /**
   * Cập nhật thông tin cá nhân (tên, SĐT, địa chỉ).
   * PUT /api/v1/profile
   *
   * @param {{ name: string, phone?: string, address?: string }} data
   * @returns {Promise<ProfileResponse>} Thông tin profile đã cập nhật
   */
  updateProfile: async (data) => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILE.UPDATE, data)
    return response.data
  },

  /**
   * Thay đổi mật khẩu.
   * PUT /api/v1/profile/password
   *
   * @param {{ oldPassword: string, newPassword: string, confirmPassword: string }} data
   * @returns {Promise<{ message: string }>}
   */
  changePassword: async (data) => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, data)
    return response.data
  },
}
