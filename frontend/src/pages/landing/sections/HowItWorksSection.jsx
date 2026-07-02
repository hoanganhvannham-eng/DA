import React from 'react'
// 5
const steps = [
  {
    step: '01',
    color: 'from-indigo-500 to-blue-600',
    glow: 'shadow-indigo-500/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: 'Đăng ký tài khoản',
    desc: 'Tạo tài khoản miễn phí bằng email. Xác nhận qua link gửi đến hộp thư trong vài giây.',
  },
  {
    step: '02',
    color: 'from-purple-500 to-violet-600',
    glow: 'shadow-purple-500/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
      </svg>
    ),
    title: 'Nạp tiền vào ví',
    desc: 'Nạp tiền qua Mock Payment Gateway. Không bắt buộc — chỉ cần nạp khi muốn đặt chỗ mượn sách.',
  },
  {
    step: '03',
    color: 'from-cyan-500 to-teal-600',
    glow: 'shadow-cyan-500/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    title: 'Tìm kiếm sách',
    desc: 'Tìm theo tên, tác giả, thể loại. Hoặc chọn theo mood để nhận gợi ý thông minh từ AI.',
  },
  {
    step: '04',
    color: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Chọn & Đặt mượn',
    desc: 'Chọn thời hạn (1-30 ngày) và hình thức nhận: tại thư viện hoặc giao tận nhà.',
  },
  {
    step: '05',
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Xác nhận & Thanh toán',
    desc: 'Xác nhận yêu cầu mượn. Tiền đặt cọc được giữ qua ví, hoàn trả khi trả sách đúng hạn.',
  },
  {
    step: '06',
    color: 'from-orange-500 to-amber-600',
    glow: 'shadow-orange-500/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h16.5M3.75 4.5l3 3m-3-3-3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Nhận sách',
    desc: 'Quét mã QR tại thư viện hoặc nhận sách qua vận chuyển giao tận nơi theo địa chỉ đã đăng ký.',
  },
  {
    step: '07',
    color: 'from-violet-500 to-fuchsia-600',
    glow: 'shadow-violet-500/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Đọc & Gia hạn',
    desc: 'Đọc thảnh thơi trong thời hạn mượn. Gia hạn thêm 7 ngày trước khi hết hạn nếu cần.',
  },
  {
    step: '08',
    color: 'from-sky-500 to-indigo-600',
    glow: 'shadow-sky-500/30',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
      </svg>
    ),
    title: 'Trả sách',
    desc: 'Trả tại quầy thư viện hoặc gửi qua dịch vụ vận chuyển. Tiền cọc được hoàn lại vào ví.',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 text-cyan-400 label-cyber mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            Đơn giản & Nhanh chóng
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Mượn sách chỉ với{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">8 bước đơn giản</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Từ đăng ký đến nhận sách — mọi thứ đều được thiết kế trực quan và dễ dàng.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[6.25%] right-[6.25%] h-px bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 via-violet-500/30 to-cyan-500/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center text-center group">
                {/* Step circle */}
                <div className={`relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-xl ${step.glow} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                  <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${step.color} border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
