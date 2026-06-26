import React from 'react'

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Tên A-Z' },
  { value: 'newest_year', label: 'Mới nhất' },
  { value: 'most_popular', label: 'Phổ biến nhất' },
]

/**
 * Khối UI lọc/tìm kiếm sách: ô tìm kiếm + dropdown thể loại + dropdown sắp xếp.
 * Component này KHÔNG tự gọi API — chỉ nhận state hiện tại qua props
 * và báo lại cho component cha qua các callback khi người dùng thay đổi.
 *
 * Props:
 * - searchInput: giá trị đang gõ trong ô tìm kiếm (chưa submit)
 * - onSearchInputChange(value): khi gõ vào ô tìm kiếm
 * - onSearchSubmit(): khi submit form tìm kiếm (bấm "Tìm" hoặc Enter)
 * - searchActive: có đang áp dụng search hay không (để hiện nút ✕ xóa tìm kiếm)
 * - onClearSearch(): khi bấm ✕ xóa tìm kiếm
 * - categoryFilter: id thể loại đang chọn
 * - categories: danh sách thể loại [{ id, name }]
 * - onCategoryChange(value): khi đổi dropdown thể loại
 * - sort: giá trị sắp xếp đang chọn
 * - onSortChange(value): khi đổi dropdown sắp xếp
 */
const BookFilters = ({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  searchActive = false,
  onClearSearch,
  categoryFilter,
  categories = [],
  onCategoryChange,
  sort,
  onSortChange,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearchSubmit?.()
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-4 flex flex-wrap gap-3">
      <form onSubmit={handleSubmit} className="flex gap-2 flex-1 min-w-56">
        <input
          id="search-input"
          type="text"
          value={searchInput}
          onChange={e => onSearchInputChange?.(e.target.value)}
          placeholder="Tìm theo tên sách, tác giả..."
          className="flex-1 px-3 py-2 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-2xl bg-cyan-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all duration-300"
        >
          Tìm
        </button>
        {searchActive && (
          <button
            type="button"
            onClick={onClearSearch}
            className="px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-sm transition-all duration-300"
          >
            ✕
          </button>
        )}
      </form>

      <select
        id="category-filter"
        value={categoryFilter}
        onChange={e => onCategoryChange?.(e.target.value)}
        className="px-3 py-2 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300"
      >
        <option className="bg-slate-900" value="">-- Tất cả thể loại --</option>
        {categories.map(c => (
          <option className="bg-slate-900" key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        id="sort-select"
        value={sort}
        onChange={e => onSortChange?.(e.target.value)}
        className="px-3 py-2 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300"
      >
        {SORT_OPTIONS.map(o => (
          <option className="bg-slate-900" key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export default BookFilters