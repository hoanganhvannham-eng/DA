import React from 'react'

const highlights = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    color: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/20',
    title: 'Kho sách đa dạng',
    desc: 'Hơn 5,000 đầu sách thuộc nhiều thể loại từ văn học, khoa học đến kinh doanh và kỹ năng sống.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
    title: 'Gợi ý thông minh',
    desc: 'Gợiý sách theo tâm trạng (mood) — chọn tâm trạng, nhận gợi ý sách phù hợp ngay lập tức.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    title: 'Giao hàng tận nơi',
    desc: 'Mượn sách Online, nhận sách tại nhà — trả sách qua dịch vụ vận chuyển tiện lợi, theo dõi real-time.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
      </svg>
    ),
    color: 'from-indigo-500 to-blue-600',
    glow: 'shadow-indigo-500/20',
    title: 'Miễn phí sử dụng',
    desc: 'Tạo tài khoản hoàn toàn miễn phí, không thẻ tín dụng, không phí ẩn. Chỉ trả khi có nhu cầu đặt mượn.',
  },
]

export default function AboutSection() {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 text-cyan-400 label-cyber mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
            Về chúng tôi
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            LibraryMS —{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Thế hệ quản lý thư viện hiện đại
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Sứ mệnh của chúng tôi là mang tri thức đến mọi người thông qua nền tảng thư viện số thông minh.
            LibraryMS kết hợp công nghệ hiện đại với trải nghiệm đọc truyền thống, giúp việc mượn và trả sách
            trở nên dễ dàng hơn bao giờ hết.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="group p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-xl"
            >
              <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${h.color} shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">{h.icon}</div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{h.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
