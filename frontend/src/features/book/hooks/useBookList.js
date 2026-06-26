import { useState, useEffect, useCallback } from 'react'
import { getBooks } from '../services/bookService'
import { getCategories } from '../services/categoryService'

/**
 * Hook gom toàn bộ logic "xem danh sách sách": load sách, danh mục thể loại,
 * tìm kiếm, lọc theo thể loại, sắp xếp, phân trang.
 * Dùng chung cho BookCatalogSection (trang chủ) và BookListPage (trang quản lý).
 *
 * KHÔNG xử lý phần chỉ-dành-cho-admin (CRUD sách, deposit policies) —
 * những phần đó nằm riêng ở BookListPage.jsx.
 *
 * @returns {object} state + actions để render UI xem sách
 */
const useBookList = () => {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sort, setSort] = useState('name_asc')

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getBooks({
        page,
        search: search || undefined,
        categoryId: categoryFilter || undefined,
        sort,
      })
      setBooks(data.items || [])
      setTotalPages(data.totalPages || 1)
      setTotalItems(data.totalItems || 0)
    } catch {
      setError('Không thể tải danh sách sách')
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter, sort])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  useEffect(() => {
    getCategories().then(d => setCategories(d.categories || [])).catch(() => {})
  }, [])

  // Submit tìm kiếm: áp dụng giá trị đang gõ (searchInput) làm search thật, về trang 1
  const handleSearchSubmit = useCallback(() => {
    setSearch(searchInput)
    setPage(1)
  }, [searchInput])

  // Xóa tìm kiếm: reset cả input và search, về trang 1
  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }, [])

  // Đổi thể loại: về trang 1
  const handleCategoryChange = useCallback((value) => {
    setCategoryFilter(value)
    setPage(1)
  }, [])

  // Đổi sắp xếp: về trang 1
  const handleSortChange = useCallback((value) => {
    setSort(value)
    setPage(1)
  }, [])

  return {
    // data
    books,
    categories,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    search,
    searchInput,
    categoryFilter,
    sort,

    // actions
    setPage,
    setSearchInput,
    onSearchSubmit: handleSearchSubmit,
    onClearSearch: handleClearSearch,
    onCategoryChange: handleCategoryChange,
    onSortChange: handleSortChange,
    reload: loadBooks,
  }
}

export default useBookList