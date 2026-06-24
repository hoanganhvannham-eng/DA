import React, { useState } from 'react'

const RejectModal = ({ borrow, onSubmit, onClose }) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối')
      return
    }
    if (reason.trim().length > 500) {
      setError('Lý do tối đa 500 ký tự')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(borrow.id, reason.trim())
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối đơn mượn')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Từ chối đơn mượn</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 mb-4">
          <p className="text-sm text-white/60">Từ chối yêu cầu mượn sách của độc giả</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Lý do từ chối</label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setError('') }}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              maxLength={500}
              className={`w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-white focus:outline-none focus:border-rose-500/50 focus:ring-rose-500/20 resize-none placeholder-white/30 ${
                error ? 'border-rose-500/50' : 'border-white/10'
              }`}
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
            <p className="text-xs text-white/20 mt-1">{reason.length}/500</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/40 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold text-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RejectModal
