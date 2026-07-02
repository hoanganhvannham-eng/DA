import React, { useRef, useEffect } from 'react'
// 3
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    color: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/20',
    glowColor: 'rgba(6,182,212,0.2)',
    title: 'Tìm kiếm thông minh',
    desc: 'Tìm sách theo tên, tác giả, thể loại với tốc độ tức thì. Lọc và sắp xếp kết quả theo ý muốn.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    color: 'from-indigo-500 to-purple-500',
    glow: 'shadow-indigo-500/20',
    glowColor: 'rgba(99,102,241,0.2)',
    title: 'Mượn & Trả dễ dàng',
    desc: 'Đặt mượn online, nhận tại thư viện hoặc giao tận nhà. Gia hạn 1 lần không cần đến trực tiếp.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
    color: 'from-pink-500 to-rose-500',
    glow: 'shadow-pink-500/20',
    glowColor: 'rgba(236,72,153,0.2)',
    title: 'Gợi ý theo Mood',
    desc: 'Chọn tâm trạng — Stress, Cần tập trung, Muốn khám phá — hệ thống gợi ý sách phù hợp ngay lập tức.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
    glowColor: 'rgba(16,185,129,0.2)',
    title: 'Giao hàng tận nơi',
    desc: 'Mượn và trả sách qua dịch vụ vận chuyển. Theo dõi trạng thái đơn hàng real-time với mã tracking.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
    color: 'from-orange-500 to-amber-500',
    glow: 'shadow-orange-500/20',
    glowColor: 'rgba(249,115,22,0.2)',
    title: 'Quản lý phạt minh bạch',
    desc: 'Xem phiếu phạt trả muộn, hư hỏng rõ ràng. Thanh toán online với bằng chứng minh bạch.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    color: 'from-violet-500 to-fuchsia-500',
    glow: 'shadow-violet-500/20',
    glowColor: 'rgba(139,92,246,0.2)',
    title: 'Báo cáo & Thống kê',
    desc: 'Dashboard tổng quan cho quản lý. Xuất báo cáo CSV theo ngày, tháng, quý với số liệu chi tiết.',
  },
]

export default function FeaturesSection() {
  const cardRefs = useRef([])

  useEffect(() => {
    const refs = cardRefs.current
    const handleMouseMove = (e, card) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) scale(1.02)`
    }
    const handleMouseLeave = (card) => {
      card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)'
    }
    refs.forEach((card) => {
      if (!card) return
      card.addEventListener('mousemove', (e) => handleMouseMove(e, card))
      card.addEventListener('mouseleave', () => handleMouseLeave(card))
    })
    return () => {
      refs.forEach((card) => {
        if (!card) return
        card.removeEventListener('mousemove', (e) => handleMouseMove(e, card))
        card.removeEventListener('mouseleave', () => handleMouseLeave(card))
      })
    }
  }, [])

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 text-cyan-400 label-cyber mb-5">
            ✨ Đầy đủ tính năng
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Mọi thứ bạn cần trong
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent"> một nền tảng</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Từ tìm kiếm, mượn trả đến quản lý phạt — tất cả được thiết kế để trải nghiệm mượt mà nhất.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              ref={(el) => { cardRefs.current[i] = el }}
              className={`group relative p-6 glass-analytic hover:border-cyan-500/30 transition-all duration-300 hover:shadow-xl ${f.glow}`}
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 blur-2xl rounded-full opacity-40 group-hover:opacity-70 group-hover:scale-150 transition-all duration-300" style={{ backgroundColor: f.glowColor }} />
              <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${f.color} shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">{f.icon}</div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
