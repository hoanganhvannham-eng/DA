import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getBookDetail, getBookMoods, updateBookMoods } from '../services/bookService'
import { useAuth } from '../../auth/hooks/useAuth'
import BorrowModal from '../../borrow/components/BorrowModal'
import { getCoverGradientPreset } from '../utils/bookUiUtils'
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1, ease: [0.4, 0, 0.2, 1] },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
}

const BookDetailPage = () => {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, isLoggedIn } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [availableMoods, setAvailableMoods] = useState([])
  const [selectedMoodIds, setSelectedMoodIds] = useState([])
  const [moodsLoading, setMoodsLoading] = useState(false)
  const [moodsSaving, setMoodsSaving] = useState(false)
  const [moodsMessage, setMoodsMessage] = useState('')
  const [showBorrowModal, setShowBorrowModal] = useState(false)

  const loadBookDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getBookDetail(bookId)
      setBook(data)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải thông tin chi tiết sách'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [bookId])

  useEffect(() => {
    loadBookDetail()
  }, [loadBookDetail])

  useEffect(() => {
    if (searchParams.get('resumeBorrow') === 'true') {
      setShowBorrowModal(true)
      searchParams.delete('resumeBorrow')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!bookId || !isLoggedIn || (user?.role !== 'LIBRARIAN' && user?.role !== 'ADMIN')) return
    let cancelled = false
    setMoodsLoading(true)
    getBookMoods(bookId)
      .then(data => {
        if (cancelled) return
        setAvailableMoods(data.availableMoods || [])
        setSelectedMoodIds(data.currentMoodIds || [])
      })
      .catch(() => { })
      .finally(() => { if (!cancelled) setMoodsLoading(false) })
    return () => { cancelled = true }
  }, [bookId, isLoggedIn, user?.role])

  useEffect(() => {
    if (!moodsMessage) return
    const t = setTimeout(() => setMoodsMessage(''), 3500)
    return () => clearTimeout(t)
  }, [moodsMessage])

  // Helper to format dates cleanly
  const formatDate = (isoString) => {
    if (!isoString) return '-'
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return isoString
    }
  }

  // Generates a nice background gradient preset based on title length or character code
  // const getCoverGradientPreset = (title = '') => {
  //   const charCodeSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  //   const presets = [
  //     'from-indigo-600 via-indigo-800 to-slate-900',
  //     'from-emerald-600 via-teal-800 to-slate-900',
  //     'from-violet-600 via-purple-800 to-slate-900',
  //     'from-cyan-600 via-blue-800 to-slate-900',
  //     'from-rose-600 via-pink-800 to-slate-900',
  //   ]
  //   return presets[charCodeSum % presets.length]
  // }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Đang tải thông tin chi tiết sách...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-950/50 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-red-950/40">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Đã xảy ra lỗi</h2>
        <p className="text-red-400 text-sm max-w-md mb-6">{error}</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  if (!book) return null

  const coverGradient = getCoverGradientPreset(book.title)
  const isAvailable = book.availableQuantity > 0

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-10 text-white relative overflow-hidden" style={{ perspective: '1000px' }}>
      {/* Ambient Glow Blobs */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse pointer-events-none hidden md:block" />
      <div className="fixed -bottom-40 -right-40 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[80px] animate-pulse pointer-events-none hidden md:block" style={{ animationDelay: '1.5s' }} />

      <motion.div
        className="max-w-6xl mx-auto space-y-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Navigation Breadcrumb */}
        <motion.div variants={itemVariants}>
          <button
            type="button"
            onClick={() => navigate('/')}
            id="btn-back-to-list"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Quay lại
          </button>
        </motion.div>

        {/* Two Column Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left Column - Book Cover mockup */}
          <motion.div className="md:col-span-1 space-y-4" variants={itemVariants}>
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">

              {/* Book Cover */}
              <div className="relative w-44 h-64 my-4 rounded-r-xl shadow-2xl transition-all duration-300 transform group-hover:scale-[1.02] group-hover:rotate-[1deg] flex flex-col justify-between p-4 overflow-hidden"
                style={{ perspective: '1000px' }}>
                <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-black/40 to-transparent z-10" />
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                {book.imageUrl ? (
                  <img src={book.imageUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover z-0" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${coverGradient} z-0`} />
                )}

                <div className="relative z-10 flex flex-col justify-between h-full text-left">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200/80 bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">
                      {book.categoryName || 'Sách'}
                    </span>
                    <h3 className="text-white font-extrabold text-sm mt-3 line-clamp-3 leading-snug drop-shadow-md">
                      {book.title}
                    </h3>
                  </div>

                  <div>
                    <div className="w-6 h-0.5 bg-indigo-300/60 my-2" />
                    <p className="text-indigo-200 text-xs font-medium truncate drop-shadow-md">
                      {book.author}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Meta Cards */}
              <div className="w-full space-y-2 mt-4 pt-4 border-t border-slate-800/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Thể loại:</span>
                  <span className="font-semibold text-indigo-300">{book.categoryName}</span>
                </div>
                {book.isbn && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">ISBN:</span>
                    <span className="font-mono text-slate-200">{book.isbn}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Năm xuất bản:</span>
                  <span className="text-slate-200">{book.publishedYear}</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right Column - Book info details & operations */}
          <motion.div className="md:col-span-2 space-y-6" variants={itemVariants}>
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 md:p-8 space-y-6 shadow-2xl">

              {/* Title & Author */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight"
                    style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
                    {book.title}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isAvailable ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/30' : 'bg-red-950/80 text-red-400 border border-red-800/30'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    {isAvailable ? 'Có sẵn' : 'Hết sách'}
                  </span>
                </div>
                <p className="text-lg text-slate-300 font-medium">Tác giả: <span className="text-indigo-300 font-semibold">{book.author}</span></p>
              </div>

              {/* Description box */}
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mô tả sách</h2>
                <div className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {book.description || 'Chưa có thông tin mô tả chi tiết cho cuốn sách này.'}
                </div>
              </div>

              {/* Inventory details */}
              <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={itemVariants}>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Tổng số lượng</p>
                  <p className="text-2xl font-black text-slate-100">{book.availableQuantity + book.borrowedQuantity}</p>
                </div>

                <div className="bg-emerald-950/20 border-emerald-900/30 p-4 rounded-2xl text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Có sẵn</p>
                  <p className="text-2xl font-black text-emerald-300">{book.availableQuantity}</p>
                </div>

                <div className="bg-indigo-950/20 border-indigo-900/30 p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Đang được mượn</p>
                  <p className="text-2xl font-black text-indigo-300">{book.borrowedQuantity}</p>
                </div>

              </motion.div>

              {/* Dynamic Action / Information Area based on Role */}
              <motion.div variants={itemVariants} className="border-t border-white/5 pt-6 mt-4">

                {/* 1. GUEST VIEW */}
                {!isLoggedIn && (
                  <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-cyan-500/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-white font-bold text-sm">💡 Bạn muốn mượn cuốn sách này?</h4>
                      <p className="text-slate-400 text-xs mt-1">Đăng nhập tài khoản Reader của bạn để tạo đơn yêu cầu mượn sách trực tuyến.</p>
                    </div>
                    <Link
                      to={`/login?returnUrl=${encodeURIComponent(`/books/${bookId}`)}`}
                      id="btn-guest-login"
                      className="w-full sm:w-auto text-center px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-cyan-500/30"
                    >
                      Đăng nhập ngay
                    </Link>
                  </div>
                )}

                {/* 2. READER VIEW */}
                {isLoggedIn && user?.role === 'READER' && (
                  <div className="space-y-4">
                    {book.canBorrow ? (
                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">✨</span>
                          <div>
                            <h4 className="text-white font-bold text-sm">Sách đang sẵn sàng trên kệ!</h4>
                            <p className="text-slate-400 text-xs mt-0.5">Bạn có thể tạo yêu cầu mượn trực tiếp. Hạn trả mặc định là 14 ngày.</p>
                          </div>
                        </div>
                        <button
                          id="btn-borrow-book"
                          onClick={() => setShowBorrowModal(true)}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-sm transition-all active:scale-[0.99] shadow-lg shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                          Mượn sách ngay
                        </button>
                      </div>
                    ) : (
                      <div className="bg-red-950/10 border border-red-900/20 text-red-400 rounded-2xl p-4 text-sm flex items-center gap-3">
                        <span className="text-lg">❌</span>
                        <p className="font-semibold">Hiện tại đã hết sách để mượn. Vui lòng quay lại sau!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. LIBRARIAN / ADMIN VIEW */}
                {isLoggedIn && (user?.role === 'LIBRARIAN' || user?.role === 'ADMIN') && (
                  <div className="space-y-6">
                    {/* Mood Assignment */}
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-5">
                      <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                        <span>🎭</span> Gán mood cho sách
                      </h3>
                      {moodsLoading ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          Đang tải danh sách mood...
                        </div>
                      ) : availableMoods.length === 0 ? (
                        <p className="text-slate-500 text-sm">Chưa có mood nào trong hệ thống.</p>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-3">
                            {availableMoods.map((mood) => {
                              const checked = selectedMoodIds.includes(mood.id)
                              return (
                                <label
                                  key={mood.id}
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm ${checked
                                      ? 'bg-indigo-900/40 border-indigo-500 text-indigo-200'
                                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      setSelectedMoodIds(prev =>
                                        checked
                                          ? prev.filter(id => id !== mood.id)
                                          : [...prev, mood.id]
                                      )
                                    }}
                                    className="sr-only"
                                  />
                                  <span className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${checked ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'
                                    }`}>
                                    {checked && (
                                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                    )}
                                  </span>
                                  {mood.name}
                                </label>
                              )
                            })}
                          </div>
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              id="btn-save-moods"
                              onClick={async () => {
                                try {
                                  setMoodsSaving(true)
                                  setMoodsMessage('')
                                  await updateBookMoods(bookId, selectedMoodIds)
                                  setMoodsMessage('Cập nhật mood thành công')
                                } catch (err) {
                                  const msg = err.response?.data?.message || 'Cập nhật mood thất bại'
                                  setMoodsMessage(msg)
                                } finally {
                                  setMoodsSaving(false)
                                }
                              }}
                              disabled={moodsSaving}
                              className="px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
                            >
                              {moodsSaving ? 'Đang lưu...' : 'Lưu mood'}
                            </button>
                            {moodsMessage && (
                              <span className={`text-xs font-medium ${moodsMessage.includes('thành công') ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {moodsMessage}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Borrow History */}
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>📋</span> Lịch sử mượn sách
                    </h3>

                    {(!book.borrowHistory || book.borrowHistory.length === 0) ? (
                      <div className="bg-slate-900/30 rounded-[2rem] p-8 text-center text-slate-500">
                        <p className="text-2xl mb-2">📖</p>
                        <p className="text-sm font-medium">Chưa có lượt mượn nào cho sách này.</p>
                      </div>
                    ) : (
                      <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden shadow-inner">
                        <div className="overflow-x-auto max-h-[300px]">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-widest">
                                <th className="px-4 py-3">Người mượn</th>
                                <th className="px-4 py-3 text-center">Ngày mượn</th>
                                <th className="px-4 py-3 text-center">Hạn trả</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {book.borrowHistory.map((item, index) => (
                                <tr key={index} className="hover:bg-white/[0.03] transition-colors">
                                  <td className="px-4 py-3 font-semibold text-slate-200">{item.readerName}</td>
                                  <td className="px-4 py-3 text-center text-slate-400 font-mono text-xs">{formatDate(item.borrowDate)}</td>
                                  <td className="px-4 py-3 text-center text-slate-400 font-mono text-xs">{formatDate(item.dueDate)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

              </motion.div>

            </div>
          </motion.div>

        </div>

        {/* Borrow Modal */}
        {showBorrowModal && (
          <BorrowModal
            bookId={bookId}
            bookTitle={book.title}
            replacementPrice={book.replacementPrice}
            depositPolicyId={book.depositPolicyId}
            customDepositRate={book.customDepositRate}
            onClose={() => {
              setShowBorrowModal(false)
              loadBookDetail()
            }}
          />
        )}

        {/* TraceId for correlation and debug info */}
        {book.traceId && (
          <motion.div variants={itemVariants} className="flex justify-center pt-8 border-t border-white/5">
            <span className="text-[10px] font-mono text-slate-600 bg-slate-900/20 px-3 py-1 rounded-full select-all">
              Trace ID: {book.traceId}
            </span>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}

export default BookDetailPage
