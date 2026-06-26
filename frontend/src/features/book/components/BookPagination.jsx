import React from 'react'

/**
 * Thanh phân trang: hiển thị tổng số sách + nút Trước/Sau + "Trang X / Y".
 * Component cha quyết định khi nào ẩn/hiện (ví dụ: chỉ hiện khi totalPages > 1).
 *
 * Props:
 * - page: trang hiện tại
 * - totalPages: tổng số trang
 * - totalItems: tổng số sách (hiển thị bên trái)
 * - onPageChange(newPage): callback khi đổi trang
 */
const BookPagination = ({ page, totalPages, totalItems, onPageChange }) => {
  const handlePrev = () => onPageChange?.(Math.max(1, page - 1))
  const handleNext = () => onPageChange?.(Math.min(totalPages, page + 1))

  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-white/40 text-xs">
        Tổng: <span className="text-white font-semibold">{totalItems}</span> sách
      </p>
      <div className="flex gap-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-all duration-300"
        >
          ← Trước
        </button>
        <span className="px-3 py-1.5 text-white/40 text-xs">
          Trang <span className="text-cyan-400 font-bold">{page}</span> / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-all duration-300"
        >
          Sau →
        </button>
      </div>
    </div>
  )
}

export default BookPagination