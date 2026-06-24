import React from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, UserX } from 'lucide-react'

const miniStats = [
  { label: 'Tổng', key: 'total', color: 'text-white', icon: Users },
  { label: 'Hoạt động', key: 'active', color: 'text-emerald-400', icon: UserCheck },
  { label: 'Vô hiệu hóa', key: 'disabled', color: 'text-rose-400', icon: UserX },
]

const ReaderStatsCard = ({ readerStats, isEmpty }) => {
  if (isEmpty) {
    return (
      <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5 h-full" style={{ background: 'rgba(30,41,59,0.4)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Phân Hệ Người Dùng</h2>
            <p className="text-slate-400 text-xs">Thống kê độc giả trong hệ thống</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm">Chưa có dữ liệu</p>
      </div>
    )
  }

  const total = readerStats.totalActive + readerStats.totalDisabled
  const items = [
    { label: 'Tổng', value: total, color: 'text-white' },
    { label: 'Hoạt động', value: readerStats.totalActive, color: 'text-emerald-400' },
    { label: 'Vô hiệu hóa', value: readerStats.totalDisabled, color: 'text-rose-400' },
  ]

  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5 h-full" style={{ background: 'rgba(30,41,59,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <Users size={20} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Phân Hệ Người Dùng</h2>
          <p className="text-slate-400 text-xs">Thống kê độc giả trong hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {items.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-4 rounded-xl"
            style={{ background: 'rgba(15,23,42,0.4)' }}
          >
            <span className={`block text-xl font-black ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-tight">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative flex flex-col items-center p-5 rounded-2xl overflow-hidden cursor-default"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12), transparent)', border: '1px solid rgba(99,102,241,0.15)', boxShadow: '0 4px 24px rgba(99,102,241,0.08)' }}
        >
          <UserCheck size={22} className="text-indigo-400 mb-2" />
          <span className="text-3xl font-extrabold text-indigo-300" style={{ textShadow: '0 0 30px rgba(99,102,241,0.3)' }}>{readerStats.totalActive}</span>
          <span className="text-xs text-slate-400 mt-1 font-medium">Độc giả hoạt động</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative flex flex-col items-center p-5 rounded-2xl overflow-hidden cursor-default"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(100,116,139,0.08), transparent)', border: '1px solid rgba(100,116,139,0.15)', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
        >
          <UserX size={22} className="text-slate-400 mb-2" />
          <span className="text-3xl font-extrabold text-slate-300">{readerStats.totalDisabled}</span>
          <span className="text-xs text-slate-500 mt-1 font-medium">Độc giả vô hiệu hóa</span>
        </motion.div>
      </div>
    </div>
  )
}

export default ReaderStatsCard
