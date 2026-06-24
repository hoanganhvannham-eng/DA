import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getMoods,
  createMood,
  updateMood,
  deleteMood,
} from '../services/moodService'

const MoodManagementPage = () => {
  const [moods, setMoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editError, setEditError] = useState('')
  const [savingId, setSavingId] = useState(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  const [deletingMood, setDeletingMood] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [successMessage, setSuccessMessage] = useState('')

  const loadMoods = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMoods()
      setMoods(data.moods || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách mood'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMoods()
  }, [loadMoods])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(''), 3500)
    return () => clearTimeout(timer)
  }, [successMessage])

  const handleStartEdit = (mood) => {
    setEditingId(mood.id)
    setEditingName(mood.name)
    setEditingDescription(mood.description || '')
    setEditError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setEditingDescription('')
    setEditError('')
  }

  const handleSaveEdit = async (moodId) => {
    const trimmedName = editingName.trim()
    if (!trimmedName) { setEditError('Tên mood không được để trống'); return }
    if (trimmedName.length > 50) { setEditError('Tên mood tối đa 50 ký tự'); return }

    try {
      setSavingId(moodId)
      setEditError('')
      const data = await updateMood(moodId, { name: trimmedName, description: editingDescription.trim() || null })
      setMoods((prev) =>
        prev.map((m) => (m.id === moodId ? data : m))
      )
      setEditingId(null)
      setSuccessMessage('Cập nhật mood thành công')
    } catch (err) {
      setEditError(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setSavingId(null)
    }
  }

  const handleEditKeyDown = (e, moodId) => {
    if (e.key === 'Enter') handleSaveEdit(moodId)
    if (e.key === 'Escape') handleCancelEdit()
  }

  const handleAdd = async () => {
    const trimmedName = newName.trim()
    if (!trimmedName) { setAddError('Tên mood không được để trống'); return }
    if (trimmedName.length > 50) { setAddError('Tên mood tối đa 50 ký tự'); return }

    try {
      setAdding(true)
      setAddError('')
      const data = await createMood({ name: trimmedName, description: newDescription.trim() || null })
      setMoods((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      )
      setNewName('')
      setNewDescription('')
      setShowAddForm(false)
      setSuccessMessage('Thêm mood thành công')
    } catch (err) {
      setAddError(err.response?.data?.message || 'Thêm mood thất bại')
    } finally {
      setAdding(false)
    }
  }

  const handleCancelAdd = () => {
    setShowAddForm(false)
    setNewName('')
    setNewDescription('')
    setAddError('')
  }

  const handleDeleteClick = (mood) => {
    setDeletingMood(mood)
    setDeleteError('')
  }

  const handleConfirmDelete = async () => {
    if (!deletingMood) return
    try {
      setDeleting(true)
      setDeleteError('')
      await deleteMood(deletingMood.id)
      setMoods((prev) => prev.filter((m) => m.id !== deletingMood.id))
      setDeletingMood(null)
      setSuccessMessage('Xóa mood thành công')
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Xóa mood thất bại')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setDeletingMood(null)
    setDeleteError('')
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-10">
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[80px] animate-pulse pointer-events-none -z-10" />
      <div className="max-w-4xl mx-auto space-y-6">

        <Link
          to="/"
          id="btn-back-home"
          className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight" style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
              🎭 Quản lý Mood
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Thêm, sửa, xóa các mood trong hệ thống
            </p>
          </div>
          <button
            id="btn-add-mood"
            onClick={() => { setShowAddForm(true); setAddError(''); setNewName(''); setNewDescription('') }}
            disabled={showAddForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-500
              hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-bold text-sm transition-all duration-200 shadow-lg
              shadow-cyan-500/30 active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
            Thêm mood
          </button>
        </div>

        {successMessage && (
          <div
            id="success-toast"
            role="alert"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10
              backdrop-blur-xl border border-emerald-500/20 text-emerald-400 text-sm duration-300"
          >
            <span className="text-emerald-400 font-bold">✓</span>
            {successMessage}
          </div>
        )}

        {showAddForm && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6">
            <h3 className="text-white font-semibold mb-3">Thêm mood mới</h3>
            <div className="flex flex-col gap-3">
              <input
                id="input-new-mood-name"
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setAddError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancelAdd() }}
                placeholder="Nhập tên mood (tối đa 50 ký tự)"
                maxLength={50}
                autoFocus
                className={`px-4 py-2.5 rounded-xl bg-slate-900/40 border text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${addError ? 'border-red-500' : 'border-white/10'}`}
              />
              <input
                id="input-new-mood-description"
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Mô tả (tùy chọn, tối đa 255 ký tự)"
                maxLength={255}
                className="px-4 py-2.5 rounded-xl bg-slate-900/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              <div className="flex gap-3">
                <button
                  id="btn-confirm-add"
                  onClick={handleAdd}
                  disabled={adding}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all active:scale-95"
                >
                  {adding ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  id="btn-cancel-add"
                  onClick={handleCancelAdd}
                  disabled={adding}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-semibold text-sm transition-all active:scale-95"
                >
                  Hủy
                </button>
              </div>
            </div>
            {addError && (
              <p id="add-error-msg" className="text-red-400 text-xs mt-2">{addError}</p>
            )}
          </div>
        )}

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Đang tải danh sách mood...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-3xl">⚠️</span>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={loadMoods}
                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : moods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-6xl mb-4 text-white/10">🎭</span>
              <p className="text-sm text-white/30">Chưa có mood nào.</p>
            </div>
          ) : (
            <table id="mood-table" className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-white/40 text-xs uppercase tracking-[0.2em] font-bold">
                  <th className="w-12 px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3 text-left">Tên mood</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Mô tả</th>
                  <th className="w-36 px-4 py-3 text-center hidden md:table-cell">Ngày tạo</th>
                  <th className="w-32 px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {moods.map((mood, index) => (
                  <tr
                    key={mood.id}
                    className={`transition-colors ${
                      editingId === mood.id
                        ? 'bg-cyan-500/[0.06] border-l-2 border-cyan-400'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      {editingId === mood.id ? (
                        <div className="space-y-1">
                          <input
                            id={`input-edit-name-${mood.id}`}
                            type="text"
                            value={editingName}
                            onChange={(e) => { setEditingName(e.target.value); setEditError('') }}
                            onKeyDown={(e) => handleEditKeyDown(e, mood.id)}
                            maxLength={50}
                            autoFocus
                            className={`w-full bg-transparent border-b-2 text-white text-sm focus:outline-none transition-all ${editError ? 'border-red-500' : 'border-cyan-400 focus:border-cyan-300'}`}
                          />
                          {editError && (
                            <p className="text-red-400 text-xs">{editError}</p>
                          )}
                        </div>
                      ) : (
                        <button
                          id={`mood-name-${mood.id}`}
                          onClick={() => handleStartEdit(mood)}
                          title="Click để sửa"
                          className="group flex items-center gap-2 text-white hover:text-cyan-300 transition-colors text-left font-medium w-full"
                        >
                          {mood.name}
                          <span className="opacity-0 group-hover:opacity-60 text-xs transition-opacity">✏</span>
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      {editingId === mood.id ? (
                        <input
                          id={`input-edit-desc-${mood.id}`}
                          type="text"
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, mood.id)}
                          maxLength={255}
                          className="w-full bg-transparent border-b-2 border-white/20 text-white text-sm focus:outline-none focus:border-cyan-300 transition-all"
                        />
                      ) : (
                        <span className="text-slate-400">{mood.description || '—'}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-500 text-xs hidden md:table-cell">
                      {new Date(mood.createdAt).toLocaleDateString('vi-VN')}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {editingId === mood.id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            id={`btn-save-${mood.id}`}
                            onClick={() => handleSaveEdit(mood.id)}
                            disabled={savingId === mood.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold disabled:opacity-50 transition-all"
                          >
                            {savingId === mood.id ? '...' : 'Lưu'}
                          </button>
                          <button
                            id={`btn-cancel-edit-${mood.id}`}
                            onClick={handleCancelEdit}
                            disabled={savingId === mood.id}
                            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-xs font-semibold disabled:opacity-50 transition-all"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-delete-${mood.id}`}
                          onClick={() => handleDeleteClick(mood)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all active:scale-95"
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

        {!loading && !error && moods.length > 0 && (
          <p className="text-white/30 text-xs text-right">
            Tổng cộng: <span className="font-mono text-white/50">{moods.length}</span> mood
          </p>
        )}
      </div>

      {deletingMood && (
        <div
          id="modal-delete-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl text-center mb-4">⚠️</div>
            <h2 id="modal-delete-title" className="text-lg font-bold text-white text-center mb-2">
              Xác nhận xóa
            </h2>
            <p className="text-slate-400 text-sm text-center mb-4">
              Bạn có chắc muốn xóa mood{' '}
              <span className="text-white font-semibold">"{deletingMood.name}"</span> không?
              <br />
              <span className="text-red-400 text-xs mt-1 inline-block">
                Hành động này không thể hoàn tác.
              </span>
            </p>

            {deleteError && (
              <div
                id="delete-error-msg"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-4"
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 font-semibold text-sm transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                id="btn-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-rose-500/30"
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

export default MoodManagementPage
