import apiClient from '../../../shared/services/apiClient'

const BASE_URL = '/v1/categories'

/**
 * Lấy danh sách tất cả thể loại sách.
 * Yêu cầu role LIBRARIAN.
 *
 * @returns {Promise<{categories: Array, traceId: string}>}
 */
export const getCategories = async () => {
  const response = await apiClient.get(BASE_URL)
  return response.data
}

/**
 * Tạo thể loại sách mới.
 *
 * @param {string} name - Tên thể loại (max 50 ký tự)
 * @returns {Promise<{message: string, category: Object, traceId: string}>}
 */
export const createCategory = async (name) => {
  const response = await apiClient.post(BASE_URL, { name })
  return response.data
}

/**
 * Cập nhật tên thể loại sách.
 *
 * @param {string} id - UUID của thể loại
 * @param {string} name - Tên mới
 * @returns {Promise<{message: string, category: Object, traceId: string}>}
 */
export const updateCategory = async (id, name) => {
  const response = await apiClient.put(`${BASE_URL}/${id}`, { name })
  return response.data
}

/**
 * Xóa thể loại sách (hard delete).
 * Thất bại nếu thể loại còn sách chưa xóa.
 *
 * @param {string} id - UUID của thể loại cần xóa
 * @returns {Promise<{message: string, traceId: string}>}
 */
export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`)
  return response.data
}
