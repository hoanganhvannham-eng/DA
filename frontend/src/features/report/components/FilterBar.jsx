import { Calendar, Filter } from 'lucide-react'

const RANGES = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
  { key: 'quarter', label: 'Quý này' },
  { key: 'year', label: 'Năm này' },
  { key: 'custom', label: 'Tùy chọn' },
]

const FilterBar = ({ activeTab, filters, onFilterChange, categories }) => {
  const handleRangeClick = (range) => {
    onFilterChange({ ...filters, dateRange: range })
  }

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="bg-slate-900/60 backdrop-blur-xl p-1.5 rounded-2xl flex gap-1">
        {RANGES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleRangeClick(key)}
            className={`px-5 py-2.5 rounded-xl text-xs  font-bold uppercase transition-all duration-300 ${
              filters.dateRange === key
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 glow-cyan'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="h-10 w-[1px] bg-white/10 hidden xl:block" />

      <div className="flex items-center gap-3">
        <div className="relative group">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <input
            type="date"
            className="pl-11 pr-4 py-3 bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all w-44"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value, dateRange: 'custom' })}
          />
        </div>
        <span className="text-white/20">→</span>
        <div className="relative group">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <input
            type="date"
            className="pl-11 pr-4 py-3 bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all w-44"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value, dateRange: 'custom' })}
          />
        </div>
      </div>

      {activeTab === 'BOOK' && (
        <div className="relative group min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 group-hover:rotate-12 transition-transform" />
          <select
            className="appearance-none pl-11 pr-10 py-3 bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/5 text-sm text-white focus:border-violet-500/50 outline-none transition-all w-full cursor-pointer"
            value={filters.categoryId}
            onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value })}
          >
            <option value="" className="bg-[#0f172a]">Tất cả thể loại</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default FilterBar
