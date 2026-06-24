import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, BookOpen, CheckCircle } from 'lucide-react'

const getSeverity = days => {
  if (days >= 30) return { color: 'text-red-400', bg: 'bg-red-500/10', badge: 'bg-red-500 text-white', bar: 'from-red-500 to-rose-600', glow: 'rgba(239,68,68,0.4)', pulse: true, label: 'Nghiêm trọng' }
  if (days >= 14) return { color: 'text-orange-400', bg: 'bg-orange-500/10', badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', bar: 'from-orange-500 to-amber-600', glow: 'rgba(249,115,22,0.3)', pulse: false, label: 'Cảnh báo' }
  return { color: 'text-amber-400', bg: 'bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', bar: 'from-amber-500 to-yellow-600', glow: 'rgba(245,158,11,0.2)', pulse: false, label: 'Nhẹ' }
}

const OverdueReadersTable = ({ readers, isEmpty }) => {
  const totalOverdue = readers.length
  const maxDays = readers.length > 0 ? Math.max(...readers.map(r => r.maxOverdueDays)) : 1

  if (isEmpty || totalOverdue === 0) {
    return (
      <div className="rounded-2xl p-6 backdrop-blur-xl h-full" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(239,68,68,0.1)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Độc Giả Cảnh Báo</h2>
            <p className="text-slate-400 text-xs">Độc giả có sách quá hạn</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-emerald-400 opacity-60">
          <CheckCircle size={40} className="mb-3" />
          <p className="font-bold text-sm">An toàn, không có nợ quá hạn</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl h-full" style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(239,68,68,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <AlertTriangle size={20} className="text-rose-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Độc Giả Cảnh Báo ({totalOverdue})</h2>
          <p className="text-slate-400 text-xs">Độc giả có sách quá hạn</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {readers.map((reader, idx) => {
          const sev = getSeverity(reader.maxOverdueDays)
          const barWidth = Math.round((reader.maxOverdueDays / maxDays) * 100)
          return (
            <motion.div
              key={reader.readerId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ scale: 1.01, x: 2 }}
              className="group p-4 rounded-xl cursor-default"
              style={{
                background: sev.pulse ? 'rgba(239,68,68,0.05)' : 'rgba(15,23,42,0.4)',
                border: `1px solid ${sev.pulse ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)'}`
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{reader.readerName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <BookOpen size={10} className="text-cyan-400 shrink-0" />
                    <span className="text-[10px] text-slate-500">{reader.overdueCount} sách quá hạn</span>
                  </div>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sev.badge}`}
                  style={sev.pulse ? { animation: 'glowPulse 2s ease-in-out infinite' } : {}}>
                  +{reader.maxOverdueDays} Ngày
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-700/30 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${sev.bar} transition-all duration-700`}
                    style={{ width: `${barWidth}%`, boxShadow: `0 0 6px ${sev.glow}` }} />
                </div>
                <span className={`text-[10px] font-semibold ${sev.color} w-14 text-right`}>{sev.label}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default OverdueReadersTable
