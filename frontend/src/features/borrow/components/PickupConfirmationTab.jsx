import React, { useState, useEffect, useCallback } from 'react'
import { getReservedBorrows, getAwaitingPickup, confirmPickup } from '../services/borrowService'
import ConfirmPickupModal from './ConfirmPickupModal'

const PickupConfirmationTab = ({ refreshTrigger, onRefresh }) => {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const fetchBorrows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [reserved, awaitingPickup] = await Promise.all([
        getReservedBorrows(),
        getAwaitingPickup()
      ])
      const reservedList = Array.isArray(reserved) ? reserved : reserved?.data || []
      const awaitingList = Array.isArray(awaitingPickup) ? awaitingPickup : awaitingPickup?.data || []
      setBorrows([...reservedList, ...awaitingList])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách chờ nhận')
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
      await confirmPickup(borrowId)
      setBorrows(prev => prev.filter(b => b.id !== borrowId))
      setSuccessMsg('Xác nhận nhận sách thành công')
      setTimeout(() => setSuccessMsg(null), 4000)
      onRefresh?.()
    } catch (err) {
      throw err
    } finally {
      setActionLoading(null)
    }
  }

  const getTimeRemaining = (reservedUntil) => {
    if (!reservedUntil) return null
    const now = new Date()
    const end = new Date(reservedUntil)
    const diff = end.getTime() - now.getTime()
    if (diff <= 0) return { expired: true, text: 'Đã hết hạn' }
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { expired: false, text: `${hours}g ${minutes}p` }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
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
        <div className="text-4xl mb-3">📚</div>
        <p className="text-slate-400 font-medium">Không có đơn nào chờ nhận sách</p>
        <p className="text-slate-500 text-sm mt-1">Tất cả sách đã giữ đã được nhận hoặc hết hạn</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">Có <span className="text-white font-semibold">{borrows.length}</span> đơn chờ nhận sách</p>
      </div>

      <div className="space-y-3">
        {borrows.map(borrow => {
          const timeLeft = getTimeRemaining(borrow.reservedUntil)
          return (
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
                      borrow.status === 'AWAITING_PICKUP'
                        ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {borrow.status === 'AWAITING_PICKUP' ? 'Nhận tại thư viện' : 'Giao tận nơi'}
                    </span>
                    <span className="text-xs text-white/30">
                      {borrow.durationDays || 14} ngày
                    </span>
                    {borrow.pickupCode && (
                      <span className="text-xs text-white/50 font-mono">
                        Mã: {borrow.pickupCode}
                      </span>
                    )}
                  </div>

                  {timeLeft && (
                    <div className={`flex items-center gap-1.5 ${timeLeft.expired ? 'text-rose-400' : 'text-emerald-400'}`}>
                      <span className="text-xs">⏱ {timeLeft.expired ? 'Hết hạn' : `Còn ${timeLeft.text}`}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setConfirmTarget(borrow)}
                  disabled={actionLoading === borrow.id}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50 flex-shrink-0"
                >
                  {actionLoading === borrow.id ? '...' : 'Xác nhận nhận sách'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {confirmTarget && (
        <ConfirmPickupModal
          borrow={confirmTarget}
          onSubmit={handleConfirm}
          onClose={() => setConfirmTarget(null)}
        />
      )}

      {successMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm border bg-slate-900/80 backdrop-blur-xl border-emerald-500/30 text-emerald-300">
          {successMsg}
          <button onClick={() => setSuccessMsg(null)} className="ml-3 hover:text-white/80">&times;</button>
        </div>
      )}
    </div>
  )
}

export default PickupConfirmationTab
