import { useState, useEffect, useCallback, useRef } from 'react'
import { getReturnRequestedBorrows, createReturnShipment } from '../services/bookReturnService'

export default function ReturnRequestedTab({ refreshTrigger }) {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectAllOnPage, setSelectAllOnPage] = useState(false)
  const debounceRef = useRef(null)

  const fetchData = useCallback(async (currentPage, currentSearch) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: currentPage ?? page, size: 20 }
      if (currentSearch ?? search) params.search = currentSearch ?? search
      const data = await getReturnRequestedBorrows(params)
      setBorrows(Array.isArray(data.content) ? data.content : [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  const refreshData = useCallback(async () => {
    const params = { page, size: 20 }
    if (search) params.search = search
    try {
      const data = await getReturnRequestedBorrows(params)
      setBorrows(Array.isArray(data.content) ? data.content : [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch {
      // silent
    }
  }, [page, search])

  useEffect(() => {
    fetchData(page, search)
  }, [fetchData, page, search, refreshTrigger])

  useEffect(() => {
    if (!successMsg) return
    const timer = setTimeout(() => setSuccessMsg(null), 3000)
    return () => clearTimeout(timer)
  }, [successMsg])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(val)
      setPage(0)
      setSelectedIds(new Set())
      setSelectAllOnPage(false)
    }, 300)
  }

  const handleCreateShipment = async (borrowId) => {
    setActionLoading(borrowId)
    setError(null)
    try {
      await createReturnShipment(borrowId)
      setSuccessMsg('Tạo đơn vận chuyển trả thành công')
      refreshData()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo đơn vận chuyển')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectAllOnPage) {
      setSelectedIds(new Set())
      setSelectAllOnPage(false)
    } else {
      setSelectedIds(new Set(borrows.map(b => b.borrowId)))
      setSelectAllOnPage(true)
    }
  }

  const handleBulkCreateShipment = async () => {
    setBulkLoading(true)
    setError(null)
    let success = 0
    let fail = 0
    for (const id of selectedIds) {
      try {
        await createReturnShipment(id)
        success++
      } catch {
        fail++
      }
    }
    setSuccessMsg(`Đã tạo đơn: ${success}/${selectedIds.size} thành công`)
    setSelectedIds(new Set())
    setSelectAllOnPage(false)
    setBulkLoading(false)
    refreshData()
  }

  const getPageNumbers = () => {
    const maxVisible = 5
    const pages = []
    let start = Math.max(0, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible)
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible)
    for (let i = start; i < end; i++) pages.push(i)
    return pages
  }

  if (loading && borrows.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-white/40">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 mr-3" />
        Đang tải danh sách...
      </div>
    )
  }

  if (error && borrows.length === 0) {
    return (
      <div className="text-center py-16 border border-rose-500/30 bg-rose-500/5 rounded-2xl">
        <p className="text-rose-300 text-sm mb-4">{error}</p>
        <button onClick={() => fetchData(page, search)} className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Tìm theo tên sách..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
        {searchInput && (
          <button onClick={() => { setSearchInput(''); setSearch(''); setPage(0) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/40">
          Có <span className="text-white font-semibold">{totalElements}</span> đơn chờ gửi trả
        </p>
        {borrows.length > 0 && (
          <button onClick={toggleSelectAll} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            {selectAllOnPage ? 'Bỏ chọn tất cả' : 'Chọn tất cả trên trang'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {borrows.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <p className="text-lg mb-2 opacity-30">📬 Không có yêu cầu trả qua shipping nào</p>
          <p className="text-sm text-white/30">Chưa có độc giả nào yêu cầu gửi trả sách</p>
        </div>
      )}

      {/* List */}
      {borrows.length > 0 && (
        <div className="space-y-3">
          {borrows.map(borrow => (
            <div key={borrow.borrowId} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(borrow.borrowId)}
                    onChange={() => toggleSelect(borrow.borrowId)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <h4 className="text-sm font-semibold text-white truncate">{borrow.bookTitle || 'Sách'}</h4>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-white/40">{borrow.readerName}</span>
                      <span className="text-white/20">|</span>
                      <span className="text-white/30">Lần gửi: {borrow.returnAttemptCount ?? 0}/3</span>
                    </div>
                    {borrow.pickupAddress && (
                      <p className="text-xs text-white/30 truncate">Địa chỉ: {borrow.pickupAddress}</p>
                    )}
                    {borrow.dueDate && (
                      <p className="text-xs text-white/30">Hạn trả: {new Date(borrow.dueDate).toLocaleDateString('vi-VN')}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleCreateShipment(borrow.borrowId)}
                  disabled={actionLoading === borrow.borrowId}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-semibold transition-all whitespace-nowrap disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                  {actionLoading === borrow.borrowId && (
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-cyan-400" />
                  )}
                  Tạo đơn gửi trả
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Trước
          </button>
          {getPageNumbers().map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`min-w-[32px] px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                p === page
                  ? 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {p + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Sau →
          </button>
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 mt-4 rounded-2xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              Đã chọn <span className="text-cyan-400 font-semibold">{selectedIds.size}</span> đơn
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedIds(new Set()); setSelectAllOnPage(false) }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:bg-white/10 transition-all"
              >
                Bỏ chọn
              </button>
              <button
                onClick={handleBulkCreateShipment}
                disabled={bulkLoading}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {bulkLoading && <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-cyan-400" />}
                Tạo đơn hàng loạt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm border bg-slate-900/80 backdrop-blur-xl border-rose-500/30 text-rose-300">
          {error}
          <button onClick={() => setError(null)} className="ml-3 hover:text-white/80">&times;</button>
        </div>
      )}

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm border bg-slate-900/80 backdrop-blur-xl border-emerald-500/30 text-emerald-300">
          {successMsg}
          <button onClick={() => setSuccessMsg(null)} className="ml-3 hover:text-white/80">&times;</button>
        </div>
      )}
    </div>
  )
}