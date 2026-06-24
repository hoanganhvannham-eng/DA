import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService'

/**
 * Trang Quản lý Thể loại Sách (UC04 / 2.2.1)
 *
 * Chức năng:
 * - Xem danh sách thể loại ở dạng bảng
 * - Thêm thể loại mới qua inline form
 * - Sửa trực tiếp tên thể loại trên bảng (inline edit — click tên để sửa)
 * - Xóa thể loại (với confirm dialog)
 *
 * Yêu cầu: Đăng nhập với vai trò LIBRARIAN
 */
const CategoryManagementPage = () => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Inline editing
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editError, setEditError] = useState('')
  const [savingId, setSavingId] = useState(null)

  // Add category
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  // Delete confirmation
  const [deletingCategory, setDeletingCategory] = useState(null) // {id, name}
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Success notification
  const [successMessage, setSuccessMessage] = useState('')

  // ─── Load data ───────────────────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCategories()
      setCategories(data.categories || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách thể loại'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // ─── Auto-clear success message ──────────────────────────────────────────
  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(''), 3500)
    return () => clearTimeout(timer)
  }, [successMessage])

  // ─── Inline Edit handlers ────────────────────────────────────────────────
  const handleStartEdit = (category) => {
    setEditingId(category.id)
    setEditingName(category.name)
    setEditError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setEditError('')
  }

  const handleSaveEdit = async (categoryId) => {
    const trimmed = editingName.trim()
    if (!trimmed) { setEditError('Tên thể loại không được để trống'); return }
    if (trimmed.length > 50) { setEditError('Tên thể loại tối đa 50 ký tự'); return }

    try {
      setSavingId(categoryId)
      setEditError('')
      const data = await updateCategory(categoryId, trimmed)
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? data.category : c))
      )
      setEditingId(null)
      setSuccessMessage('Cập nhật thể loại thành công')
    } catch (err) {
      setEditError(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setSavingId(null)
    }
  }

  const handleEditKeyDown = (e, categoryId) => {
    if (e.key === 'Enter') handleSaveEdit(categoryId)
    if (e.key === 'Escape') handleCancelEdit()
  }

  // ─── Add Category handlers ───────────────────────────────────────────────
  const handleAdd = async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) { setAddError('Tên thể loại không được để trống'); return }
    if (trimmed.length > 50) { setAddError('Tên thể loại tối đa 50 ký tự'); return }

    try {
      setAdding(true)
      setAddError('')
      const data = await createCategory(trimmed)
      setCategories((prev) =>
        [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      )
      setNewCategoryName('')
      setShowAddForm(false)
      setSuccessMessage('Thêm thể loại thành công')
    } catch (err) {
      setAddError(err.response?.data?.message || 'Thêm thể loại thất bại')
    } finally {
      setAdding(false)
    }
  }

  const handleCancelAdd = () => {
    setShowAddForm(false)
    setNewCategoryName('')
    setAddError('')
  }

  // ─── Delete handlers ─────────────────────────────────────────────────────
  const handleDeleteClick = (category) => {
    setDeletingCategory(category)
    setDeleteError('')
  }

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return
    try {
      setDeleting(true)
      setDeleteError('')
      await deleteCategory(deletingCategory.id)
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id))
      setDeletingCategory(null)
      setSuccessMessage('Xóa thể loại thành công')
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Xóa thể loại thất bại')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setDeletingCategory(null)
    setDeleteError('')
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-10 relative">
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 blur-[80px] -z-10 pointer-events-none" />
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Back link ───────────────────────────────────────────── */}
        <Link
          to="/"
          id="btn-back-home"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight text-glow-cyan">
              Quản lý Thể loại Sách
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Thêm, sửa, xóa các thể loại sách trong hệ thống
            </p>
          </div>
          <button
            id="btn-add-category"
            onClick={() => { setShowAddForm(true); setAddError(''); setNewCategoryName('') }}
            disabled={showAddForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-500
              hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-bold text-sm transition-all duration-200 shadow-lg
              shadow-cyan-500/30 active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
            Thêm thể loại sách
          </button>
        </div>

        {/* ── Success Toast ─────────────────────────────────────────── */}
        {successMessage && (
          <div
            id="success-toast"
            role="alert"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 backdrop-blur-xl
              border border-emerald-500/20 text-emerald-300 text-sm"
          >
            <span className="text-emerald-400 font-bold">✓</span>
            {successMessage}
          </div>
        )}

        {/* ── Add Form Card ─────────────────────────────────────────── */}
        {showAddForm && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-5 shadow-2xl">
            <h3 className="text-white font-semibold mb-3">Thêm thể loại mới</h3>
            <div className="flex gap-3 flex-wrap">
              <input
                id="input-new-category-name"
                type="text"
                value={newCategoryName}
                onChange={(e) => { setNewCategoryName(e.target.value); setAddError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancelAdd() }}
                placeholder="Nhập tên thể loại (tối đa 50 ký tự)"
                maxLength={50}
                autoFocus
                className={`flex-1 min-w-48 px-4 py-2.5 rounded-xl bg-slate-800/60 border
                  text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2
                  focus:ring-cyan-500 transition-all ${addError ? 'border-red-500/60' : 'border-white/10'}`}
              />
              <button
                id="btn-confirm-add"
                onClick={handleAdd}
                disabled={adding}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                  disabled:opacity-50 text-white font-semibold text-sm transition-all
                  active:scale-95"
              >
                {adding ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                id="btn-cancel-add"
                onClick={handleCancelAdd}
                disabled={adding}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10
                  text-white/80 font-semibold text-sm transition-all active:scale-95"
              >
                Hủy
              </button>
            </div>
            {addError && (
              <p id="add-error-msg" className="text-red-400 text-xs mt-2">{addError}</p>
            )}
          </div>
        )}

        {/* ── Table Card ────────────────────────────────────────────── */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Đang tải danh sách thể loại...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-3xl">⚠️</span>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={loadCategories}
                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300
                  hover:bg-slate-800 text-sm transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <span className="text-4xl mb-3">📂</span>
              <p className="text-sm">Chưa có thể loại sách nào.</p>
            </div>
          ) : (
            <table id="category-table" className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-slate-400 label-cyber">
                  <th className="w-12 px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3 text-left">Tên thể loại</th>
                  <th className="w-36 px-4 py-3 text-center hidden md:table-cell">Ngày tạo</th>
                  <th className="w-32 px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className={`transition-colors ${
                      editingId === category.id
                        ? 'bg-cyan-500/5 border-l-2 border-cyan-500'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Index */}
                    <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">
                      {index + 1}
                    </td>

                    {/* Name — inline editable */}
                    <td className="px-4 py-3">
                      {editingId === category.id ? (
                        <div className="space-y-1">
                          <input
                            id={`input-edit-${category.id}`}
                            type="text"
                            value={editingName}
                            onChange={(e) => { setEditingName(e.target.value); setEditError('') }}
                            onKeyDown={(e) => handleEditKeyDown(e, category.id)}
                            onBlur={() => handleSaveEdit(category.id)}
                            maxLength={50}
                            autoFocus
                            className={`w-full px-3 py-2 rounded-lg bg-slate-800/60 border text-white
                              text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                              ${editError ? 'border-red-500' : 'border-cyan-500/40'}`}
                          />
                          {editError && (
                            <p className="text-red-400 text-xs">{editError}</p>
                          )}
                        </div>
                      ) : (
                        <button
                          id={`category-name-${category.id}`}
                          onClick={() => handleStartEdit(category)}
                          title="Click để sửa tên"
                          className="group flex items-center gap-2 text-white hover:text-cyan-300
                            transition-colors text-left font-medium w-full"
                        >
                          {category.name}
                          <span className="opacity-0 group-hover:opacity-60 text-xs transition-opacity">
                            ✏
                          </span>
                        </button>
                      )}
                    </td>

                    {/* Created date */}
                    <td className="px-4 py-3 text-center text-slate-500 text-xs hidden md:table-cell">
                      {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      {editingId === category.id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            id={`btn-save-${category.id}`}
                            onClick={() => handleSaveEdit(category.id)}
                            disabled={savingId === category.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500
                              text-white text-xs font-semibold disabled:opacity-50 transition-all"
                          >
                            {savingId === category.id ? '...' : 'Lưu'}
                          </button>
                          <button
                            id={`btn-cancel-edit-${category.id}`}
                            onClick={handleCancelEdit}
                            disabled={savingId === category.id}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                              text-white/80 text-xs font-semibold disabled:opacity-50 transition-all"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-delete-${category.id}`}
                          onClick={() => handleDeleteClick(category)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20
                            text-red-400 border border-red-500/20 text-xs
                            font-semibold transition-all active:scale-95"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Category Count ────────────────────────────────────────── */}
        {!loading && !error && categories.length > 0 && (
          <p className="text-slate-500 text-xs text-right">
            Tổng cộng: <span className="text-slate-400 font-semibold">{categories.length}</span> thể loại
          </p>
        )}
      </div>

      {/* ── Delete Confirm Modal ──────────────────────────────────── */}
      {deletingCategory && (
        <div
          id="modal-delete-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center
            justify-center z-50 p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 w-full
              max-w-md shadow-2xl animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl text-center mb-4">⚠️</div>
            <h2
              id="modal-delete-title"
              className="text-lg font-bold text-white text-center mb-2"
            >
              Xác nhận xóa
            </h2>
            <p className="text-slate-400 text-sm text-center mb-4">
              Bạn có chắc muốn xóa thể loại{' '}
              <span className="text-white font-semibold">
                "{deletingCategory.name}"
              </span>{' '}
              không?
              <br />
              <span className="text-red-400 text-xs mt-1 inline-block">
                Hành động này không thể hoàn tác.
              </span>
            </p>

            {deleteError && (
              <div
                id="delete-error-msg"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/40
                  border border-red-700/60 text-red-300 text-sm mb-4"
              >
                <span className="font-bold">✗</span>
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                id="btn-cancel-delete"
                onClick={handleCancelDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10
                  text-white/80 font-semibold text-sm transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                id="btn-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500
                  text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-red-500/20
                  disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManagementPage
