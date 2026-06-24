import React from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp } from 'lucide-react'

const RANK_BADGES = {
  1: { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-900', shadow: 'rgba(251,191,36,0.4)' },
  2: { bg: 'from-slate-300 to-slate-400', text: 'text-slate-900', shadow: 'rgba(148,163,184,0.3)' },
  3: { bg: 'from-amber-600 to-amber-700', text: 'text-amber-100', shadow: 'rgba(217,119,6,0.3)' }
}

const TopBooksTable = ({ books, isEmpty }) => {
  const maxBorrow = books.length > 0 ? Math.max(...books.map(b => b.borrowCount)) : 1

  if (isEmpty) {
    return (
      <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5 h-full" style={{ background: 'rgba(30,41,59,0.4)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <Star size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Top 5 Reading Stars</h2>
            <p className="text-slate-400 text-xs">Sách phổ biến nhất trong thư viện</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm">Chưa có dữ liệu</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5 h-full" style={{ background: 'rgba(30,41,59,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <Star size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Top 5 Reading Stars</h2>
          <p className="text-slate-400 text-xs">Sách phổ biến nhất trong thư viện</p>
        </div>
      </div>

      <div className="space-y-3">
        {books.map((book, idx) => {
          const badge = RANK_BADGES[book.rank] || { bg: 'from-slate-600 to-slate-700', text: 'text-slate-300', shadow: 'rgba(71,85,105,0.3)' }
          const barWidth = Math.round((book.borrowCount / maxBorrow) * 100)
          return (
            <motion.div
              key={book.bookId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="group flex items-center justify-between p-3 rounded-xl cursor-default"
              style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold bg-gradient-to-br ${badge.bg} ${badge.text} shrink-0`}
                  style={{ boxShadow: `0 2px 8px ${badge.shadow}` }}>
                  {book.rank}
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{book.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <TrendingUp size={10} className="text-cyan-500 shrink-0" />
                    <span className="text-[10px] text-slate-500">{book.borrowCount} Lượt mượn</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-16 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${barWidth}%`, boxShadow: '0 0 8px rgba(99,102,241,0.3)' }} />
                </div>
                <Star size={14} className={idx === 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default TopBooksTable
