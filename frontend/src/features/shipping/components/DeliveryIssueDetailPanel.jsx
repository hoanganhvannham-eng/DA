import React, { useState } from 'react'
import { handleIssue } from '../services/shippingService'
import ConfirmDeliveredModal from './ConfirmDeliveredModal'
import ReplaceRedeliverModal from './ReplaceRedeliverModal'

const ISSUE_STATUS_LABELS = {
  DELIVERY_ISSUE: 'Có vấn đề giao hàng',
  DELIVERY_FAILED: 'Giao thất bại',
  DELIVERY_LOST: 'Mất hàng (Delivery)',
}

const DeliveryIssueDetailPanel = ({ borrow, onBack }) => {
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const [showConfirmDelivered, setShowConfirmDelivered] = useState(false)
  const [showReplaceRedeliver, setShowReplaceRedeliver] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const isLost = borrow.status === 'DELIVERY_LOST'
  const isIssueOrFailed = borrow.status === 'DELIVERY_ISSUE' || borrow.status === 'DELIVERY_FAILED'
  const attempts = borrow.deliveryAttemptCount ?? 0
  const canRedeliver = isIssueOrFailed && attempts < 3
  const isAutoCancelled = isIssueOrFailed && attempts >= 3

  const executeAction = async (action, notes = null, replacementBookId = null) => {
    setActionLoading(action)
    setError(null)
    setSuccessMessage(null)
    try {
      const result = await handleIssue(borrow.id, action, notes, replacementBookId)
      setSuccessMessage(result.message || 'Thao tác thành công')
      setTimeout(() => {
        setShowCancelConfirm(false)
        setShowConfirmDelivered(false)
        setShowReplaceRedeliver(false)
        onBack()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại')
    } finally {
      setActionLoading(null)
    }
  }

  if (successMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-emerald-400 font-semibold">{successMessage}</p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm transition-colors group mb-6"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Quay lại danh sách
      </button>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Chi tiết vấn đề giao hàng</h2>
          <span className="text-xs text-white/30">ID: {borrow.id}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-white/30 uppercase tracking-wider">Sách</p>
            <p className="text-sm text-white font-medium">{borrow.bookTitle || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-white/30 uppercase tracking-wider">Độc giả</p>
            <p className="text-sm text-white font-medium">{borrow.readerName || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-white/30 uppercase tracking-wider">Trạng thái</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-rose-500/10 text-rose-400 border-rose-500/20">
              {ISSUE_STATUS_LABELS[borrow.status] || borrow.status}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-white/30 uppercase tracking-wider">Lần giao</p>
            <p className="text-sm text-white font-medium">{attempts}/3</p>
          </div>
          {borrow.shippingAddress && (
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-white/30 uppercase tracking-wider">Địa chỉ giao</p>
              <p className="text-sm text-white/60">{borrow.shippingAddress}</p>
            </div>
          )}
          {borrow.issueDescription && (
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-white/30 uppercase tracking-wider">Mô tả vấn đề</p>
              <p className="text-sm text-white/60 bg-white/[0.03] border border-white/5 rounded-xl p-3">{borrow.issueDescription}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Hành động xử lý</p>

          {isAutoCancelled && (
            <div className="bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded-xl p-4">
              <p className="text-sm">
                Đã đạt 3 lần giao thất bại. Nhấn "Hủy đơn" để xác nhận tự động hủy.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {canRedeliver && (
              <button
                onClick={() => executeAction('REDELIVER')}
                disabled={actionLoading !== null}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 text-sm font-semibold transition-all disabled:opacity-50"
              >
                {actionLoading === 'REDELIVER' ? 'Đang xử lý...' : 'Giao lại'}
              </button>
            )}

            {isIssueOrFailed && !isAutoCancelled && (
              <button
                onClick={() => setShowConfirmDelivered(true)}
                disabled={actionLoading !== null}
                className="px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 text-sm font-semibold transition-all disabled:opacity-50"
              >
                Xác nhận đã giao đúng
              </button>
            )}

            {isIssueOrFailed && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={actionLoading !== null}
                className="px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 text-sm font-semibold transition-all disabled:opacity-50"
              >
                Hủy đơn mượn
              </button>
            )}

            {isAutoCancelled && (
              <button
                onClick={() => executeAction('AUTO_CANCEL')}
                disabled={actionLoading !== null}
                className="px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 text-sm font-semibold transition-all disabled:opacity-50"
              >
                {actionLoading === 'AUTO_CANCEL' ? 'Đang xử lý...' : 'Xác nhận hủy tự động'}
              </button>
            )}

            {isLost && (
              <>
                <button
                  onClick={() => setShowReplaceRedeliver(true)}
                  disabled={actionLoading !== null}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  Cấp lại sách + giao lại
                </button>
                <button
                  onClick={() => executeAction('CANCEL_LOST')}
                  disabled={actionLoading !== null}
                  className="px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {actionLoading === 'CANCEL_LOST' ? 'Đang xử lý...' : 'Hủy + ghi nhận mất'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showConfirmDelivered && (
        <ConfirmDeliveredModal
          onSubmit={(notes) => executeAction('CONFIRM_DELIVERED', notes)}
          onClose={() => setShowConfirmDelivered(false)}
          loading={actionLoading === 'CONFIRM_DELIVERED'}
        />
      )}

      {showReplaceRedeliver && (
        <ReplaceRedeliverModal
          onSubmit={(replacementBookId) => executeAction('REPLACE_REDELIVER', null, replacementBookId)}
          onClose={() => setShowReplaceRedeliver(false)}
          loading={actionLoading === 'REPLACE_REDELIVER'}
        />
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)}>
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Xác nhận hủy</h3>
            <p className="text-sm text-white/40 mb-6">
              Bạn có chắc chắn muốn hủy đơn mượn này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/40 text-sm font-semibold transition-all hover:text-white"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => executeAction('CANCEL')}
                disabled={actionLoading !== null}
                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 text-sm font-semibold transition-all disabled:opacity-50"
              >
                {actionLoading === 'CANCEL' ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryIssueDetailPanel
