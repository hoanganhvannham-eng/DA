import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const NEON_COLORS = { cyan: '#22d3ee', emerald: '#10b981', rose: '#f43f5e', amber: '#fbbf24', indigo: '#6366f1' }

const formatVND = (value) => value.toLocaleString() + ' đ'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl p-3 rounded-xl border border-white/10 shadow-xl">
        <p className="text-white text-sm font-bold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="text-white font-mono">{formatVND(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const StatCard = ({ title, value, icon: Icon, color, delay }) => {
  const colorMap = { indigo: 'text-indigo-400', emerald: 'text-emerald-400', rose: 'text-rose-400', amber: 'text-amber-400' }
  const glowMap = { indigo: 'rgba(99,102,241,0.15)', emerald: 'rgba(16,185,129,0.15)', rose: 'rgba(244,63,94,0.15)', amber: 'rgba(251,191,36,0.15)' }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative flex flex-col items-center p-4 rounded-2xl backdrop-blur-xl overflow-hidden cursor-default border border-white/5"
      style={{ background: 'rgba(30,41,59,0.4)', boxShadow: `0 4px 24px ${glowMap[color]}, inset 0 1px 0 rgba(255,255,255,0.05)` }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-white/5 backdrop-blur-sm">
        <Icon size={18} className={colorMap[color]} />
      </div>
      <span className="text-2xl font-extrabold text-white tracking-tight">{formatVND(value)}</span>
      <span className="text-xs text-slate-400 mt-1 font-medium">{title}</span>
    </motion.div>
  )
}

const FineStatsCard = ({ fineStats, isEmpty }) => {
  if (isEmpty) {
    return (
      <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5" style={{ background: 'rgba(30,41,59,0.4)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <DollarSign size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Đo Lường Doanh Thu</h2>
            <p className="text-slate-400 text-xs">Phân tích dữ liệu xử lý vi phạm trong hệ thống</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm">Chưa có dữ liệu</p>
      </div>
    )
  }

  const statCards = [
    { title: 'Tổng Phạt', value: fineStats.currentMonthTotal, icon: DollarSign, color: 'indigo', delay: 1 },
    { title: 'Đã Thu', value: fineStats.currentMonthPaid, icon: CheckCircle, color: 'emerald', delay: 2 },
    { title: 'Chưa Thu', value: fineStats.currentMonthUnpaid, icon: XCircle, color: 'rose', delay: 3 },
    { title: 'Chờ Xác Nhận', value: fineStats.currentMonthPending, icon: Clock, color: 'amber', delay: 4 },
  ]

  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl border border-white/5" style={{ background: 'rgba(30,41,59,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <DollarSign size={20} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Đo Lường Doanh Thu</h2>
          <p className="text-slate-400 text-xs">Phân tích dữ liệu xử lý vi phạm trong hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map(card => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {fineStats.last6MonthsTrend && fineStats.last6MonthsTrend.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(15,23,42,0.4)' }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Xu Hướng Tài Chính (6 Tháng)</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fineStats.last6MonthsTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>} />
              <Line type="monotone" dataKey="total" name="Tổng Phạt" stroke={NEON_COLORS.indigo} strokeWidth={3} dot={{ r: 3, stroke: NEON_COLORS.indigo, strokeWidth: 2, fill: '#020617' }} activeDot={{ r: 6, strokeWidth: 0, fill: NEON_COLORS.cyan }} />
              <Line type="monotone" dataKey="paid" name="Đã Thu" stroke={NEON_COLORS.emerald} strokeWidth={3} dot={{ r: 3, stroke: NEON_COLORS.emerald, strokeWidth: 2, fill: '#020617' }} activeDot={{ r: 6, strokeWidth: 0, fill: NEON_COLORS.emerald }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default FineStatsCard
