import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lookupByPickupCode, pickupByCode } from '../services/borrowService'
import { formatCurrency } from '../../../shared/utils/formatUtils'

export default function PickupScanPage() {
  const [pickupCode, setPickupCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!pickupCode.trim()) {
      setError('Vui lòng nhập mã nhận sách')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await lookupByPickupCode(pickupCode.trim())
      setResult(data)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không tìm thấy phiếu mượn với mã này'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPickup = async () => {
    if (!result) return
    setLoading(true)
    try {
      await pickupByCode(pickupCode.trim())
      setNotification({ type: 'success', msg: 'Xác nhận nhận sách thành công!' })
      setResult(null)
      setPickupCode('')
    } catch (err) {
      setNotification({ type: 'error', msg: err.response?.data?.message || 'Xác nhận thất bại' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
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
            Nhận sách tại thư viện
          </h1>
          <p className="mt-1 text-sm text-white/40">Quét mã QR hoặc nhập mã nhận sách để xác nhận</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 mb-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Mã nhận sách</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pickupCode}
                  onChange={e => { setPickupCode(e.target.value.toUpperCase()); setError(null) }}
                  placeholder="Nhập mã (ví dụ: LIB-ABC123)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-cyan-500/20 uppercase"
                />
                <button
                  type="submit"
                  disabled={loading || !pickupCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/30"
                >
                  {loading ? '...' : 'Tra cứu'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl p-4 text-center mb-6">{error}</div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Thông tin phiếu mượn</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Sách:</span>
                <span className="text-white font-medium">{result.bookTitle || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Độc giả:</span>
                <span className="text-white">{result.readerName || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Trạng thái:</span>
                <span className="text-cyan-400 font-medium">{result.status}</span>
              </div>
              {result.depositAmount && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Tiền cọc:</span>
                  <span className="text-amber-400">{formatCurrency(result.depositAmount)}</span>
                </div>
              )}
              {result.pickupCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Mã nhận:</span>
                  <span className="text-white font-mono">{result.pickupCode}</span>
                </div>
              )}
            </div>

            {result.status === 'AWAITING_PICKUP' ? (
              <button
                onClick={handleConfirmPickup}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đã nhận sách'}
              </button>
            ) : (
              <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-center text-sm text-white/40">
                Phiếu mượn không ở trạng thái chờ nhận sách
              </div>
            )}
          </motion.div>
        )}

        {notification && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm border bg-slate-900/80 backdrop-blur-xl ${
              notification.type === 'error'
                ? 'border-red-500/30 text-red-300'
                : 'border-emerald-500/30 text-emerald-300'
            }`}
          >
            {notification.msg}
            <button onClick={() => setNotification(null)} className="ml-3 hover:text-white/80">&times;</button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
