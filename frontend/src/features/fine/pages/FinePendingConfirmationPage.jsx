import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getPendingConfirmFines,
  getFineDetail,
  confirmPayment,
  rejectPayment,
} from '../services/fineService'

const statusConfig = {
  PENDING_CONFIRM: { label: 'Chờ xác nhận', class: 'bg-blue-900/50 text-blue-300 border-blue-700/60' },
  PAID: { label: 'Đã thanh toán', class: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/60' },
  REJECTED: { label: 'Từ chối', class: 'bg-red-900/50 text-red-300 border-red-700/60' },
}

const FinePendingConfirmationPage = () => {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [selectedFine, setSelectedFine] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [rejectSubmitting, setRejectSubmitting] = useState(false)

  const [actionSubmitting, setActionSubmitting] = useState(false)

  const loadFines = useCallback(async (pageNum = 0) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPendingConfirmFines(pageNum)
      setFines(data.content || [])
      setPage(data.number ?? 0)
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách')
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePageChange = (newPage) => {
    loadFines(newPage)
  }

  useEffect(() => { loadFines() }, [loadFines])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(''), 3500)
    return () => clearTimeout(timer)
  }, [successMessage])

  const handleViewDetail = async (fineId) => {
    try {
      setDetailLoading(true)
      setDetailError(null)
      const data = await getFineDetail(fineId)
      setSelectedFine(data.fine || data)
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Không thể tải chi tiết')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCloseDetail = () => {
    setSelectedFine(null)
    setDetailError(null)
  }

  const handleConfirm = async () => {
    if (!selectedFine) return
    try {
      setActionSubmitting(true)
      await confirmPayment(selectedFine.id)
      handleCloseDetail()
      setSuccessMessage('Xác nhận thanh toán thành công')
      loadFines()
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Xác nhận thất bại')
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleOpenReject = () => {
    setRejectReason('')
    setRejectError('')
    setShowRejectModal(true)
  }

  const handleSubmitReject = async () => {
    const trimmed = rejectReason.trim()
    if (!trimmed) {
      setRejectError('Vui lòng nhập lý do từ chối')
      return
    }
    if (trimmed.length > 500) {
      setRejectError('Lý do từ chối tối đa 500 ký tự')
      return
    }
    try {
      setRejectSubmitting(true)
      setRejectError('')
      await rejectPayment(selectedFine.id, trimmed)
      setShowRejectModal(false)
      handleCloseDetail()
      setSuccessMessage('Từ chối thanh toán thành công')
      loadFines()
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Từ chối thất bại')
    } finally {
      setRejectSubmitting(false)
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('vi-VN')
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] animate-blob-drift pointer-events-none" />
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 hover:text-glow-cyan text-sm transition-all duration-200 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-glow-cyan">
            Xác nhận thanh toán phạt
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Xác nhận hoặc từ chối khoản phạt do độc giả thanh toán
          </p>
        </div>

        {successMessage && (
          <div role="alert" className="flex items-center gap-2 px-4 py-3 rounded-xl glass-elevated border-emerald-500/20 text-emerald-300 text-sm animate-fade-in-up">
            <span className="text-emerald-400 font-bold">{'\u2713'}</span>
            {successMessage}
          </div>
        )}

        <div className="glass-standard rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Đang tải danh sách...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={loadFines} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm transition-all">
                Thử lại
              </button>
            </div>
          ) : fines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
              <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-sm">Không có khoản phạt nào chờ xác nhận</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-white/40 label-cyber">
                  <th className="px-4 py-3 text-left">Nguyên nhân</th>
                  <th className="px-4 py-3 text-left">Số tiền</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Độc giả</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Sách</th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">Ngày gửi</th>
                  <th className="w-28 px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {fines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{fine.cause || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-mono">{formatCurrency(fine.amount)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 hidden md:table-cell">
                      {fine.readerName || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs hidden lg:table-cell">
                      {fine.bookTitle || '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 text-xs hidden md:table-cell">
                      {formatDate(fine.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetail(fine.id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all active:scale-95"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && totalPages > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-mono">
              Tổng cộng: <span className="text-slate-400 font-semibold">{totalElements}</span> phiếu phạt
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-medium transition-all"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    i === page
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-medium transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedFine && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseDetail}
        >
          <div
            className="glass-elevated rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Chi tiết khoản phạt</h2>
              <button onClick={handleCloseDetail} className="text-slate-400 hover:text-cyan-400 hover:text-glow-cyan transition-all duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : detailError ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <p className="text-red-400 text-sm">{detailError}</p>
                <button onClick={() => handleViewDetail(selectedFine.id)} className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm">
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/60 rounded-xl p-4 space-y-2">
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Thông tin phạt</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Nguyên nhân: <span className="text-white font-medium">{selectedFine.cause || '-'}</span></p>
                      <p className="text-sm text-slate-400">Số tiền: <span className="text-white font-mono font-medium">{formatCurrency(selectedFine.amount)}</span></p>
                      <p className="text-sm text-slate-400">Loại: <span className="text-white font-medium">{selectedFine.fineType || '-'}</span></p>
                      <p className="text-sm text-slate-400">Trạng thái: <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${(statusConfig[selectedFine.status] || statusConfig.PENDING_CONFIRM).class}`}>{(statusConfig[selectedFine.status] || statusConfig.PENDING_CONFIRM).label}</span></p>
                    </div>
                    {selectedFine.note && (
                      <p className="text-sm text-slate-400 mt-2">Ghi chú: <span className="text-slate-300">{selectedFine.note}</span></p>
                    )}
                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-4 space-y-2">
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Độc giả & Sách</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">Độc giả: <span className="text-white font-medium">{selectedFine.readerName || '-'}</span></p>
                      <p className="text-sm text-slate-400">Sách: <span className="text-white font-medium">{selectedFine.bookTitle || '-'}</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-4">
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Minh chứng thanh toán</h3>
                  {selectedFine.paymentProofUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <img
                        src={selectedFine.paymentProofUrl}
                        alt="Minh chứng thanh toán"
                        className="w-full max-h-80 object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic">Không có minh chứng</p>
                  )}
                </div>

                {selectedFine.status === 'PENDING_CONFIRM' && (
                  <div className="flex gap-3 pt-2 justify-end">
                    <button
                      onClick={handleOpenReject}
                      disabled={actionSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-95"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={actionSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-95"
                    >
                      {actionSubmitting ? 'Đang xử lý...' : 'Đã thanh toán'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showRejectModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { if (!rejectSubmitting) setShowRejectModal(false) }}
        >
          <div
            className="glass-elevated rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white text-center mb-4">
              Từ chối thanh toán
            </h2>
            <p className="text-slate-400 text-sm mb-2">
              Vui lòng nhập lý do từ chối:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Nhập lý do từ chối..."
            />
            <p className="text-xs text-slate-500 text-right mt-1">
              {rejectReason.length}/500
            </p>
            {rejectError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/40 border border-red-700/60 text-red-300 text-sm mt-2">
                <span className="font-bold">{'\u2717'}</span>
                {rejectError}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={rejectSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-sm transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReject}
                disabled={rejectSubmitting || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-95"
              >
                {rejectSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinePendingConfirmationPage
