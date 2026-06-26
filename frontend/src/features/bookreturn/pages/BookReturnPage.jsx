import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createReturnRequest, confirmReturn, getFineLevels } from '../services/bookReturnService'
import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'
import QrScannerModal from '../../../shared/components/QrScannerModal'
import { lookupByPickupCode } from '../../borrow/services/borrowService'
// ─── Fetch đơn đang mượn ─────────────────────────────────────────────────────
// Backend (BorrowController.getBorrowsByStatus -> BorrowService.getBorrowingBorrows)
// KHÔNG hỗ trợ tham số page/size/search — luôn trả về TOÀN BỘ danh sách BORROWING.
// Vì vậy không truyền params lọc lên server, việc lọc + phân trang được xử lý ở client.
const getActiveBorrows = async () => {
  const [borrowingRes, returnPendingRes] = await Promise.all([
    apiClient.get(API_ENDPOINTS.BORROW.LIST, { params: { status: 'BORROWING' } }),
    apiClient.get(API_ENDPOINTS.BOOK_RETURN.PENDING, { params: { size: 200 } }),
  ])
  const borrowingList = Array.isArray(borrowingRes.data) ? borrowingRes.data : (borrowingRes.data.content || [])
  const returnPendingRaw = Array.isArray(returnPendingRes.data) ? returnPendingRes.data : (returnPendingRes.data.content || [])
  // PENDING endpoint trả về PendingReturnDTO, cần map về shape giống BorrowRecord
  const returnPendingList = returnPendingRaw.map(r => ({
    ...r,
    status: 'RETURN_PENDING',
  }))
  return [...borrowingList, ...returnPendingList]
}

const PAGE_SIZE = 20

// ─── Modal xác nhận trả trực tiếp (2 bước gộp lại) ──────────────────────────
function DirectReturnModal({ record, onClose, onSuccess }) {
  const [bookCondition, setBookCondition] = useState('')
  const [fineLevelId, setFineLevelId] = useState('')
  const [note, setNote] = useState('')
  const [refundMethod, setRefundMethod] = useState('TO_WALLET')
  const [fineLevels, setFineLevels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    getFineLevels()
      .then(data => setFineLevels(Array.isArray(data) ? data : (data.fineLevels || [])))
      .catch(() => { })
  }, [])

  const isDamaged = bookCondition === 'DAMAGED'
  const isLost = bookCondition === 'LOST'
  const isLateReturn = bookCondition === 'LATE_RETURN'
  const requiresFine = isDamaged || isLateReturn
  const requiresNote = isDamaged || isLost || isLateReturn

  const isOverdue = record.dueDate && new Date(record.dueDate) < new Date()

  const overdueDays = (() => {
    if (!record.dueDate) return 0
    const due = new Date(record.dueDate)
    const now = new Date()
    if (due >= now) return 0
    return Math.max(1, Math.ceil((now - due) / (1000 * 60 * 60 * 24)))
  })()

  const filteredFineLevels = fineLevels.filter(fl => {
    if (!bookCondition) return false
    if (fl.fineType === 'ALL') return true
    if (bookCondition === 'DAMAGED') return fl.fineType === 'DAMAGED' || fl.fineType === 'OVERDUE'
    if (bookCondition === 'LOST') return fl.fineType === 'LOST'
    if (bookCondition === 'LATE_RETURN') return fl.fineType === 'OVERDUE'
    return false
  })

  const selectedFine = fineLevels.find(fl => fl.id === fineLevelId)

  const lateFineAmount = (() => {
    if (!isLateReturn || !selectedFine?.amountPerDay) return 0
    let amount = selectedFine.amountPerDay * overdueDays
    if (selectedFine.maxAmount && amount > selectedFine.maxAmount) amount = selectedFine.maxAmount
    return amount
  })()

  const handleSubmit = async () => {
    if (!bookCondition) { setError('Vui lòng chọn tình trạng sách'); return }
    if (requiresNote && !note.trim()) { setError('Vui lòng nhập ghi chú'); return }
    if (requiresFine && !fineLevelId) { setError('Vui lòng chọn mức phạt'); return }
    if (note.length > 500) { setError('Ghi chú tối đa 500 ký tự'); return }

    setLoading(true)
    setError(null)

    try {
      // Nếu đơn chưa có yêu cầu trả (đang BORROWING/OVERDUE) → tạo yêu cầu trả trước
      if (record.status !== 'RETURN_PENDING') {
        await createReturnRequest({
          borrowRecordId: record.id,
          returnMethod: 'AT_LIBRARY',
          pickupAddress: null,
          staffOverride: true,
        })
      }

      // Xác nhận trả
      const result = await confirmReturn(record.id, {
        bookCondition,
        fineLevelId: requiresFine ? fineLevelId : null,
        note: requiresNote ? note.trim() : null,
        refundMethod: refundMethod || null,
      })

      setSuccess(result.message || 'Xác nhận trả sách thành công')
      setTimeout(() => onSuccess(result), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xác nhận trả sách')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-white mb-1 sticky top-0 bg-slate-900 z-10 pb-2">
          Xác nhận trả sách tại quầy
        </h2>

        {/* Thông tin đơn */}
        {/* Thông tin đơn */}
        <div className="mb-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
          <p className="text-white font-medium">{record.bookTitle}</p>
          <p className="text-white/40 text-sm mt-1">Độc giả: {record.readerName}</p>
          <p className="text-white/40 text-sm mt-1">
            Mã mượn: <span className="text-white/70 font-mono">{record.pickupCode || record.id}</span>
          </p>
          {isOverdue && (
            <p className="text-rose-400 text-sm mt-1 font-medium">Sách đã quá hạn trả ({overdueDays} ngày)</p>
          )}
          {record.dueDate && !isOverdue && (
            <p className="text-white/40 text-sm mt-1">
              Hạn trả: {new Date(record.dueDate).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        {/* Tình trạng sách */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">
            Tình trạng sách <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'NORMAL', label: 'Bình thường', color: 'emerald' },
              { value: 'LATE_RETURN', label: 'Trả muộn', color: 'amber' },
              { value: 'DAMAGED', label: 'Hư hỏng', color: 'orange' },
              { value: 'LOST', label: 'Mất', color: 'rose' },
            ].map(opt => (
              <button key={opt.value} type="button"
                onClick={() => { setBookCondition(opt.value); setFineLevelId(''); setError(null) }}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${bookCondition === opt.value
                  ? `bg-${opt.color}-500/10 text-${opt.color}-400 border-${opt.color}-500/30`
                  : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20'
                  }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mức phạt */}
        {requiresFine && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1">
              Mức phạt <span className="text-rose-400">*</span>
            </label>
            <select value={fineLevelId} onChange={e => setFineLevelId(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]">
              <option value="" className="bg-slate-900">-- Chọn mức phạt --</option>
              {filteredFineLevels.map(fl => (
                <option key={fl.id} value={fl.id} className="bg-slate-900">
                  {isLateReturn && fl.amountPerDay
                    ? `${fl.name} - ${fl.amountPerDay?.toLocaleString()} VNĐ/ngày`
                    : `${fl.name} - ${fl.amount?.toLocaleString()} VNĐ`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tính phí trả muộn */}
        {isLateReturn && selectedFine?.amountPerDay && (
          <div className="mb-4 p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl">
            <p className="text-amber-400 text-xs font-semibold mb-2 uppercase tracking-wider">Tính phí phạt trả muộn</p>
            <div className="text-white/70 text-xs space-y-1">
              <div className="flex justify-between"><span>Số ngày trễ</span><span className="text-white font-mono">{overdueDays} ngày</span></div>
              <div className="flex justify-between"><span>Phạt mỗi ngày</span><span className="text-white font-mono">{selectedFine.amountPerDay?.toLocaleString()} VNĐ</span></div>
              {selectedFine.maxAmount && (
                <div className="flex justify-between text-white/50"><span>Giới hạn tối đa</span><span className="font-mono">{selectedFine.maxAmount?.toLocaleString()} VNĐ</span></div>
              )}
              <hr className="border-white/10 my-1" />
              <div className="flex justify-between font-semibold">
                <span className="text-amber-400">Tổng phạt</span>
                <span className="text-amber-400 font-mono">{lateFineAmount.toLocaleString()} VNĐ</span>
              </div>
            </div>
          </div>
        )}

        {/* Ghi chú */}
        {requiresNote && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1">
              Ghi chú <span className="text-rose-400">*</span>
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder={isLateReturn ? 'Nhập lý do trả muộn' : 'Nhập ghi chú về tình trạng sách'}
              rows={3} maxLength={500}
              className="w-full bg-white/[0.03] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50 placeholder-white/30 resize-none" />
            <p className="text-white/20 text-xs mt-1">{note.length}/500</p>
          </div>
        )}

        {/* Hoàn cọc */}
        {bookCondition !== 'LOST' && bookCondition && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-2">Hình thức nhận tiền hoàn cọc</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'TO_WALLET', label: 'Nạp vào ví', desc: 'Cộng vào số dư ví' },
                { value: 'CASH', label: 'Tiền mặt', desc: 'Trả tiền mặt tại quầy' },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => setRefundMethod(opt.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${refundMethod === opt.value
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20'
                    }`}>
                  <p className="font-semibold">{opt.label}</p>
                  <p className="text-xs opacity-60 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-lg">✓</span>{success}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={loading || !!success}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-50 transition-colors">
            Đóng
          </button>
          {!success && (
            <button onClick={handleSubmit} disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 transition-colors flex items-center gap-2">
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />}
              Xác nhận trả
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Trang chính ──────────────────────────────────────────────────────────────
export default function BookReturnPage() {
  const [allBorrows, setAllBorrows] = useState([])   // toàn bộ danh sách BORROWING lấy từ server
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)
  const [showScanner, setShowScanner] = useState(false)

  const [page, setPage] = useState(1)

  const [searchReader, setSearchReader] = useState('')
  const [searchCode, setSearchCode] = useState('')
  const [searchBook, setSearchBook] = useState('')
  const [activeSearch, setActiveSearch] = useState({ field: null, value: '' })

  const debounceRef = useRef(null)

  const triggerSearch = (field, val) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setActiveSearch({ field, value: val.trim() })
      setPage(1)
    }, 300)
  }

  const handleSearchReader = (val) => { setSearchReader(val); setSearchCode(''); setSearchBook(''); triggerSearch('reader', val) }
  const handleSearchCode = (val) => { setSearchCode(val); setSearchReader(''); setSearchBook(''); triggerSearch('code', val) }
  const handleSearchBook = (val) => { setSearchBook(val); setSearchReader(''); setSearchCode(''); triggerSearch('book', val) }

  const handleClearFilters = () => {
    setSearchReader(''); setSearchCode(''); setSearchBook('')
    setActiveSearch({ field: null, value: '' })
    setPage(1)
  }

  // Load TOÀN BỘ danh sách BORROWING một lần (backend không hỗ trợ filter/pagination)
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await getActiveBorrows()
      setAllBorrows(list)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!successMessage) return
    const t = setTimeout(() => setSuccessMessage(null), 3000)
    return () => clearTimeout(t)
  }, [successMessage])

  const handleScanCode = () => {
    setShowScanner(true)
  }
  const handleScanSuccess = useCallback(async (scannedCode) => {
    const code = scannedCode.trim()

    try {
      const borrowRecord = await lookupByPickupCode(code)

      if (!borrowRecord || !borrowRecord.id) {
        setInfoMessage('Không tìm thấy đơn mượn với mã này')
        return false   // ← camera restart
      }

      if (borrowRecord.status !== 'BORROWING') {
        const STATUS_VI = {
          AWAITING_PICKUP: 'Chờ lấy sách tại thư viện',
          APPROVED_WAITING_PAYMENT: 'Đã duyệt — chờ nạp tiền',
          PENDING_APPROVAL: 'Chờ duyệt',
          RESERVED: 'Đã giữ sách',
          AWAITING_SHIPMENT: 'Chờ giao hàng',
          IN_DELIVERY: 'Đang giao hàng',
          DELIVERED_PENDING: 'Đã giao — chờ xác nhận',
          RETURN_PENDING: 'Đã yêu cầu trả — chờ xác nhận',
          RETURN_REQUESTED: 'Đang chờ lấy hàng trả',
          RETURN_IN_TRANSIT: 'Đang vận chuyển trả',
          RETURNED: 'Đã trả sách',
          REJECTED: 'Đã bị từ chối',
          CANCELLED: 'Đã hủy',
        }
        const statusLabel = STATUS_VI[borrowRecord.status] || borrowRecord.status
        setInfoMessage(`Không thể trả tại quầy\n\nTrạng thái hiện tại: ${statusLabel}`)
        return false   // ← camera restart
      }

      // Thành công → đóng scanner, mở modal trả sách
      setShowScanner(false)
      const localRecord = allBorrows.find(r => r.id === borrowRecord.id)
      setSelectedRecord(localRecord || borrowRecord)
      return true

    } catch (err) {
      const msg = err.response?.data?.message
      if (err.response?.status === 404) {
        setInfoMessage('Không tìm thấy đơn mượn với mã QR này')
      } else {
        setInfoMessage(msg || 'Lỗi khi tra cứu mã QR')
      }
      return false   // ← camera restart
    }
  }, [allBorrows])
  // ─── Filter client-side theo tiêu chí đang active ──────────────────────────
  const filteredBorrows = useMemo(() => {
    const { field, value } = activeSearch
    if (!field || !value) return allBorrows

    const keyword = value.toLowerCase()

    return allBorrows.filter(r => {
      if (field === 'reader') {
        return (r.readerName || '').toLowerCase().includes(keyword)
      }
      if (field === 'code') {
        const code = (r.pickupCode || r.id || '').toString().toLowerCase()
        return code.includes(keyword)
      }
      if (field === 'book') {
        return (r.bookTitle || '').toLowerCase().includes(keyword)
      }
      return true
    })
  }, [allBorrows, activeSearch])
  // ─── Phân trang client-side trên kết quả đã filter ─────────────────────────
  const totalElements = filteredBorrows.length
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE))

  // Nếu trang hiện tại vượt quá tổng số trang sau khi filter, kéo về trang cuối hợp lệ
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  const borrows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredBorrows.slice(start, start + PAGE_SIZE)
  }, [filteredBorrows, page])

  const isFiltering = !!activeSearch.field && !!activeSearch.value

  const handleSuccess = (result) => {
    setSelectedRecord(null)
    setSuccessMessage(result?.message || 'Xác nhận trả sách thành công')
    fetchData()
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span className="text-sm font-medium">Quay lại</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Xác nhận trả sách</h1>
            <p className="text-white/40 text-sm mt-0.5">Tìm đơn mượn và thực hiện thủ tục trả sách tại quầy</p>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <p className="text-white/40 text-xs uppercase tracking-wider">Tìm đơn mượn</p>
              <button onClick={handleScanCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V5a2 2 0 012-2h2M3 17v2a2 2 0 002 2h2m10-16h2a2 2 0 012 2v2m-2 14h2a2 2 0 002-2v-2M7 12h10" />
                </svg>
                Quét mã
              </button>
            </div>
            {isFiltering && (
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  Kết quả: {totalElements} đơn
                </span>
                <button onClick={handleClearFilters}
                  className="text-white/40 text-xs hover:text-white underline transition-colors">
                  Xoá bộ lọc
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input type="text" value={searchReader} onChange={e => handleSearchReader(e.target.value)}
                placeholder="Tên độc giả..."
                className="w-full bg-white/[0.03] border border-white/10 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500/50 placeholder-white/30 transition-colors" />
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <input type="text" value={searchCode} onChange={e => handleSearchCode(e.target.value)}
                placeholder="Mã đơn mượn..."
                className="w-full bg-white/[0.03] border border-white/10 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500/50 placeholder-white/30 transition-colors" />
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <input type="text" value={searchBook} onChange={e => handleSearchBook(e.target.value)}
                placeholder="Tên sách..."
                className="w-full bg-white/[0.03] border border-white/10 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500/50 placeholder-white/30 transition-colors" />
            </div>
          </div>
        </div>

        {/* Bảng kết quả */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/40">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 mr-3" />
              Đang tải danh sách...
            </div>
          ) : error ? (
            <div className="text-center py-16 m-4 border border-rose-500/30 bg-rose-500/5 rounded-2xl">
              <p className="text-rose-300 text-sm mb-4">{error}</p>
              <button onClick={fetchData} className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
                Thử lại
              </button>
            </div>
          ) : borrows.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <p className="text-4xl mb-3 opacity-20">📭</p>
              <p className="text-base">Không tìm thấy đơn mượn nào</p>
              <p className="text-sm text-white/30 mt-1">
                {isFiltering ? `Không có kết quả cho "${activeSearch.value}"` : 'Chưa có đơn mượn đang hoạt động'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <th className="pb-3 pt-4 pl-4 pr-4 font-medium">Mã đơn</th>
                    <th className="pb-3 pt-4 pr-4 font-medium">Độc giả</th>
                    <th className="pb-3 pt-4 pr-4 font-medium">Sách</th>
                    <th className="pb-3 pt-4 pr-4 font-medium">Trạng thái</th>
                    <th className="pb-3 pt-4 pr-4 font-medium">Ngày mượn</th>
                    <th className="pb-3 pt-4 pr-4 font-medium">Hạn trả</th>
                    <th className="pb-3 pt-4 pr-4 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {borrows.map(r => {
                    const isOverdue = r.dueDate && new Date(r.dueDate) < new Date()
                    return (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 pl-4 pr-4 text-white/60 font-mono text-xs">{r.pickupCode || r.id}</td>
                        <td className="py-3 pr-4 text-white font-medium">{r.readerName}</td>
                        <td className="py-3 pr-4 text-white/70">{r.bookTitle}</td>
                        <td className="py-3 pr-4">
                          {r.status === 'RETURN_PENDING' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                              Đã yêu cầu trả
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Đang mượn
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-white/40 text-xs">
                          {r.borrowDate ? new Date(r.borrowDate).toLocaleDateString('vi-VN') : '---'}
                        </td>
                        <td className="py-3 pr-4">
                          {r.dueDate ? (
                            <span className={isOverdue ? 'text-rose-400 font-medium text-xs' : 'text-white/40 text-xs'}>
                              {new Date(r.dueDate).toLocaleDateString('vi-VN')}
                              {isOverdue && ' (quá hạn)'}
                            </span>
                          ) : (
                            <span className="text-white/30 text-xs">---</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <button onClick={() => setSelectedRecord(r)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
                            Trả sách
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <p className="text-white/50 text-xs">
                {isFiltering ? (
                  <>Hiển thị <span className="text-white font-semibold">{borrows.length}</span> / <span className="text-white font-semibold">{totalElements}</span> đơn (đã lọc)</>
                ) : (
                  <>Tổng: <span className="text-white font-semibold">{totalElements}</span> đơn đang mượn</>
                )}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-colors">
                    ← Trước
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) pageNum = i + 1
                    else if (page <= 3) pageNum = i + 1
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                    else pageNum = page - 2 + i
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${page === pageNum
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-white/5 border border-transparent text-white/40 hover:bg-white/10'
                          }`}>
                        {pageNum}
                      </button>
                    )
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-colors">
                    Sau →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal trả sách trực tiếp */}
      {selectedRecord && (
        <DirectReturnModal

          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* QR Scanner */}
      {showScanner && (
        <QrScannerModal
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm border bg-slate-900/80 backdrop-blur-xl border-emerald-500/30 text-emerald-300">
          <span className="font-bold mr-1">✓</span>
          {successMessage}
          <button onClick={() => setSuccessMessage(null)} className="ml-3 hover:text-white/80">&times;</button>
        </div>
      )}

      {infoMessage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-cyan-500/20 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <p className="text-white text-sm leading-relaxed mb-5 whitespace-pre-line">{infoMessage}</p>
            <button
              onClick={() => setInfoMessage(null)}
              className="w-full py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-medium text-sm hover:bg-cyan-500/20 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}