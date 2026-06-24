import React, { useState } from 'react'

const ConfirmDeliveredModal = ({ onSubmit, onClose, loading }) => {
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!notes.trim()) {
      setError('Vui lòng nhập ghi chú giải thích')
      return
    }
    if (notes.length > 500) {
      setError('Ghi chú tối đa 500 ký tự')
      return
    }
    onSubmit(notes.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-2">Xác nhận đã giao đúng</h3>
        <p className="text-sm text-white/40 mb-4">
          Vui lòng nhập ghi chú giải thích lý do xác nhận.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/40 mb-1">Ghi chú giải thích *</label>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setError(null) }}
              placeholder="Nhập lý do xác nhận đã giao đúng..."
              maxLength={500}
              rows={4}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <div className="flex justify-between mt-1">
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <p className="text-xs text-white/20 ml-auto">{notes.length}/500</p>
            </div>
          </div>

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
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConfirmDeliveredModal
