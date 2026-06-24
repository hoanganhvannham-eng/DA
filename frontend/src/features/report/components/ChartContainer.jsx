import React from 'react'
import { motion } from 'framer-motion'

const GRADIENTS = [
  { id: 'cyanGrad', color: '#22d3ee' },
  { id: 'violetGrad', color: '#8b5cf6' },
  { id: 'emeraldGrad', color: '#10b981' },
  { id: 'roseGrad', color: '#f43f5e' },
]

export const ChartGradients = () => (
  <defs>
    {GRADIENTS.map((g) => (
      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={g.color} stopOpacity={0.6} />
        <stop offset="100%" stopColor={g.color} stopOpacity={0} />
      </linearGradient>
    ))}
  </defs>
)

export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-2xl p-4 rounded-xl border border-white/10 shadow-2xl">
        <p className="text-white font-medium mb-1 ">{label}</p>
        {payload.map((pld, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }} />
            <span className="text-white/60">{pld.name}:</span>
            <span className="text-white font-mono">{typeof pld.value === 'number' ? pld.value.toLocaleString() : pld.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const ChartContainer = ({ title, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />
    <h3 className="text-xl font-bold mb-8 flex items-center gap-3" style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
      <div className="p-2 bg-cyan-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      {title}
    </h3>
    <div className="h-[350px] w-full">
      {children}
    </div>
  </motion.div>
)

export default ChartContainer
