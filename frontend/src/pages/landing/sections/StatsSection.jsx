import React from 'react'

const stats = [
  { value: '5,000+', label: 'Đầu sách', icon: '📚' },
  { value: '1,200+', label: 'Độc giả', icon: '👥' },
  { value: '98%', label: 'Hài lòng', icon: '⭐' },
  { value: '24h', label: 'Hỗ trợ', icon: '🕐' },
]

export default function StatsSection() {
  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-cyan-500/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center glass-analytic p-6 hover:border-cyan-500/30 hover:bg-white/[0.08] transition-all duration-300 group"
              style={{ transform: 'perspective(1000px) translateZ(0)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'perspective(1000px) translateZ(20px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'perspective(1000px) translateZ(0)' }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-black mb-1 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-white/40 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
