import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBookDetail, createBook, updateBook, deleteBook, uploadBookCover, deleteBookCover } from '../services/bookService'
import { getDepositPolicies } from '../../borrow/services/borrowService'
import { useAuth } from '../../auth/hooks/useAuth'
import useBookList from '../hooks/useBookList'
import BookFilters from '../components/BookFilters'
import BookGrid from '../components/BookGrid'
import BookPagination from '../components/BookPagination'

const EMPTY_FORM = {
  title: '', author: '', publishedYear: new Date().getFullYear(),
  isbn: '', categoryId: '', description: '', totalQuantity: 1,
  replacementPrice: 0, depositPolicyId: '', customDepositRate: '',
}

const BookListPage = () => {
  const { user } = useAuth()

  const {
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
    setPage,
    setSearchInput,
    onSearchSubmit,
    onClearSearch,
    onCategoryChange,
    onSortChange,
    reload,
  } = useBookList()

  const [depositPolicies, setDepositPolicies] = useState([])
  const [successMessage, setSuccessMessage] = useState('')

  // Modal state
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Cover upload state
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverError, setCoverError] = useState('')

  // Delete modal
  const [deletingBook, setDeletingBook] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const isStaff = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN'

  useEffect(() => {
    getDepositPolicies().then(d => setDepositPolicies(Array.isArray(d) ? d : [])).catch(() => { })
  }, [])

  useEffect(() => {
    if (!successMessage) return
    const t = setTimeout(() => setSuccessMessage(''), 3500)
    return () => clearTimeout(t)
  }, [successMessage])

  const ALLOWED_TYPES = ['image/jpeg', 'image/png']
  const MAX_SIZE = 5 * 1024 * 1024

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setCoverError('Chỉ chấp nhận file JPG hoặc PNG')
      setCoverFile(null)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      setCoverPreview(null)
      return
    }
    if (file.size > MAX_SIZE) {
      setCoverError('Dung lượng ảnh tối đa 5MB')
      setCoverFile(null)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
      setCoverPreview(null)
      return
    }

    setCoverError('')
    setCoverFile(file)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview(URL.createObjectURL(file))
  }

  const openAddForm = () => {
    setEditingBook(null); setFormData(EMPTY_FORM); setFormErrors({}); setShowForm(true)
    setCoverFile(null); setCoverError('')
    if (coverPreview) { URL.revokeObjectURL(coverPreview); setCoverPreview(null) }
  }
  const openEditForm = async (book) => {
    try {
      setSubmitting(true)
      const detail = await getBookDetail(book.id)
      setEditingBook(detail)
      setFormData({
        title: detail.title, author: detail.author, publishedYear: detail.publishedYear,
        isbn: detail.isbn || '', categoryId: detail.categoryId || '',
        description: detail.description || '', totalQuantity: detail.totalQuantity,
        replacementPrice: detail.replacementPrice || 0,
        depositPolicyId: detail.depositPolicyId || '',
        customDepositRate: detail.customDepositRate ?? '',
      })
      setFormErrors({}); setShowForm(true)
    } catch {
      setFormErrors({ _global: 'Không thể tải thông tin sách' })
    } finally { setSubmitting(false) }
    setCoverFile(null); setCoverError('')
    if (coverPreview) { URL.revokeObjectURL(coverPreview); setCoverPreview(null) }
  }
  const closeForm = () => {
    setShowForm(false); setEditingBook(null); setFormErrors({})
    setCoverFile(null); setCoverError('')
    if (coverPreview) { URL.revokeObjectURL(coverPreview); setCoverPreview(null) }
  }

  const validate = () => {
    const e = {}
    if (!formData.title.trim()) e.title = 'Tên sách không được để trống'
    else if (formData.title.length > 100) e.title = 'Tối đa 100 ký tự'
    if (!formData.author.trim()) e.author = 'Tác giả không được để trống'
    else if (formData.author.length > 100) e.author = 'Tối đa 100 ký tự'
    const yr = Number(formData.publishedYear)
    if (!yr || yr < 1900 || yr > new Date().getFullYear()) e.publishedYear = `Năm phải từ 1900 đến ${new Date().getFullYear()}`
    if (!formData.categoryId) e.categoryId = 'Vui lòng chọn thể loại'
    if (!formData.description.trim()) e.description = 'Mô tả không được để trống'
    else if (formData.description.length > 255) e.description = 'Tối đa 255 ký tự'
    if (!formData.totalQuantity || Number(formData.totalQuantity) < 1) e.totalQuantity = 'Số lượng phải > 0'
    if (!formData.depositPolicyId) e.depositPolicyId = 'Vui lòng chọn chính sách cọc'
    if (formData.replacementPrice === '' || formData.replacementPrice === null) e.replacementPrice = 'Giá trị sách không được để trống'
    else if (Number(formData.replacementPrice) <= 0) e.replacementPrice = 'Giá trị sách phải lớn hơn 0'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    try {
      setSubmitting(true)
      const payload = {
        title: formData.title.trim(), author: formData.author.trim(),
        publishedYear: Number(formData.publishedYear),
        isbn: formData.isbn.trim() || null,
        categoryId: formData.categoryId,
        description: formData.description.trim(),
        totalQuantity: Number(formData.totalQuantity),
        replacementPrice: Number(formData.replacementPrice),
        depositPolicyId: formData.depositPolicyId,
        customDepositRate: formData.customDepositRate !== '' ? Number(formData.customDepositRate) : null,
      }
      let bookId
      if (editingBook) {
        await updateBook(editingBook.id, payload)
        bookId = editingBook.id
        setSuccessMessage('Cập nhật sách thành công')
      } else {
        const result = await createBook(payload)
        bookId = result.book.id
        setSuccessMessage('Thêm sách thành công')
      }
      if (coverFile) {
        await uploadBookCover(bookId, coverFile)
        setSuccessMessage(p => p === 'Thêm sách thành công' ? 'Thêm sách và ảnh bìa thành công' : 'Cập nhật sách và ảnh bìa thành công')
      }
      closeForm(); setPage(1); reload()
    } catch (err) {
      const msg = err.response?.data?.message || 'Thao tác thất bại'
      setFormErrors({ _global: msg })
    } finally { setSubmitting(false) }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingBook) return
    try {
      setDeleting(true); setDeleteError('')
      await deleteBook(deletingBook.id)
      setDeletingBook(null)
      setSuccessMessage('Xóa sách thành công')
      reload()
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Xóa sách thất bại')
    } finally { setDeleting(false) }
  }

  const formatVND = (value) => {
    const digits = String(value).replace(/\D/g, '')
    if (!digits) return ''
    return Number(digits).toLocaleString('vi-VN')
  }

  const handlePriceChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    setFormData(p => ({ ...p, replacementPrice: digits === '' ? '' : Number(digits) }))
    setFormErrors(p => ({ ...p, replacementPrice: '' }))
  }

  const field = (name, label, type = 'text', extra = {}) => (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={`form-${name}`}
          rows={3}
          value={formData[name]}
          onChange={e => { setFormData(p => ({ ...p, [name]: e.target.value })); setFormErrors(p => ({ ...p, [name]: '' })) }}
          className={`w-full px-3 py-2 rounded-2xl bg-white/[0.05] border text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300 resize-none ${formErrors[name] ? 'border-rose-500/50' : 'border-white/10'}`}
          {...extra}
        />
      ) : (
        <input
          id={`form-${name}`}
          type={type}
          value={formData[name]}
          onChange={e => { setFormData(p => ({ ...p, [name]: e.target.value })); setFormErrors(p => ({ ...p, [name]: '' })) }}
          className={`w-full px-3 py-2 rounded-2xl bg-white/[0.05] border text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300 ${formErrors[name] ? 'border-rose-500/50' : 'border-white/10'}`}
          {...extra}
        />
      )}
      {formErrors[name] && <p className="text-rose-400 text-xs mt-1">{formErrors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-10" style={{ perspective: '1000px' }}>
      {/* Ambient cyan blob */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -z-0" />
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Back link */}
        <Link
          to="/"
          id="btn-back-home"
          className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm transition-colors duration-300 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-black text-3xl text-white" style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>Thư viện sách</h1>
            <p className="text-white/40 text-sm mt-1">Danh mục sách trong hệ thống thư viện</p>
          </div>
          {isStaff && (
            <button id="btn-add-book" onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-cyan-500/30 active:scale-95">
              <span className="text-lg leading-none">+</span> Thêm sách mới
            </button>
          )}
        </div>

        {/* Success toast */}
        {successMessage && (
          <div id="success-toast" role="alert" className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 text-emerald-400 text-sm animate-fadeIn duration-300">
            <span className="font-bold">✓</span> {successMessage}
          </div>
        )}

        {/* Filters */}
        <BookFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={onSearchSubmit}
          searchActive={!!search}
          onClearSearch={onClearSearch}
          categoryFilter={categoryFilter}
          categories={categories}
          onCategoryChange={onCategoryChange}
          sort={sort}
          onSortChange={onSortChange}
        />

        {/* Book Grid */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl p-6">
          <BookGrid
            books={books}
            loading={loading}
            error={error}
            onRetry={reload}
            emptyMessage={search || categoryFilter ? 'Không tìm thấy sách phù hợp.' : 'Chưa có sách nào trong hệ thống.'}
            showAdminActions={isStaff}
            onEdit={openEditForm}
            onDelete={(book) => { setDeletingBook(book); setDeleteError('') }}
          />
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <BookPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div id="modal-book-form" role="dialog" aria-modal="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeForm}>
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-xl text-white mb-5 flex items-center gap-2">
              <span className="text-cyan-400">{editingBook ? '✏️' : '📗'}</span>
              {editingBook ? 'Sửa thông tin sách' : 'Thêm sách mới'}
            </h2>
            <form id="book-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('title', 'Tên sách *', 'text', { maxLength: 100, placeholder: 'Nhập tên sách' })}
                {field('author', 'Tác giả *', 'text', { maxLength: 100, placeholder: 'Nhập tên tác giả' })}
                {field('publishedYear', 'Năm xuất bản *', 'number', { min: 1900, max: new Date().getFullYear() })}
                {field('isbn', 'ISBN (tùy chọn)', 'text', { placeholder: 'ISBN-10 hoặc ISBN-13' })}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Thể loại *</label>
                  <select id="form-categoryId" value={formData.categoryId}
                    onChange={e => { setFormData(p => ({ ...p, categoryId: e.target.value })); setFormErrors(p => ({ ...p, categoryId: '' })) }}
                    className={`w-full px-3 py-2 rounded-2xl bg-white/[0.05] border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300 ${formErrors.categoryId ? 'border-rose-500/50' : 'border-white/10'}`}>
                    <option className="bg-slate-900" value="">-- Chọn thể loại --</option>
                    {categories.map(c => <option className="bg-slate-900" key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {formErrors.categoryId && <p className="text-rose-400 text-xs mt-1">{formErrors.categoryId}</p>}
                </div>
                {field('totalQuantity', 'Số lượng *', 'number', { min: 1 })}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Giá trị sách (VNĐ) *</label>
                  <input
                    id="form-replacementPrice"
                    type="text"
                    inputMode="numeric"
                    value={formatVND(formData.replacementPrice)}
                    onChange={handlePriceChange}
                    placeholder="VD: 200.000"
                    className={`w-full px-3 py-2 rounded-2xl bg-white/[0.05] border text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300 ${formErrors.replacementPrice ? 'border-rose-500/50' : 'border-white/10'}`}
                  />
                  {formErrors.replacementPrice && <p className="text-rose-400 text-xs mt-1">{formErrors.replacementPrice}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Chính sách cọc *</label>
                  <select id="form-depositPolicyId" value={formData.depositPolicyId}
                    onChange={e => { setFormData(p => ({ ...p, depositPolicyId: e.target.value })); setFormErrors(p => ({ ...p, depositPolicyId: '' })) }}
                    className={`w-full px-3 py-2 rounded-2xl bg-white/[0.05] border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300 ${formErrors.depositPolicyId ? 'border-rose-500/50' : 'border-white/10'}`}>
                    <option className="bg-slate-900" value="">-- Chọn chính sách --</option>
                    {depositPolicies.map(p => (
                      <option className="bg-slate-900" key={p.id} value={p.id}>{p.name} ({p.depositRate}%)</option>
                    ))}
                  </select>
                  {formErrors.depositPolicyId && <p className="text-rose-400 text-xs mt-1">{formErrors.depositPolicyId}</p>}
                </div>
                {field('customDepositRate', 'Tỷ lệ cọc riêng (tùy chọn)', 'number', { min: 0, max: 100, placeholder: 'Để trống = dùng chính sách' })}
              </div>
              {field('description', 'Mô tả *', 'textarea', { maxLength: 255, placeholder: 'Nhập mô tả sách' })}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ảnh bìa (JPG/PNG, tối đa 5MB)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleCoverSelect}
                  className="w-full text-sm text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 file:cursor-pointer cursor-pointer"
                />
                {editingBook && editingBook.imageUrl && !coverFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-white/40">Ảnh hiện tại:</span>
                    <img src={editingBook.imageUrl} alt="" className="w-10 h-14 rounded object-cover" />
                    <button type="button" onClick={async () => {
                      try {
                        await deleteBookCover(editingBook.id)
                        setSuccessMessage('Đã xóa ảnh bìa')
                        reload()
                      } catch {
                        setFormErrors({ _global: 'Xóa ảnh bìa thất bại' })
                      }
                    }} className="text-xs text-rose-400 hover:text-rose-300">Xóa</button>
                  </div>
                )}
                {coverPreview && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
                    <img src={coverPreview} alt="Preview" className="w-full h-40 object-contain bg-slate-950" />
                  </div>
                )}
                {coverError && <p className="text-rose-400 text-xs mt-1">{coverError}</p>}
              </div>
              {formErrors._global && (
                <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{formErrors._global}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white/5 text-white/60 font-semibold text-sm transition-all duration-300 disabled:opacity-50 hover:bg-white/10">Hủy</button>
                <button id="btn-submit-book" type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-cyan-500 text-white font-bold text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 shadow-lg shadow-cyan-500/30">
                  {submitting ? 'Đang lưu...' : (editingBook ? 'Cập nhật' : 'Thêm sách')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingBook && (
        <div id="modal-delete-confirm" role="dialog" aria-modal="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeletingBook(null)}>
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}>
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h2 className="text-lg font-bold text-white text-center mb-2">Xác nhận xóa sách</h2>
            <p className="text-white/40 text-sm text-center mb-4">
              Bạn có chắc muốn xóa sách <span className="text-cyan-400 font-semibold">"{deletingBook.title}"</span>?<br />
              <span className="text-rose-400 text-xs mt-1 inline-block">Sách sẽ bị ẩn khỏi danh mục và không thể phục hồi.</span>
            </p>
            {deleteError && (
              <div id="delete-error-msg" className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-4">{deleteError}</div>
            )}
            <div className="flex gap-3">
              <button id="btn-cancel-delete" onClick={() => setDeletingBook(null)} disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/5 text-white/60 font-semibold text-sm transition-all duration-300 disabled:opacity-50 hover:bg-white/10">Hủy</button>
              <button id="btn-confirm-delete" onClick={handleDeleteConfirm} disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 shadow-lg shadow-rose-500/30">
                {deleting ? 'Đang xóa...' : 'Xóa sách'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookListPage