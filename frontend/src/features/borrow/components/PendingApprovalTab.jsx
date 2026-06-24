import React, { useState, useEffect, useCallback } from 'react'
import { getPendingApprovalBorrows, approveBorrow, rejectBorrow } from '../services/borrowService'
import RejectModal from './RejectModal'

const PendingApprovalTab = ({ refreshTrigger, onRefresh }) => {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [approveTarget, setApproveTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [notificationMsg, setNotificationMsg] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  const fetchBorrows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPendingApprovalBorrows()
      setBorrows(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách chờ duyệt')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBorrows()
  }, [fetchBorrows, refreshTrigger])

  useEffect(() => {
    if (!notificationMsg) return
    const timer = setTimeout(() => setNotificationMsg(null), 5000)
    return () => clearTimeout(timer)
  }, [notificationMsg])

  const handleApprove = async (borrowId) => {
    setActionLoading(borrowId)
    try {
      const result = await approveBorrow(borrowId)
      setBorrows(prev => prev.filter(b => b.id !== borrowId))
      onRefresh?.()
      setNotificationType('success')
      setNotificationMsg(result.message || 'Duyệt đơn mượn thành công')
    } catch (err) {
      setNotificationType('error')
      setNotificationMsg(err.response?.data?.message || 'Không thể duyệt đơn mượn')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (borrowId, reason) => {
    setActionLoading(borrowId)
    try {
      await rejectBorrow(borrowId, reason)
      setBorrows(prev => prev.filter(b => b.id !== borrowId))
      onRefresh?.()
    } catch (err) {
      throw err
    } finally {
      setActionLoading(null)
    }
  }

  const getRiskFlagBadge = (flag) => {
    const labels = {
      R1: 'Đang mượn ≥4',
      R2: 'Trả muộn ≥2',
      R3: 'Phạt chờ xác nhận',
      R4: 'TK mới <7 ngày',
      R5: 'Cuốn cuối cùng',
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        {labels[flag] || flag}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
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
        <p className="text-slate-400 font-medium">Không có đơn mượn nào chờ duyệt</p>
        <p className="text-slate-500 text-sm mt-1">Tất cả đơn mượn đã được xử lý hoặc tự động duyệt</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">Có <span className="text-white font-semibold">{borrows.length}</span> đơn chờ duyệt</p>
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
                  {borrow.pendingApprovalUntil && (
                    <span className="text-xs text-amber-400">
                      Còn hạn đến: {new Date(borrow.pendingApprovalUntil).toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>

                {(() => {
                  const flags = typeof borrow.riskFlags === 'string'
                    ? (() => { try { return JSON.parse(borrow.riskFlags) } catch { return [] } })()
                    : Array.isArray(borrow.riskFlags) ? borrow.riskFlags : []
                  return flags.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-white/30">Rủi ro:</span>
                      {flags.map(flag => getRiskFlagBadge(flag))}
                    </div>
                  ) : null
                })()}

                {borrow.shippingAddress && (
                  <p className="text-xs text-slate-500 truncate">Địa chỉ: {borrow.shippingAddress}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setApproveTarget(borrow)}
                  disabled={actionLoading === borrow.id}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {actionLoading === borrow.id ? '...' : 'Xác nhận'}
                </button>
                <button
                  onClick={() => setRejectTarget(borrow)}
                  disabled={actionLoading === borrow.id}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rejectTarget && (
        <RejectModal
          borrow={rejectTarget}
          onSubmit={handleReject}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setApproveTarget(null)}>
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Xác nhận duyệt đơn mượn</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Sách:</span>
                <span className="text-white font-medium">{approveTarget.bookTitle || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Độc giả:</span>
                <span className="text-white">{approveTarget.readerName || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Hình thức:</span>
                <span className="text-cyan-400">{approveTarget.fulfillmentMethod === 'DELIVERY' ? 'Giao tận nơi' : 'Nhận tại thư viện'}</span>
              </div>
            </div>
            <p className="text-xs text-white/40 mb-4">Sau khi duyệt, hệ thống sẽ tự động trừ tiền thuê và giữ tiền cọc từ ví độc giả (nếu đủ số dư).</p>
            <div className="flex gap-3">
              <button
                onClick={() => setApproveTarget(null)}
                disabled={actionLoading === approveTarget.id}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 border border-white/10 font-semibold text-sm transition-all hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                onClick={() => { handleApprove(approveTarget.id); setApproveTarget(null) }}
                disabled={actionLoading === approveTarget.id}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30"
              >
                {actionLoading === approveTarget.id ? 'Đang xử lý...' : 'Duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {notificationMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm border bg-slate-900/80 backdrop-blur-xl ${
          notificationType === 'error'
            ? 'border-red-500/30 text-red-300'
            : 'border-emerald-500/30 text-emerald-300'
        }`}>
          {notificationMsg}
          <button onClick={() => setNotificationMsg(null)} className="ml-3 hover:text-white/80">&times;</button>
        </div>
      )}
    </div>
  )
}

export default PendingApprovalTab
