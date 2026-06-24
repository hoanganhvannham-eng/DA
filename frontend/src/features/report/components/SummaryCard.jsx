import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const CONFIG = {
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/10' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'shadow-violet-500/10' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'shadow-rose-500/10' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-amber-500/10' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/10' },
}

const SummaryCard = ({ title, value, icon, color = 'cyan', variant, trend }) => {
  const c = CONFIG[color]

  return (
    <motion.div
      variants={variant}
      whileHover={{ y: -5, scale: 1.02, rotateX: 5, rotateY: -5 }}
      className={`bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border ${c.border} shadow-lg ${c.glow} relative overflow-hidden group transition-all duration-300`}
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${c.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />

      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${c.bg} ${c.text}`}>
          {icon && React.isValidElement(icon) ? React.cloneElement(icon, { className: 'w-5 h-5' }) : <TrendingUp className="w-5 h-5" />}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>

      <p className="text-white/40 text-xs  font-bold uppercase tracking-widest mb-1">{title}</p>
      <div className={`text-2xl  font-black ${c.text} tracking-tight`}>
        {value}
      </div>
    </motion.div>
  )
}

export default SummaryCard
