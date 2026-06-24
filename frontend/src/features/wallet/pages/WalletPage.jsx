import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet, useWalletTransactions } from '../hooks/useWallet'
import TopUpModal from '../components/TopUpModal'
import { formatCurrency } from '../../../shared/utils/formatUtils'

const TRANSACTION_TYPE_LABELS = {
  TOP_UP: 'Nạp tiền',
  RENTAL_FEE: 'Phí thuê sách',
  FINE: 'Phạt',
  DEPOSIT_HOLD: 'Phong toả cọc',
  DEPOSIT_RELEASE: 'Giải toả cọc',
  DEPOSIT_CONVERTED: 'Cọc được chuyển đổi',
  WITHDRAWAL: 'Rút tiền',
  ADMIN_ADJUST: 'Điều chỉnh',
}

const TRANSACTION_TYPE_STYLES = {
  TOP_UP: 'text-emerald-400',
  RENTAL_FEE: 'text-amber-400',
  FINE: 'text-rose-400',
  DEPOSIT_HOLD: 'text-orange-400',
  DEPOSIT_RELEASE: 'text-cyan-400',
  DEPOSIT_CONVERTED: 'text-red-400',
  WITHDRAWAL: 'text-slate-400',
  ADMIN_ADJUST: 'text-violet-400',
}

export default function WalletPage() {
  const [searchParams] = useSearchParams()
  const paymentStatus = searchParams.get('status')?.toLowerCase()
  const returnUrl = searchParams.get('returnUrl')
  const [showTopUp, setShowTopUp] = useState(false)
  const { wallet, loading: walletLoading, error: walletError, refresh: refreshWallet } = useWallet()
  const { transactions, totalPages, page, setPage, loading: txLoading, error: txError, refresh: refreshTx } = useWalletTransactions()

  const handleTopUpSuccess = () => {
    setShowTopUp(false)
    refreshWallet()
    refreshTx()
  }

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100">
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

        {paymentStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-2xl border text-sm ${
              paymentStatus === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : paymentStatus === 'failed'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {paymentStatus === 'success' && (
              <div className="flex items-center justify-between">
                <span>Nạp tiền thành công! Số dư đã được cập nhật.</span>
                {returnUrl && (
                  <Link
                    to={returnUrl}
                    className="ml-4 px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-400 transition-all whitespace-nowrap"
                  >
                    Quay lại sách
                  </Link>
                )}
              </div>
            )}
            {paymentStatus === 'failed' && 'Thanh toán thất bại. Vui lòng thử lại.'}
            {paymentStatus === 'cancelled' && 'Giao dịch đã bị huỷ.'}
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black font-heading" style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
            Ví điện tử
          </h1>
          <button
            onClick={() => setShowTopUp(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-all"
          >
            Nạp tiền
          </button>
        </div>

        {walletLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500/30 border-t-cyan-400" />
          </div>
        ) : walletError ? (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-4 text-center">{walletError}</div>
        ) : wallet ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5">
              <p className="text-sm text-white/40 mb-1">Tổng số dư</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(wallet.balance)}</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5">
              <p className="text-sm text-white/40 mb-1">Đang bị phong toả</p>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(wallet.heldAmount)}</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-5">
              <p className="text-sm text-white/40 mb-1">Số dư khả dụng</p>
              <p className="text-2xl font-bold text-cyan-400">{formatCurrency(wallet.availableBalance)}</p>
            </div>
          </div>
        ) : null}

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5">
          <h2 className="text-lg font-bold text-white mb-4">Lịch sử giao dịch</h2>

          {txLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-500/30 border-t-cyan-400" />
            </div>
          ) : txError ? (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3 text-center text-sm">{txError}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/40">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-2 text-white/40 font-medium">Thời gian</th>
                    <th className="text-left py-3 px-2 text-white/40 font-medium">Loại</th>
                    <th className="text-left py-3 px-2 text-white/40 font-medium">Mô tả</th>
                    <th className="text-right py-3 px-2 text-white/40 font-medium">Số tiền</th>
                    <th className="text-right py-3 px-2 text-white/40 font-medium">Sau giao dịch</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isCredit = ['TOP_UP', 'DEPOSIT_RELEASE', 'ADMIN_ADJUST'].includes(tx.type)
                    return (
                      <tr key={tx.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="py-3 px-2 text-white/60">
                          {new Date(tx.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`font-medium ${TRANSACTION_TYPE_STYLES[tx.type] || 'text-white/60'}`}>
                            {TRANSACTION_TYPE_LABELS[tx.type] || tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-white/60 max-w-[200px] truncate">{tx.description}</td>
                        <td className={`py-3 px-2 text-right font-medium ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 px-2 text-right text-white/80">{formatCurrency(tx.balanceAfter)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 text-sm rounded-xl bg-white/5 text-white/60 border border-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`px-3 py-1.5 text-sm rounded-xl border transition-all ${
                        page === i
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                          : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 text-sm rounded-xl bg-white/5 text-white/60 border border-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={handleTopUpSuccess}
          returnUrl={returnUrl}
        />
      )}
    </div>
  )
}
