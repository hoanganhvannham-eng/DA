import React, { useState } from 'react'

const ConfirmPickupModal = ({ borrow, onSubmit, onClose }) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(borrow.id)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xác nhận nhận sách')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Xác nhận nhận sách</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-4 space-y-2">
          <p className="text-sm">
            <span className="text-white/40">Độc giả:</span>{' '}
            <span className="text-white font-medium">{borrow.readerName || borrow.readerId}</span>
          </p>
          <p className="text-sm">
            <span className="text-white/40">Sách:</span>{' '}
            <span className="text-white font-medium">{borrow.bookTitle || borrow.bookId}</span>
          </p>
          <p className="text-sm">
            <span className="text-white/40">Thời hạn mượn:</span>{' '}
            <span className="text-white font-medium">{borrow.durationDays || 14} ngày</span>
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-4">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/40 transition-all"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận đã nhận sách'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmPickupModal
