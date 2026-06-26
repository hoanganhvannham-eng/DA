import React from 'react'
import { Link } from 'react-router-dom'
import { getCoverGradientPreset } from '../utils/bookUiUtils'

/**
 * Lưới hiển thị danh sách sách (ảnh bìa, tên, tác giả, số lượng còn).
 * Dùng chung cho cả trang chủ (khách xem) và trang quản lý (nhân viên).
 *
 * Props:
 * - books: danh sách sách
 * - loading: đang tải dữ liệu
 * - error: thông báo lỗi (nếu có)
 * - onRetry: callback khi bấm "Thử lại"
 * - emptyMessage: thông báo khi danh sách rỗng (tùy chọn, có default)
 * - showAdminActions: hiện nút Sửa/Xóa hay không (mặc định false = chế độ khách)
 * - onEdit: callback khi bấm Sửa (chỉ dùng khi showAdminActions = true)
 * - onDelete: callback khi bấm Xóa (chỉ dùng khi showAdminActions = true)
 */
const BookGrid = ({
  books = [],
  loading = false,
  error = null,
  onRetry,
  emptyMessage = 'Chưa có sách nào trong hệ thống.',
  showAdminActions = false,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Đang tải danh sách sách...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-rose-400 text-sm">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:bg-white/[0.04] text-sm transition-all duration-300"
          >
            Thử lại
          </button>
        )}
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <span className="text-4xl mb-3">📚</span>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {books.map((book) => (
        <div key={book.id} className="flex flex-col items-center">
          <Link
            to={`/books/${book.id}`}
            id={`book-title-${book.id}`}
            className="relative w-44 h-64 rounded-xl overflow-hidden shadow-2xl group hover:scale-[1.03] hover:shadow-cyan-500/20 transition-all duration-300"
          >
            {book.imageUrl ? (
              <img src={book.imageUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${getCoverGradientPreset(book.title)}`} />
            )}
            <div className="absolute top-0 left-[3px] w-[3px] h-full bg-gradient-to-r from-black/40 to-transparent z-10" />
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full p-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/80 bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
                  {book.categoryName}
                </span>
              </div>
              <div>
                <h3 className="text-white font-extrabold text-sm leading-snug line-clamp-3 drop-shadow-md">
                  {book.title}
                </h3>
                <div className="w-6 h-0.5 bg-white/30 my-2" />
                <p className="text-white/70 text-xs font-medium truncate drop-shadow-md">
                  {book.author}
                </p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-bold ${book.availableQuantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {book.availableQuantity} có sẵn
            </span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/40">{book.borrowedQuantity} mượn</span>
          </div>
          {showAdminActions && (
            <div className="flex gap-2 mt-2">
              <button
                id={`btn-edit-${book.id}`}
                onClick={() => onEdit?.(book)}
                className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-xs font-semibold transition-all duration-300"
              >
                Sửa
              </button>
              <button
                id={`btn-delete-${book.id}`}
                onClick={() => onDelete?.(book)}
                className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold transition-all duration-300"
              >
                Xóa
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default BookGrid