import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getMyFines, payFine } from '../services/fineService'

const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const MAX_SIZE = 5 * 1024 * 1024

const statusConfig = {
  UNPAID: { label: 'Chưa thanh toán', class: 'bg-amber-900/50 text-amber-300 border-amber-700/60' },
  PENDING_CONFIRM: { label: 'Chờ xác nhận', class: 'bg-blue-900/50 text-blue-300 border-blue-700/60' },
  PAID: { label: 'Đã thanh toán', class: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/60' },
  REJECTED: { label: 'Bị từ chối', class: 'bg-red-900/50 text-red-300 border-red-700/60' },
  VOID: { label: 'Đã hủy', class: 'bg-slate-800/50 text-slate-400 border-slate-700/60' },
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }

const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute rounded-full blur-[80px] pointer-events-none w-[500px] h-[500px] bg-cyan-500/10 -top-40 -left-20 animate-pulse" />
  </div>
)

const FineListPage = () => {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const [payingFine, setPayingFine] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [payError, setPayError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadFines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMyFines()
      setFines(data.fines || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách phạt')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadFines() }, [loadFines])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(''), 3500)
    return () => clearTimeout(timer)
  }, [successMessage])

  const handlePayClick = (fine) => {
    setPayingFine(fine)
    setSelectedFile(null)
    setPreviewUrl(null)
    setPayError('')
  }

  const handleClosePayModal = () => {
    setPayingFine(null)
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPayError('')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPayError('Chỉ chấp nhận file JPG hoặc PNG')
      setSelectedFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      return
    }
    if (file.size > MAX_SIZE) {
      setPayError('Dung lượng ảnh tối đa 5MB')
      setSelectedFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      return
    }

    setPayError('')
    setSelectedFile(file)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmitPayment = async () => {
    if (!selectedFile) {
      setPayError('Vui lòng upload ảnh minh chứng thanh toán')
      return
    }
    try {
      setSubmitting(true)
      setPayError('')
      await payFine(payingFine.id, selectedFile)
      handleClosePayModal()
      setSuccessMessage('Yêu cầu thanh toán đã được gửi, chờ nhân viên xác nhận')
      loadFines()
    } catch (err) {
      setPayError(err.response?.data?.message || 'Thanh toán thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  const canPay = (status) => status === 'UNPAID' || status === 'REJECTED'

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const canRetryCount = fines.filter((f) => f.status === 'REJECTED').length

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-10 relative overflow-hidden">
      <BackgroundBlobs />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10" style={{ perspective: '1000px' }}>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm transition-all duration-300 hover:scale-105"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight" style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
            Khoản phạt của tôi
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Xem và thanh toán các khoản phạt trong hệ thống
          </p>
        </div>

        {successMessage && (
          <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 text-emerald-300 text-sm">
            <span className="text-emerald-400 font-bold">&#10003;</span>
            {successMessage}
          </div>
        )}

        {canRetryCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 text-amber-300 text-sm">
            <span className="font-bold">!</span>
            Bạn có {canRetryCount} phiếu phạt bị từ chối. Vui lòng kiểm tra lý do và thanh toán lại.
          </div>
        )}

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-3">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-sm">Đang tải danh sách phạt...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-rose-400 text-sm">{error}</p>
              <button onClick={loadFines} className="px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:bg-white/[0.06] hover:text-white text-sm transition-all">
                Thử lại
              </button>
            </div>
          ) : fines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-white/30 text-sm">Bạn không có khoản phạt nào</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-white/40 font-bold tracking-[0.2em] text-xs uppercase">
                  <th className="px-4 py-3 text-left">Nguyên nhân</th>
                  <th className="px-4 py-3 text-left">Số tiền</th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">Ngày phạt</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="w-28 px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-white/5"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {fines.map((fine) => {
                  const cfg = statusConfig[fine.status] || statusConfig.UNPAID
                  return (
                    <motion.tr key={fine.id} variants={itemVariants} className="hover:bg-white/[0.06] transition-all duration-300">
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{fine.cause || '-'}</div>
                        {fine.rejectionReason && (
                          <div className="text-red-400 text-xs mt-0.5">
                            Lý do: {fine.rejectionReason}
                          </div>
                        )}
                        {fine.voidReason && (
                          <div className="text-slate-500 text-xs mt-0.5">
                            {fine.voidReason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-mono font-semibold">{formatCurrency(fine.amount)}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-white/40 text-xs hidden md:table-cell">
                        {formatDate(fine.fineDate)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.class}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {canPay(fine.status) ? (
                          <button
                            onClick={() => handlePayClick(fine)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold transition-all active:scale-95 hover:shadow-lg hover:shadow-cyan-500/30"
                          >
                            Thanh toán
                          </button>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          )}
        </div>

        {!loading && !error && fines.length > 0 && (
          <p className="text-white/30 text-xs text-right">
            Tổng cộng: <span className="text-white/40 font-semibold">{fines.length}</span> phiếu phạt
          </p>
        )}
      </div>

      {payingFine && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClosePayModal}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white text-center mb-2">
              Thanh toán khoản phạt
            </h2>

            <div className="bg-white/[0.03] rounded-2xl p-4 mb-4 border border-white/5 space-y-1">
              <p className="text-slate-400 text-sm">
                Nguyên nhân: <span className="text-white font-medium">{payingFine.cause}</span>
              </p>
              <p className="text-slate-400 text-sm">
                Số tiền: <span className="text-white font-mono font-medium">{formatCurrency(payingFine.amount)}</span>
              </p>
              {payingFine.status === 'REJECTED' && payingFine.rejectionReason && (
                <p className="text-red-400 text-xs mt-2">
                  Lý do từ chối: {payingFine.rejectionReason}
                </p>
              )}
            </div>

            <p className="text-slate-400 text-sm mb-3">
              Vui lòng chuyển khoản đến tài khoản thư viện và upload ảnh minh chứng:
            </p>

            <div className="bg-white/[0.03] rounded-2xl p-3 mb-4 border border-white/5 text-xs text-slate-300 space-y-1">
              <p>Ngân hàng: <span className="text-white font-medium">Mock Bank</span></p>
              <p>Số tài khoản: <span className="text-white font-medium">1234 5678 9012</span></p>
              <p>Chủ tài khoản: <span className="text-white font-medium">Thư Viện TP.HCM</span></p>
              <p>Nội dung: <span className="text-white font-medium">TT-PHAT-{payingFine.id.slice(0, 8)}</span></p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-slate-400 text-sm mb-1 block">Ảnh minh chứng (JPG/PNG, tối đa 5MB)</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 file:cursor-pointer cursor-pointer"
                />
              </label>

              {previewUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-contain bg-slate-950" />
                </div>
              )}

              {payError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/60 border border-rose-500/20 text-rose-300 text-sm">
                  <span className="font-bold">&#10007;</span>
                  {payError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClosePayModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/40 hover:text-white font-semibold text-sm transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitPayment}
                  disabled={submitting || !selectedFile}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-95 hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  {submitting ? 'Đang xử lý...' : 'Đã thanh toán'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default FineListPage
