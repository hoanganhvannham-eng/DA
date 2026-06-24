import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPaymentStatus, mockPaymentCallback } from '../services/walletService'
import { formatCurrency } from '../../../shared/utils/formatUtils'

export default function MockPaymentPage() {
  const { paymentCode } = useParams()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const data = await getPaymentStatus(paymentCode)
        setPayment(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin giao dịch')
      } finally {
        setLoading(false)
      }
    }
    fetchPayment()
  }, [paymentCode])

  const handleCallback = async (result) => {
    setProcessing(true)
    setError(null)
    try {
      const data = await mockPaymentCallback(paymentCode, result)
      const baseUrl = data.redirectUrl || `${window.location.origin}/my-wallet`
      const url = new URL(baseUrl)
      url.searchParams.set('status', result.toLowerCase())
      window.location.href = url.toString()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi xử lý thanh toán')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500/30 border-t-cyan-400" />
      </div>
    )
  }

  if (error && !payment) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-rose-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h1 className="text-xl font-bold text-white">Cổng thanh toán giả lập</h1>
          <p className="text-white/40 text-sm mt-1">Mock Payment Gateway</p>
        </div>

        {payment && (
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Mã giao dịch:</span>
              <span className="text-white font-mono">{payment.paymentCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Số tiền:</span>
              <span className="text-white font-semibold">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Trạng thái:</span>
              <span className={`font-medium ${
                payment.status === 'PENDING' ? 'text-amber-400' :
                payment.status === 'SUCCESS' ? 'text-emerald-400' :
                'text-rose-400'
              }`}>
                {payment.status}
              </span>
            </div>
            {payment.expiredAt && (
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Hết hạn:</span>
                <span className="text-white/60">{new Date(payment.expiredAt).toLocaleString('vi-VN')}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-4">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleCallback('SUCCESS')}
            disabled={processing || (payment && payment.status !== 'PENDING')}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
          >
            {processing ? 'Đang xử lý...' : '✅ Thanh toán thành công'}
          </button>
          <button
            onClick={() => handleCallback('FAILED')}
            disabled={processing || (payment && payment.status !== 'PENDING')}
            className="w-full py-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-sm transition-all disabled:opacity-50 hover:bg-rose-500/30"
          >
            {processing ? 'Đang xử lý...' : '❌ Thanh toán thất bại'}
          </button>
          <button
            onClick={() => handleCallback('CANCELLED')}
            disabled={processing || (payment && payment.status !== 'PENDING')}
            className="w-full py-3 rounded-xl bg-white/5 text-white/60 border border-white/10 font-semibold text-sm transition-all disabled:opacity-50 hover:bg-white/10"
          >
            {processing ? 'Đang xử lý...' : '🚫 Hủy giao dịch'}
          </button>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Đây là giao diện giả lập. Trong thực tế, cổng thanh toán sẽ xử lý tự động.
        </p>
      </div>
    </div>
  )
}
