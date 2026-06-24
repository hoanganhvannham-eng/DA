import React, { useState, useEffect, useCallback } from 'react'
import { getDeliveryIssues } from '../services/shippingService'
import DeliveryIssueDetailPanel from './DeliveryIssueDetailPanel'

const ISSUE_STATUS_STYLES = {
  DELIVERY_ISSUE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DELIVERY_FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  DELIVERY_LOST: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const ISSUE_STATUS_LABELS = {
  DELIVERY_ISSUE: 'Có vấn đề',
  DELIVERY_FAILED: 'Giao thất bại',
  DELIVERY_LOST: 'Mất hàng',
}

const DeliveryIssuesTab = ({ refreshTrigger }) => {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBorrow, setSelectedBorrow] = useState(null)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDeliveryIssues()
      setBorrows(Array.isArray(data) ? data : data.borrows || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách vấn đề giao hàng')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues, refreshTrigger])

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
        <div className="text-4xl mb-3 opacity-30">✅</div>
        <p className="text-white/40 font-medium">Không có vấn đề giao hàng nào</p>
        <p className="text-white/30 text-sm mt-1">Tất cả đơn giao hàng đang hoạt động bình thường</p>
      </div>
    )
  }

  if (selectedBorrow) {
    return (
      <DeliveryIssueDetailPanel
        borrow={selectedBorrow}
        onBack={() => {
          setSelectedBorrow(null)
          fetchIssues()
        }}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">
          Có <span className="text-white font-semibold">{borrows.length}</span> đơn cần xử lý
        </p>
      </div>

      <div className="space-y-3">
        {borrows.map(borrow => {
          const statusStyle = ISSUE_STATUS_STYLES[borrow.status] || 'bg-white/[0.03] text-white/40 border-white/10'
          const statusLabel = ISSUE_STATUS_LABELS[borrow.status] || borrow.status

          return (
            <button
              key={borrow.id}
              onClick={() => setSelectedBorrow(borrow)}
              className="w-full text-left bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {borrow.bookTitle || 'Sách'}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span>Lần giao: {borrow.deliveryAttemptCount ?? 0}/3</span>
                    {borrow.issueDescription && (
                      <span className="truncate max-w-xs">
                        Mô tả: {borrow.issueDescription}
                      </span>
                    )}
                  </div>
                </div>

                <svg className="w-5 h-5 text-white/20 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DeliveryIssuesTab
