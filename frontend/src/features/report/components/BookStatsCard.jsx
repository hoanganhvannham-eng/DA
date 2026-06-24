import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const NEON_COLORS = { cyan: '#22d3ee', emerald: '#10b981', rose: '#f43f5e', amber: '#fbbf24', indigo: '#6366f1' }
const CHART_COLORS = [NEON_COLORS.emerald, NEON_COLORS.amber, NEON_COLORS.rose, NEON_COLORS.indigo]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl p-3 rounded-xl border border-white/10 shadow-xl">
        <p className="text-white text-sm font-bold mb-1">{payload[0].name}</p>
        <p className="text-slate-300 text-xs">{payload[0].value} bản</p>
      </div>
    )
  }
  return null
}

const StatCard = ({ title, value, icon: Icon, color, delay }) => {
  const colorMap = { cyan: 'text-cyan-400', emerald: 'text-emerald-400', rose: 'text-rose-400', amber: 'text-amber-400', indigo: 'text-indigo-400' }
  const glowMap = { cyan: 'rgba(34,211,238,0.15)', emerald: 'rgba(16,185,129,0.15)', rose: 'rgba(244,63,94,0.15)', amber: 'rgba(251,191,36,0.15)', indigo: 'rgba(99,102,241,0.15)' }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative flex flex-col items-center p-4 rounded-2xl backdrop-blur-xl overflow-hidden cursor-default border border-white/5"
      style={{ background: 'rgba(30,41,59,0.4)', boxShadow: `0 4px 24px ${glowMap[color]}, inset 0 1px 0 rgba(255,255,255,0.05)` }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 blur-[60px] rounded-full -mr-10 -mt-10 opacity-20"
        style={{ background: glowMap[color].replace('0.15', '0.3').replace(')', ')').replace('rgba', '') }} />
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-white/5 backdrop-blur-sm">
        <Icon size={18} className={colorMap[color]} />
      </div>
      <span className={`text-2xl font-extrabold text-white tracking-tight`}>{value}</span>
      <span className="text-xs text-slate-400 mt-1 font-medium">{title}</span>
    </motion.div>
  )
}

const BookStatsCard = ({ bookStats, isEmpty }) => {
  if (isEmpty) {
    return (
      <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5" style={{ background: 'rgba(30,41,59,0.4)' }}>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Thống kê sách</h3>
        <p className="text-slate-500 text-sm">Chưa có dữ liệu</p>
      </div>
    )
  }

  const total = bookStats.totalAvailable + bookStats.totalBorrowed + bookStats.totalLost + bookStats.totalDamaged
  const chartData = [
    { name: 'Có sẵn', value: bookStats.totalAvailable },
    { name: 'Đang mượn', value: bookStats.totalBorrowed },
    { name: 'Bị mất', value: bookStats.totalLost },
    { name: 'Hư hỏng', value: bookStats.totalDamaged },
  ].filter(d => d.value > 0)

  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5" style={{ background: 'rgba(30,41,59,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <BookOpen size={20} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Thư Viện Ảnh</h2>
          <p className="text-slate-400 text-xs">Tổng quan về nguồn tài nguyên sách hiện tại</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard title="Tổng Số Sách" value={total.toLocaleString()} icon={BookOpen} color="cyan" delay={1} />
        <StatCard title="Có Sẵn" value={bookStats.totalAvailable} icon={CheckCircle} color="emerald" delay={2} />
        <StatCard title="Đang Mượn" value={bookStats.totalBorrowed} icon={Clock} color="amber" delay={3} />
        <StatCard title="Bị Mất" value={bookStats.totalLost} icon={XCircle} color="rose" delay={4} />
        <StatCard title="Hư Hỏng" value={bookStats.totalDamaged} icon={AlertTriangle} color="indigo" delay={5} />
      </div>

      {chartData.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(15,23,42,0.4)' }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Phân Bố Trạng Thái</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="rgba(255,255,255,0.05)">
                {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={30}
                formatter={value => <span className="text-slate-400 text-xs">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default BookStatsCard
