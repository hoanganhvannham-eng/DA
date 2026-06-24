import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <span className="font-bold text-lg text-white">LibraryMS</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Hệ thống quản lý thư viện hiện đại — giúp bạn tìm kiếm, mượn và trả sách mọi lúc mọi nơi.
            </p>
          </div>

          {/* Chức năng */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-4">Chức năng</h4>
            <ul className="space-y-2">
              {['Tìm kiếm sách', 'Mượn & Trả sách', 'Gợi ý theo Mood', 'Quản lý phạt'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-white/40 hover:text-cyan-400 transition-colors cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pháp lý */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-4">Pháp lý</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-white/40 hover:text-cyan-400 transition-colors">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-white/40 hover:text-cyan-400 transition-colors">Chính sách bảo mật</Link>
              </li>
              <li>
                <a href="#contact" className="text-sm text-white/40 hover:text-cyan-400 transition-colors">Liên hệ</a>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-4">Bắt đầu ngay</h4>
            <p className="text-slate-500 text-sm mb-4">Tạo tài khoản miễn phí và khám phá kho sách phong phú.</p>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25">
              Đăng ký miễn phí
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/50 text-center text-slate-600 text-sm">
          © 2026 LibraryMS. Hệ thống quản lý thư viện.
        </div>
      </div>
    </footer>
  )
}
