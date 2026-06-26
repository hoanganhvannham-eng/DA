import { useState, useCallback, useEffect } from 'react'
import { lookupByPickupCode, pickupByCode } from '../services/borrowService'
import QrScannerModal from '../../../shared/components/QrScannerModal'
import ConfirmPickupModal from '../components/ConfirmPickupModal'
import { Link, useSearchParams } from 'react-router-dom'

const STATUS_VI = {
  BORROWING: 'Đang mượn',
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED_WAITING_PAYMENT: 'Chờ nạp tiền',
  RESERVED: 'Đã giữ sách',
  AWAITING_SHIPMENT: 'Chờ giao hàng',
  IN_DELIVERY: 'Đang giao hàng',
  RETURN_PENDING: 'Chờ trả sách',
  RETURNED: 'Đã trả',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy',
}

export default function PickupScanPage() {
  const [searchParams] = useSearchParams()
  const [pickupCode, setPickupCode] = useState('')
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      const upper = codeFromUrl.trim().toUpperCase()
      setPickupCode(upper)
      handleLookup(upper)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLookup = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const code = typeof e === 'string' ? e : pickupCode
    if (!code.trim()) { setError('Vui lòng nhập mã nhận sách'); return }
    setLoading(true)
    setError(null)
    try {
      const data = await lookupByPickupCode(code.trim())
      if (data.status !== 'AWAITING_PICKUP') {
        const label = STATUS_VI[data.status] || data.status
        setError(`Sách đang ở trạng thái: ${label}`)
        return
      }
      setConfirmTarget({ ...data, id: code.trim() })
    } catch (err) {
      setError(err.response?.data?.message || 'Không tìm thấy phiếu mượn với mã này')
    } finally {
      setLoading(false)
    }
  }

  const handleScanSuccess = useCallback(async (scannedCode) => {
    const code = scannedCode.trim().toUpperCase()
    console.log('🎯 handleScanSuccess called, code:', code)
    try {
      const data = await lookupByPickupCode(code)
      console.log('📦 lookup result:', data)
      if (data.status !== 'AWAITING_PICKUP') {
        const label = STATUS_VI[data.status] || data.status
        console.log('❌ Sai trạng thái:', data.status)
        setNotification({ msg: `Sách đang ở trạng thái: ${label}` })
        return false
      }
      console.log('✅ Đúng trạng thái, setConfirmTarget:', code)
      setShowScanner(false)
      setConfirmTarget({ ...data, id: code })
      return true
    } catch (err) {
      console.error('❌ lookup error:', err)
      setNotification({
        msg: err.response?.data?.message || 'Không tìm thấy phiếu mượn với mã này',
      })
      return false
    }
  }, [])

  const handleConfirm = async (code) => {
    await pickupByCode(code)
    setConfirmTarget(null)
    setPickupCode('')
    setNotification({ msg: '✓ Xác nhận nhận sách thành công!' })
  }

  const handleNotificationOk = () => {
    setNotification(null)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm transition-all duration-200 group mb-4">
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50 uppercase"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-cyan-400 hover:border-cyan-500/40 text-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                  </svg>
                  <span className="hidden sm:inline">Quét QR</span>
                </button>
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
      </div>

      {/* Modal xác nhận giao sách */}
      {confirmTarget && (
        <ConfirmPickupModal
          borrow={confirmTarget}
          onSubmit={handleConfirm}
          onClose={() => setConfirmTarget(null)}
        />
      )}

      {/* Notification đè lên scanner (zIndex 10000 > scanner 9999) */}
      {notification && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', maxWidth: '300px', width: '90%', textAlign: 'center' }}>
            <p style={{ color: notification.msg?.startsWith('✓') ? '#86efac' : '#fca5a5', fontSize: '15px', marginBottom: '20px', lineHeight: 1.5 }}>
              {notification.msg}
            </p>
            <button
              onClick={handleNotificationOk}
              style={{ padding: '10px 40px', borderRadius: '10px', background: '#22d3ee', color: '#000', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Scanner */}
      {showScanner && !confirmTarget && (
        <QrScannerModal
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}