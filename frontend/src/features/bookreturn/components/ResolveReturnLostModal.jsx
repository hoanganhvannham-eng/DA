import { useState, useEffect } from 'react'
import { resolveReturnLost, getFineLevels } from '../services/bookReturnService'

export default function ResolveReturnLostModal({ record, onClose, onSuccess }) {
  const [resolution, setResolution] = useState('')
  const [fineLevelId, setFineLevelId] = useState('')
  const [note, setNote] = useState('')
  const [fineLevels, setFineLevels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getFineLevels('LOST')
      .then(data => setFineLevels(Array.isArray(data) ? data : (data.fineLevels || [])))
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!resolution) {
      setError('Vui lòng chọn hướng xử lý')
      return
    }
    if (resolution === 'READER_FAULT') {
      if (!fineLevelId) {
        setError('Vui lòng chọn mức phạt')
        return
      }
      if (!note || !note.trim()) {
        setError('Vui lòng nhập ghi chú')
        return
      }
    }
    if (note && note.length > 500) {
      setError('Ghi chú tối đa 500 ký tự')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = {
        resolution,
        fineLevelId: resolution === 'READER_FAULT' ? fineLevelId : null,
        note: resolution === 'READER_FAULT' ? note.trim() : (note || null),
      }
      const result = await resolveReturnLost(record.borrowId, data)
      onSuccess(result)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể giải quyết'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">Giải quyết sách bị mất khi gửi trả</h2>

        <div className="mb-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
          <p className="text-white font-medium truncate">{record.bookTitle || 'Sách'}</p>
          <p className="text-white/40 text-sm mt-1">Độc giả: {record.readerName}</p>
          {record.pickupAddress && (
            <p className="text-white/40 text-sm">Địa chỉ: {record.pickupAddress}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">
            Hướng xử lý <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'CARRIER_FAULT', label: 'Lỗi carrier', color: 'cyan' },
              { value: 'READER_FAULT', label: 'Lỗi độc giả', color: 'rose' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setResolution(opt.value)
                  setError(null)
                }}
                className={`px-3 py-4 rounded-lg text-sm font-medium border transition-colors ${
                  resolution === opt.value
                    ? `bg-${opt.color}-500/10 text-${opt.color}-400 border-${opt.color}-500/30`
                    : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {resolution === 'READER_FAULT' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-1">
                Mức phạt <span className="text-rose-400">*</span>
              </label>
              <select
                value={fineLevelId}
                onChange={e => setFineLevelId(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-cyan-500/50 [color-scheme:dark]"
              >
                <option value="" className="bg-slate-900 text-white">-- Chọn mức phạt --</option>
                {fineLevels.map(fl => (
                  <option key={fl.id} value={fl.id} className="bg-slate-900 text-white">
                    {fl.name} - {fl.amount?.toLocaleString()} VNĐ
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-1">
                Ghi chú <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Nhập ghi chú về việc xử lý"
                rows={3}
                maxLength={500}
                className="w-full bg-white/[0.03] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-cyan-500/50 placeholder-white/30 resize-none"
              />
              <p className="text-white/20 text-xs mt-1">{note.length}/500</p>
            </div>
          </>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
            )}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}
