import { useState } from 'react'
import { createPayment } from '../services/walletService'

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000]

export default function TopUpModal({ onClose, onSuccess, returnUrl }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    const numAmount = parseInt(amount)
    if (!numAmount || numAmount < 1000) {
      setError('Số tiền tối thiểu 1,000 VNĐ')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const redirectUrl = returnUrl
        ? `${window.location.origin}/my-wallet?returnUrl=${encodeURIComponent(returnUrl)}`
        : `${window.location.origin}/my-wallet`
      const data = await createPayment(numAmount, redirectUrl)
      if (data.gatewayUrl) {
        window.location.href = data.gatewayUrl
      }
      if (onSuccess) onSuccess(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo giao dịch nạp tiền')
    } finally {
      setLoading(false)
    }
  }

  const formatVND = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' VNĐ'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Nạp tiền vào ví</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Chọn số tiền nhanh</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    amount === String(preset)
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                      : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20'
                  }`}
                >
                  {formatVND(preset)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Hoặc nhập số tiền</label>
            <input
              type="number"
              min={1000}
              step={1000}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null) }}
              placeholder="Nhập số tiền (VNĐ)"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-cyan-500/20"
            />
            <p className="text-xs text-white/30 mt-1">Tối thiểu 1,000 VNĐ</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !amount || parseInt(amount) < 1000}
            className="w-full py-3 rounded-xl bg-cyan-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/30"
          >
            {loading ? 'Đang xử lý...' : 'Nạp tiền'}
          </button>
        </div>
      </div>
    </div>
  )
}
