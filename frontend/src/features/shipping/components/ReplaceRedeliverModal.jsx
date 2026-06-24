import React, { useState, useEffect, useCallback } from 'react'
import apiClient from '../../../shared/services/apiClient'

const ReplaceRedeliverModal = ({ onSubmit, onClose, loading }) => {
  const [books, setBooks] = useState([])
  const [selectedBookId, setSelectedBookId] = useState('')
  const [error, setError] = useState(null)
  const [loadingBooks, setLoadingBooks] = useState(true)

  const fetchAvailableBooks = useCallback(async () => {
    setLoadingBooks(true)
    try {
      const response = await apiClient.get('/books', {
        params: { page: 0, size: 100, sort: 'title,asc' }
      })
      const data = response.data
      const list = Array.isArray(data) ? data : data.content || data.data || []
      setBooks(list.filter(b => b.availableQuantity > 0))
    } catch (err) {
      setError('Không thể tải danh sách sách')
    } finally {
      setLoadingBooks(false)
    }
  }, [])

  useEffect(() => {
    fetchAvailableBooks()
  }, [fetchAvailableBooks])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedBookId) {
      setError('Vui lòng chọn sách thay thế')
      return
    }
    onSubmit(selectedBookId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-2">Cấp lại sách + giao lại</h3>
        <p className="text-sm text-white/40 mb-4">
          Chọn bản sách khác từ kho để thay thế cho sách đã mất.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/40 mb-1">Chọn sách thay thế *</label>
            {loadingBooks ? (
              <div className="flex items-center gap-2 py-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
                <span className="text-sm text-white/40">Đang tải...</span>
              </div>
            ) : (
              <select
                value={selectedBookId}
                onChange={(e) => { setSelectedBookId(e.target.value); setError(null) }}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">-- Chọn sách --</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} - {book.author} (còn {book.availableQuantity} bản)
                  </option>
                ))}
              </select>
            )}
            {books.length === 0 && !loadingBooks && (
              <p className="text-xs text-rose-400 mt-1">Không còn sách nào trong kho để cấp lại</p>
            )}
          </div>

            {error && (
              <p className="text-sm text-rose-300">{error}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/40 text-sm font-semibold transition-all disabled:opacity-50 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !selectedBookId || books.length === 0}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 text-sm font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận cấp lại'}
              </button>
            </div>
        </form>
      </div>
    </div>
  )
}

export default ReplaceRedeliverModal
