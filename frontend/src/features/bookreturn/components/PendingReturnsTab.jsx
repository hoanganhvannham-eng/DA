import { useState, useEffect, useCallback, useRef } from 'react'
import { getPendingReturns, bulkConfirmReturn } from '../services/bookReturnService'
import ConfirmReturnModal from './ConfirmReturnModal'

export default function PendingReturnsTab({ refreshTrigger }) {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectAllOnPage, setSelectAllOnPage] = useState(false)

  const [bulkLoading, setBulkLoading] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkRefundMethod, setBulkRefundMethod] = useState('TO_WALLET')

  const debounceRef = useRef(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: page - 1, size: 20 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (methodFilter) params.returnMethod = methodFilter
      const data = await getPendingReturns(params)
      setReturns(data.content || [])
      setTotalPages(data.totalPages || 1)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, methodFilter])

  const refreshData = useCallback(async () => {
    try {
      const params = { page: page - 1, size: 20 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (methodFilter) params.returnMethod = methodFilter
      const data = await getPendingReturns(params)
      setReturns(data.content || [])
      setTotalPages(data.totalPages || 1)
      setTotalElements(data.totalElements || 0)
    } catch {
    }
  }, [page, search, statusFilter, methodFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshTrigger])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    setSelectAllOnPage(false)
    setSelectedIds(new Set())
  }, [returns])

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(e.target.value)
      setPage(1)
    }, 300)
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
    setPage(1)
  }

  const handleMethodFilterChange = (e) => {
    setMethodFilter(e.target.value)
    setPage(1)
  }

  const handleConfirmSuccess = (result) => {
    setSelectedRecord(null)
    setSuccessMessage(result?.message || 'Xác nhận trả sách thành công')
    setNotificationType('success')
    refreshData()
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectAllOnPage) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(returns.map(r => r.id)))
    }
    setSelectAllOnPage(!selectAllOnPage)
  }

  const handleBulkConfirm = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length > 100) {
      setSuccessMessage('Mỗi lần tối đa 100 đơn. Vui lòng bỏ bớt lựa chọn.')
      setNotificationType('error')
      setBulkLoading(false)
      return
    }
    setBulkLoading(true)
    try {
      const result = await bulkConfirmReturn({
        borrowIds: ids,
        bookCondition: 'NORMAL',
        refundMethod: bulkRefundMethod,
      })
      setSuccessMessage(result.message || 'Xác nhận hàng loạt thành công')
      setNotificationType(result.totalFailed > 0 ? 'error' : 'success')
      setSelectedIds(new Set())
      setSelectAllOnPage(false)
      setShowBulkModal(false)
      refreshData()
    } catch (err) {
      setSuccessMessage(err.response?.data?.message || 'Xác nhận hàng loạt thất bại')
      setNotificationType('error')
    } finally {
      setBulkLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      RETURN_PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      RETURN_RECEIVED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    }
    const labels = {
      RETURN_PENDING: 'Chờ xác nhận trả',
      RETURN_RECEIVED: 'Đã nhận sách trả',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-white/5 text-white/40 border-white/10'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getMethodLabel = (method) => {
    if (method === 'SHIPPING') return 'Gửi qua shipping'
    return 'Trả tại thư viện'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-white/40">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 mr-3" />
        Đang tải danh sách...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 border border-rose-500/30 bg-rose-500/5 rounded-2xl">
        <p className="text-rose-300 text-sm mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-white/5">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm theo tên sách..."
              className="w-full bg-white/[0.03] border border-white/10 text-white text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500/50 placeholder-white/30"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="bg-white/[0.03] border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
          >
            <option value="" className="bg-slate-900">Tất cả trạng thái</option>
            <option value="RETURN_PENDING" className="bg-slate-900">Chờ xác nhận trả</option>
            <option value="RETURN_RECEIVED" className="bg-slate-900">Đã nhận sách trả</option>
          </select>
          <select
            value={methodFilter}
            onChange={handleMethodFilterChange}
            className="bg-white/[0.03] border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
          >
            <option value="" className="bg-slate-900">Tất cả phương thức</option>
            <option value="AT_LIBRARY" className="bg-slate-900">Trả tại thư viện</option>
            <option value="SHIPPING" className="bg-slate-900">Gửi qua shipping</option>
          </select>
        </div>

        {returns.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <p className="text-lg mb-2 opacity-30">📭 Không có yêu cầu trả sách nào</p>
            <p className="text-sm text-white/30">Chưa có độc giả nào yêu cầu trả sách</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                  <th className="pb-3 pl-4 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectAllOnPage}
                      onChange={toggleSelectAll}
                      className="rounded border-white/20 bg-white/5 accent-cyan-500"
                    />
                  </th>
                  <th className="pb-3 pr-4 font-medium">Độc giả</th>
                  <th className="pb-3 pr-4 font-medium">Sách</th>
                  <th className="pb-3 pr-4 font-medium">Phương thức</th>
                  <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                  <th className="pb-3 pr-4 font-medium">Hạn trả</th>
                  <th className="pb-3 pr-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {returns.map(r => {
                  const isOverdue = r.dueDate && new Date(r.dueDate) < new Date()
                  const isChecked = selectedIds.has(r.id)
                  return (
                    <tr key={r.id} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${isChecked ? 'bg-cyan-500/5' : ''}`}>
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(r.id)}
                          className="rounded border-white/20 bg-white/5 accent-cyan-500"
                        />
                      </td>
                      <td className="py-3 pr-4 text-white">{r.readerName}</td>
                      <td className="py-3 pr-4 text-white/70">{r.bookTitle}</td>
                      <td className="py-3 pr-4">
                        <span className="text-white/40 text-xs">{getMethodLabel(r.returnMethod)}</span>
                      </td>
                      <td className="py-3 pr-4">{getStatusBadge(r.status)}</td>
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
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                        >
                          Xác nhận trả
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 text-sm">
          <p className="text-white/50 text-xs">
            Tổng: <span className="text-white font-semibold">{totalElements}</span> đơn
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                ← Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-white/5 border border-transparent text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 flex items-center justify-between px-4 py-3 bg-cyan-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl">
          <p className="text-cyan-300 text-sm">
            Đã chọn <span className="font-bold text-cyan-200">{selectedIds.size}</span> đơn
          </p>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => { setSelectedIds(new Set()); setSelectAllOnPage(false) }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-colors"
            >
              Bỏ chọn
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 transition-colors"
            >
              Xác nhận hàng loạt
            </button>
          </div>
        </div>
      )}

      {selectedRecord && (
        <ConfirmReturnModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onSuccess={handleConfirmSuccess}
        />
      )}

      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">Xác nhận trả hàng loạt</h2>
            <p className="text-white/60 text-sm mb-4">
              Xác nhận trả <span className="text-cyan-400 font-bold">{selectedIds.size}</span> đơn với tình trạng <span className="text-emerald-400 font-medium">Bình thường (NORMAL)</span>.
              Các đơn có sách hư/mất cần xác nhận riêng.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">Hình thức nhận hoàn cọc</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'TO_WALLET', label: 'Nạp vào ví' },
                  { value: 'CASH', label: 'Tiền mặt' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBulkRefundMethod(opt.value)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                      bulkRefundMethod === opt.value
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        : 'border-white/10 bg-white/[0.03] text-white/40 hover:border-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkModal(false)}
                disabled={bulkLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkConfirm}
                disabled={bulkLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {bulkLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                )}
                Xác nhận {selectedIds.size} đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm border bg-slate-900/80 backdrop-blur-xl ${
          notificationType === 'error'
            ? 'border-red-500/30 text-red-300'
            : 'border-emerald-500/30 text-emerald-300'
        }`}>
          <span className="font-bold mr-1">{notificationType === 'error' ? '✕' : '✓'}</span>
          {successMessage}
          <button onClick={() => setSuccessMessage(null)} className="ml-3 hover:text-white/80">&times;</button>
        </div>
      )}
    </div>
  )
}
