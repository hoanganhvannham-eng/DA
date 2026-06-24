import React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

const TodayBorrowsCard = ({ count, isEmpty }) => {
  if (isEmpty) {
    return (
      <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5 h-full" style={{ background: 'rgba(30,41,59,0.4)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <Inbox size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Hoạt Động Hôm Nay</h2>
            <p className="text-slate-400 text-xs">Đơn mượn được tạo trong ngày</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm">Chưa có dữ liệu</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5 h-full" style={{ background: 'rgba(30,41,59,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <Inbox size={20} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Hoạt Động Hôm Nay</h2>
          <p className="text-slate-400 text-xs">Đơn mượn được tạo trong ngày</p>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
        className="flex flex-col items-center py-6"
      >
        <div className="relative">
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className="text-6xl md:text-7xl font-black tracking-tight text-cyan-300"
            style={{ textShadow: '0 0 30px rgba(6,182,212,0.4), 0 4px 8px rgba(0,0,0,0.3)' }}
          >
            {count}
          </motion.span>
          <div className="absolute -inset-4 bg-cyan-400/5 blur-2xl rounded-full" />
        </div>
        <span className="text-sm text-cyan-200/60 mt-2 font-medium">đơn mượn mới</span>
        <div className="w-16 h-0.5 mt-4 rounded-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      </motion.div>
    </div>
  )
}

export default TodayBorrowsCard
