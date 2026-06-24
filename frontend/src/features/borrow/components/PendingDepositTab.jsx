import React, { useState, useEffect, useCallback } from 'react'
import { getAwaitingDeposit, confirmDeposit } from '../services/borrowService'
import { formatCurrency } from '../../../shared/utils/formatUtils'

const PendingDepositTab = ({ refreshTrigger, onRefresh }) => {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)

  const fetchBorrows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAwaitingDeposit()
      setBorrows(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách chờ xác nhận')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBorrows()
  }, [fetchBorrows, refreshTrigger])

  const handleConfirm = async (borrowId) => {
    setActionLoading(borrowId)
    try {
      await confirmDeposit(borrowId)
      setBorrows(prev => prev.filter(b => b.id !== borrowId))
      setConfirmTarget(null)
      onRefresh?.()
    } catch (err) {
      throw err
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-950/50 border border-red-800/50 rounded-xl p-4 mt-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (borrows.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-slate-400 font-medium">Không có yêu cầu nào chờ xác nhận</p>
        <p className="text-slate-500 text-sm mt-1">Tất cả yêu cầu đã được xử lý</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">Có <span className="text-white font-semibold">{borrows.length}</span> yêu cầu chờ xác nhận</p>
      </div>

      <div className="space-y-3">
        {borrows.map(borrow => (
          <div key={borrow.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-white truncate">{borrow.bookTitle || 'Sách'}</h4>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">{borrow.readerName || 'Độc giả'}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    borrow.fulfillmentMethod === 'DELIVERY'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  }`}>
                    {borrow.fulfillmentMethod === 'DELIVERY' ? 'Giao tận nơi' : 'Nhận tại thư viện'}
                  </span>
                  <span className="text-xs text-white/30">
                    {borrow.durationDays || 14} ngày
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-white/30">Phí thuê: </span>
                    <span className="text-cyan-400 font-medium">{formatCurrency(borrow.rentalFeeSnapshot)}</span>
                  </div>
                  <div>
                    <span className="text-white/30">Cọc: </span>
                    <span className="text-amber-400 font-medium">{formatCurrency(borrow.depositAmount)}</span>
                  </div>
                  <div>
                    <span className="text-white/30">Tổng cần trừ: </span>
                    <span className="text-white font-medium">
                      {formatCurrency((Number(borrow.rentalFeeSnapshot) || 0) + (Number(borrow.depositAmount) || 0))}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/30">Tạo: </span>
                    <span className="text-white/60">{new Date(borrow.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setConfirmTarget(borrow)}
                disabled={actionLoading === borrow.id}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50 flex-shrink-0"
              >
                {actionLoading === borrow.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-400" />
                ) : 'Xác nhận'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmTarget && (
        <ConfirmDepositModal
          borrow={confirmTarget}
          onConfirm={handleConfirm}
          onClose={() => setConfirmTarget(null)}
          loading={actionLoading === confirmTarget.id}
        />
      )}
    </div>
  )
}

const ConfirmDepositModal = ({ borrow, onConfirm, onClose, loading }) => {
  const totalRequired = (Number(borrow.rentalFeeSnapshot) || 0) + (Number(borrow.depositAmount) || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-4">Xác nhận yêu cầu mượn</h3>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Sách:</span>
            <span className="text-white font-medium">{borrow.bookTitle || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Độc giả:</span>
            <span className="text-white">{borrow.readerName || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Phí thuê:</span>
            <span className="text-cyan-400">{formatCurrency(borrow.rentalFeeSnapshot)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Tiền cọc:</span>
            <span className="text-amber-400">{formatCurrency(borrow.depositAmount)}</span>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between text-sm">
            <span className="text-white/60 font-medium">Tổng sẽ trừ:</span>
            <span className="text-white font-bold">{formatCurrency(totalRequired)}</span>
          </div>
        </div>

        <p className="text-xs text-white/40 mb-4">
          Hệ thống sẽ trừ phí thuê và phong toả tiền cọc từ ví của độc giả.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 border border-white/10 font-semibold text-sm transition-all hover:bg-white/10"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(borrow.id)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PendingDepositTab
