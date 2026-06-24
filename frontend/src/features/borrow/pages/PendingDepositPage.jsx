import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getApprovedWaitingPayment } from '../services/borrowService'
import { formatCurrency } from '../../../shared/utils/formatUtils'

export default function PendingDepositPage() {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBorrows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getApprovedWaitingPayment()
      setBorrows(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBorrows()
  }, [fetchBorrows])

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm transition-all duration-200 group mb-4"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-black font-heading" style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
            Đã duyệt — Chờ nạp tiền
          </h1>
          <p className="mt-1 text-sm text-white/40">Các đơn mượn đã được duyệt nhưng độc giả chưa có đủ tiền trong ví</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500/30 border-t-cyan-400" />
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-4 text-center">{error}</div>
        ) : borrows.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-white/60 text-lg">Không có đơn nào chờ nạp tiền</p>
          </div>
        ) : (
          <div className="space-y-3">
            {borrows.map(borrow => (
              <motion.div
                key={borrow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all"
              >
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
                        <span className="text-white/30">Tổng cần: </span>
                        <span className="text-white font-medium">
                          {formatCurrency((Number(borrow.rentalFeeSnapshot) || 0) + (Number(borrow.depositAmount) || 0))}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/30">Duyệt lúc: </span>
                        <span className="text-white/60">{new Date(borrow.updatedAt || borrow.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex-shrink-0">
                    Chờ nạp tiền
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
