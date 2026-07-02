import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../features/auth/hooks/useAuth'
// 8
export default function CtaSection() {
  const { isLoggedIn } = useAuth()

  if (isLoggedIn) return null

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-600/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative bg-slate-900/60 backdrop-blur-xl p-8 sm:p-16 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="text-5xl mb-6">📚</div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5">
            Sẵn sàng khám phá
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent block text-glow-cyan">
              thế giới sách?
            </span>
          </h2>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-10">
            Tạo tài khoản miễn phí ngay hôm nay và bắt đầu hành trình đọc sách của bạn với hơn 5,000 đầu sách đang chờ.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              id="cta-register-btn"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60 transition-all duration-300 hover:-translate-y-0.5 text-lg"
            >
              Đăng ký miễn phí ngay
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <p className="mt-6 text-slate-500 text-sm">
            Không cần thẻ tín dụng · Miễn phí hoàn toàn · Kích hoạt ngay qua email
          </p>
        </div>
      </div>
    </section>
  )
} 