import apiClient from '../../../shared/services/apiClient'

const BASE_URL = '/v1/books'

/**
 * Lấy danh sách sách với phân trang và bộ lọc (UC06).
 *
 * @param {Object} params - Query parameters
 * @param {number} params.page - Số trang (bắt đầu từ 1, mặc định 1)
 * @param {string} [params.search] - Từ khóa tìm kiếm theo tên/tác giả
 * @param {string} [params.categoryId] - UUID thể loại để lọc
 * @param {string} [params.sort] - Sắp xếp: NAME_ASC | NEWEST_YEAR | MOST_POPULAR
 * @returns {Promise<{items: Array, page: number, pageSize: number, totalItems: number, totalPages: number}>}
 */
export const getBooks = async ({ page = 1, search, categoryId, sort = 'name_asc' } = {}) => {
  const params = { page, sort }
  if (search && search.trim()) params.search = search.trim()
  if (categoryId) params.categoryId = categoryId

  const response = await apiClient.get(BASE_URL, { params })
  return response.data
}

/**
 * Lấy chi tiết sách (UC07).
 * Nội dung trả về phụ thuộc vào role của người dùng hiện tại.
 *
 * @param {string} bookId - UUID của sách
 * @returns {Promise<Object>} Book detail với role-based content
 */
export const getBookDetail = async (bookId) => {
  const response = await apiClient.get(`${BASE_URL}/${bookId}`)
  return response.data
}

/**
 * Thêm sách mới (UC05). Yêu cầu role LIBRARIAN.
 *
 * @param {Object} bookData - Dữ liệu sách
 * @param {string} bookData.title - Tên sách (max 100 ký tự)
 * @param {string} bookData.author - Tác giả (max 100 ký tự)
 * @param {number} bookData.publishedYear - Năm xuất bản (1900 - năm hiện tại)
 * @param {string} [bookData.isbn] - ISBN (tùy chọn, ISBN-10 hoặc ISBN-13)
 * @param {string} bookData.categoryId - UUID thể loại
 * @param {string} bookData.description - Mô tả (max 255 ký tự)
 * @param {number} bookData.totalQuantity - Số lượng (> 0)
 * @returns {Promise<{message: string, book: Object}>}
 */
export const createBook = async (bookData) => {
  const response = await apiClient.post(BASE_URL, bookData)
  return response.data
}

/**
 * Cập nhật thông tin sách (UC08). Yêu cầu role LIBRARIAN.
 * Áp dụng inventory-safe check: số lượng mới không được < đơn mượn đang hoạt động.
 *
 * @param {string} bookId - UUID của sách
 * @param {Object} bookData - Dữ liệu cập nhật (cùng cấu trúc với createBook)
 * @returns {Promise<{message: string, book: Object}>}
 */
export const updateBook = async (bookId, bookData) => {
  const response = await apiClient.put(`${BASE_URL}/${bookId}`, bookData)
  return response.data
}

/**
 * Xóa mềm sách (UC09). Yêu cầu role LIBRARIAN.
 * Thất bại nếu sách đang có đơn mượn chưa kết thúc.
 *
 * @param {string} bookId - UUID của sách cần xóa
 * @returns {Promise<{message: string}>}
 */
export const deleteBook = async (bookId) => {
  const response = await apiClient.delete(`${BASE_URL}/${bookId}`)
  return response.data
}

export const getBookMoods = async (bookId) => {
  const response = await apiClient.get(`${BASE_URL}/${bookId}/moods`)
  return response.data
}

export const updateBookMoods = async (bookId, moodIds) => {
  const response = await apiClient.put(`${BASE_URL}/${bookId}/moods`, { moodIds })
  return response.data
}

export const uploadBookCover = async (bookId, file) => {
  const formData = new FormData()
  formData.append('cover_image', file)
  const response = await apiClient.post(`${BASE_URL}/${bookId}/cover`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteBookCover = async (bookId) => {
  const response = await apiClient.delete(`${BASE_URL}/${bookId}/cover`)
  return response.data
}
