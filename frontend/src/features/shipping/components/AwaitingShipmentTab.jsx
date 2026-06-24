import React, { useState, useEffect, useCallback } from 'react'
import { getAwaitingShipmentBorrows } from '../services/shippingService'
import CreateShipmentModal from './CreateShipmentModal'

const AwaitingShipmentTab = ({ refreshTrigger }) => {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBorrow, setSelectedBorrow] = useState(null)

  const fetchBorrows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAwaitingShipmentBorrows()
      setBorrows(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách chờ giao hàng')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBorrows()
  }, [fetchBorrows, refreshTrigger])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mt-4">
        <p className="text-sm text-rose-300">{error}</p>
      </div>
    )
  }

  if (borrows.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3 opacity-30">📦</div>
        <p className="text-white/40 font-medium">Không có đơn mượn nào chờ giao hàng</p>
        <p className="text-white/30 text-sm mt-1">Tất cả đơn mượn giao tận nơi đã được xử lý</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">
          Có <span className="text-white font-semibold">{borrows.length}</span> đơn chờ giao hàng
        </p>
      </div>

      <div className="space-y-3">
        {borrows.map(borrow => (
          <div
            key={borrow.id}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <h4 className="text-sm font-semibold text-white truncate">
                  {borrow.bookTitle || 'Sách'}
                </h4>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Giao tận nơi
                  </span>
                  <span className="text-xs text-white/30">
                    {borrow.durationDays || 14} ngày
                  </span>
                  <span className="text-xs text-white/40">
                    Lần giao: {borrow.deliveryAttemptCount ?? 0}/3
                  </span>
                </div>

                {borrow.shippingAddress && (
                  <p className="text-xs text-white/30 truncate">
                    Địa chỉ: {borrow.shippingAddress}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedBorrow(borrow)}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-semibold transition-all whitespace-nowrap"
              >
                Tạo đơn giao
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedBorrow && (
        <CreateShipmentModal
          borrow={selectedBorrow}
          onClose={() => setSelectedBorrow(null)}
          onSuccess={() => {
            setSelectedBorrow(null)
            fetchBorrows()
          }}
        />
      )}
    </div>
  )
}

export default AwaitingShipmentTab
