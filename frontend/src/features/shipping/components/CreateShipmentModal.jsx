import React, { useState } from 'react'
import { createShipment } from '../services/shippingService'

const CreateShipmentModal = ({ borrow, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleConfirm = async () => {
    setError('')
    setSubmitting(true)
    try {
      const data = await createShipment(borrow.id)
      setResult(data)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tạo đơn giao hàng'
      setError(msg)
      if (err.response?.data?.newStatus === 'DELIVERY_ISSUE') {
        setResult({ inventoryConflict: true, message: msg })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (result) {
      onSuccess()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={handleClose}>
      <div
        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {!result ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Xác nhận tạo đơn giao hàng</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Tên sách</span>
                <span className="text-white font-medium">{borrow.bookTitle || 'Sách'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Độc giả</span>
                <span className="text-white font-medium">{borrow.readerName || 'Độc giả'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Địa chỉ giao</span>
                <span className="text-white font-medium text-right max-w-[200px] truncate">
                  {borrow.shippingAddress || 'Không có'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Phương thức</span>
                <span className="text-white font-medium">Mock Shipping Provider</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Lần giao</span>
                <span className="text-white font-medium">
                  {(borrow.deliveryAttemptCount ?? 0) + 1}/3
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-4">
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/40 font-semibold text-sm transition-all disabled:opacity-50 hover:text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-sm transition-all disabled:opacity-50 hover:bg-cyan-400"
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận tạo đơn giao'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {result.inventoryConflict ? 'Có vấn đề xảy ra' : 'Tạo đơn giao thành công'}
              </h3>
              <button onClick={onSuccess} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {result.inventoryConflict ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-amber-300">{result.message}</p>
                <p className="text-xs text-amber-300/70 mt-2">
                  Đơn mượn đã chuyển sang trạng thái "Có vấn đề giao hàng". Nhân viên cần kiểm tra kho.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4 space-y-2">
                <p className="text-sm text-emerald-300">{result.message}</p>
                {result.shippingOrder && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Mã tracking</span>
                      <span className="font-mono text-emerald-400">
                        {result.shippingOrder.trackingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Trạng thái</span>
                      <span className="text-white font-medium">
                        {result.shippingOrder.status === 'CREATED' ? 'Đã tạo' : result.shippingOrder.status}
                      </span>
                    </div>
                  </>
                )}
                {result.borrow && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Đơn mượn</span>
                    <span className="text-white font-medium">
                      {result.borrow.status === 'IN_DELIVERY' ? 'Đang giao' : result.borrow.status}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onSuccess}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-sm transition-all hover:bg-cyan-400"
            >
              {result.inventoryConflict ? 'Đã hiểu' : 'Hoàn tất'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CreateShipmentModal
