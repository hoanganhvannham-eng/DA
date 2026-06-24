import { useState, useEffect, useMemo } from 'react'
import { confirmReturn, getFineLevels } from '../services/bookReturnService'

export default function ConfirmReturnModal({ record, onClose, onSuccess }) {
  const [bookCondition, setBookCondition] = useState('')
  const [fineLevelId, setFineLevelId] = useState('')
  const [note, setNote] = useState('')
  const [refundMethod, setRefundMethod] = useState('TO_WALLET')
  const [fineLevels, setFineLevels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    getFineLevels()
      .then(data => setFineLevels(Array.isArray(data) ? data : (data.fineLevels || [])))
      .catch(() => {})
  }, [])

  const isDamaged = bookCondition === 'DAMAGED'
  const isLost = bookCondition === 'LOST'
  const isLateReturn = bookCondition === 'LATE_RETURN'
  const requiresFine = isDamaged || isLateReturn
  const requiresNote = isDamaged || isLost || isLateReturn

  const filteredFineLevels = fineLevels.filter(fl => {
    if (!bookCondition) return false
    if (fl.fineType === 'ALL') return true
    if (bookCondition === 'DAMAGED') return fl.fineType === 'DAMAGED' || fl.fineType === 'OVERDUE'
    if (bookCondition === 'LOST') return fl.fineType === 'LOST'
    if (bookCondition === 'LATE_RETURN') return fl.fineType === 'OVERDUE'
    return false
  })

  const selectedFine = fineLevels.find(fl => fl.id === fineLevelId)

  const overdueDays = useMemo(() => {
    if (!record.dueDate) return 0
    const due = new Date(record.dueDate)
    const now = new Date()
    if (due >= now) return 0
    const diffMs = now - due
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }, [record.dueDate])

  const lateFineAmount = useMemo(() => {
    if (!isLateReturn || !selectedFine || !selectedFine.amountPerDay) return 0
    let amount = selectedFine.amountPerDay * overdueDays
    if (selectedFine.maxAmount && amount > selectedFine.maxAmount) {
      amount = selectedFine.maxAmount
    }
    return amount
  }, [isLateReturn, selectedFine, overdueDays])

  const isOverdue = record.dueDate && new Date(record.dueDate) < new Date()

  const handleSubmit = async () => {
    if (!bookCondition) {
      setError('Vui lòng chọn tình trạng sách')
      return
    }
    if (requiresNote && (!note || !note.trim())) {
      setError('Vui lòng nhập ghi chú')
      return
    }
    if (requiresFine && !fineLevelId) {
      setError('Vui lòng chọn mức phạt')
      return
    }
    if (note && note.length > 500) {
      setError('Ghi chú tối đa 500 ký tự')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = {
        bookCondition,
        fineLevelId: requiresFine ? fineLevelId : null,
        note: requiresNote ? note.trim() : null,
        refundMethod: refundMethod || null,
      }
      const result = await confirmReturn(record.id, data)
      setSuccess(result.message || 'Xác nhận trả sách thành công')
      setTimeout(() => {
        onSuccess(result)
      }, 2000)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể xác nhận trả sách'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      RETURN_PENDING: 'Trả tại thư viện',
      RETURN_RECEIVED: 'Đã nhận sách trả (Shipping)',
    }
    return labels[status] || status
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-slate-900 z-10 pb-2">Xác nhận trả sách</h2>

        <div className="mb-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
          <p className="text-white font-medium truncate">{record.bookTitle}</p>
          <p className="text-white/40 text-sm mt-1">Độc giả: {record.readerName}</p>
          <p className="text-white/40 text-sm">
            Phương thức: {getStatusLabel(record.status)}
          </p>
          {isOverdue && (
            <p className="text-rose-400 text-sm mt-1 font-medium">Sách đã quá hạn trả ({overdueDays} ngày)</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">
            Tình trạng sách <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'NORMAL', label: 'Bình thường', color: 'emerald' },
              { value: 'LATE_RETURN', label: 'Trả muộn', color: 'amber' },
              { value: 'DAMAGED', label: 'Hư hỏng', color: 'orange' },
              { value: 'LOST', label: 'Mất', color: 'rose' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setBookCondition(opt.value)
                  setFineLevelId('')
                  setError(null)
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  bookCondition === opt.value
                    ? `bg-${opt.color}-500/10 text-${opt.color}-400 border-${opt.color}-500/30`
                    : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {requiresFine && (
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
              {filteredFineLevels.map(fl => (
                <option key={fl.id} value={fl.id} className="bg-slate-900 text-white">
                  {isLateReturn && fl.amountPerDay
                    ? `${fl.name} - ${fl.amountPerDay?.toLocaleString()} VNĐ/ngày`
                    : `${fl.name} - ${fl.amount?.toLocaleString()} VNĐ`
                  }
                </option>
              ))}
            </select>
          </div>
        )}

        {isLateReturn && selectedFine && selectedFine.amountPerDay && (
          <div className="mb-4 p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl">
            <p className="text-amber-400 text-xs font-semibold mb-2 uppercase tracking-wider">Tính phí phạt trả muộn</p>
            <div className="text-white/70 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Số ngày trễ</span>
                <span className="text-white font-mono">{overdueDays} ngày</span>
              </div>
              <div className="flex justify-between">
                <span>Phạt mỗi ngày</span>
                <span className="text-white font-mono">{selectedFine.amountPerDay?.toLocaleString()} VNĐ</span>
              </div>
              {selectedFine.maxAmount && (
                <div className="flex justify-between text-white/50">
                  <span>Giới hạn tối đa</span>
                  <span className="font-mono">{selectedFine.maxAmount?.toLocaleString()} VNĐ</span>
                </div>
              )}
              <hr className="border-white/10 my-1" />
              <div className="flex justify-between font-semibold">
                <span className="text-amber-400">Tổng phạt</span>
                <span className="text-amber-400 font-mono">{lateFineAmount.toLocaleString()} VNĐ</span>
              </div>
              <p className="text-white/40 italic mt-1">
                Phạt sẽ được tự động trừ từ tiền cọc và số dư ví của độc giả.
                {refundMethod === 'CASH' ? ' Phần cọc dư sẽ trả tiền mặt tại quầy.' : ' Phần cọc dư sẽ nạp lại vào ví.'}
              </p>
            </div>
          </div>
        )}

        {isDamaged && selectedFine && (
          <div className="mb-4 p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl">
            <p className="text-cyan-400 text-xs font-semibold mb-2 uppercase tracking-wider">Dự kiến xử lý tài chính</p>
            <div className="text-white/70 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Phạt {selectedFine.name}</span>
                <span className="text-white font-mono">-{selectedFine.amount?.toLocaleString()} VNĐ</span>
              </div>
              {isOverdue && (
                <div className="flex justify-between text-amber-400">
                  <span>Sách quá hạn (sẽ tạo phạt riêng)</span>
                  <span className="font-mono">⚠</span>
                </div>
              )}
              <hr className="border-white/10 my-1" />
              <p className="text-white/40 italic">
                Phạt sẽ được tự động trừ từ tiền cọc và số dư ví của độc giả.
                {refundMethod === 'CASH' ? ' Phần cọc dư sẽ trả tiền mặt tại quầy.' : ' Phần cọc dư sẽ nạp lại vào ví.'}
              </p>
            </div>
          </div>
        )}

        {isLost && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1">
              Giá bồi thường
            </label>
            <div className="w-full bg-white/[0.03] border border-rose-500/30 text-rose-400 rounded-lg px-3 py-2 text-sm font-medium">
              {record.replacementPriceSnapshot?.toLocaleString() || '---'} VNĐ
            </div>
            <p className="text-white/30 text-xs mt-1">Đền bù theo giá gốc của sách</p>
          </div>
        )}

        {isLost && selectedFine && (
          <div className="mb-4 p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl">
            <p className="text-rose-400 text-xs font-semibold mb-2 uppercase tracking-wider">Dự kiến xử lý tài chính</p>
            <div className="text-white/70 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Phạt {selectedFine.name}</span>
                <span className="text-white font-mono">-{selectedFine.amount?.toLocaleString()} VNĐ</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Giá sách</span>
                <span className="text-white font-mono">{record.replacementPriceSnapshot?.toLocaleString() || 0} VNĐ</span>
              </div>
              <hr className="border-white/10 my-1" />
              <p className="text-white/40 italic">
                Tiền cọc đã đóng băng sẽ được thu hồi. Phần thiếu sẽ tạo phiếu phạt chờ thanh toán.
                {fineLevelId && filteredFineLevels.length === 0 && ' Không có mức phạt phù hợp.'}
              </p>
            </div>
          </div>
        )}

        {requiresNote && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1">
              Ghi chú <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={isLateReturn ? 'Nhập lý do trả muộn' : 'Nhập ghi chú về tình trạng sách'}
              rows={3}
              maxLength={500}
              className="w-full bg-white/[0.03] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-cyan-500/50 placeholder-white/30 resize-none"
            />
            <p className="text-white/20 text-xs mt-1">{note.length}/500</p>
          </div>
        )}

        {bookCondition !== 'LOST' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-2">
              Hình thức nhận tiền hoàn cọc
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'TO_WALLET', label: 'Nạp vào ví', desc: 'Tiền cọc dư cộng vào số dư ví, độc giả dùng cho lần sau' },
                { value: 'CASH', label: 'Tiền mặt', desc: 'Nhân viên trả tiền mặt tại quầy, trừ tương ứng từ số dư ví' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRefundMethod(opt.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                    refundMethod === opt.value
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20'
                  }`}
                >
                  <p className="font-semibold">{opt.label}</p>
                  <p className="text-xs opacity-60 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-lg">✓</span>
            {success}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading || !!success}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            Đóng
          </button>
          {!success && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
              )}
              Xác nhận trả
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
