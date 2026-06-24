import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import ForgotPasswordForm from '../components/ForgotPasswordForm'
import { authService } from '../services/authService'

/**
 * ForgotPasswordPage — trang yêu cầu đặt lại mật khẩu (UC03b Phase 1).
 *
 * Luôn hiển thị thông báo generic sau khi submit (BR-PWD-03 anti-enumeration).
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = useCallback(async (email) => {
    setIsLoading(true)
    try {
      const data = await authService.forgotPassword(email)
      setMessage(data.message)
      setSubmitted(true)
    } catch {
      // API luôn trả 200 cho forgot-password (anti-enumeration)
      // Nhưng nếu network error → vẫn hiển thị generic message
      setMessage('Nếu email hợp lệ, bạn sẽ nhận được link đặt lại mật khẩu')
      setSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-8" style={{ perspective: '1000px' }}>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-[80px] animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg shadow-cyan-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Quên mật khẩu</h1>
          <p className="text-white/40">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl">

          {submitted ? (
            /* Success state */
            <div id="forgot-password-success">
              <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-emerald-300 font-medium mb-1">Yêu cầu đã được gửi</p>
                    <p className="text-sm text-emerald-400/80">{message}</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-slate-400 mb-4">
                Vui lòng kiểm tra hộp thư email của bạn. Link có hiệu lực trong 1 giờ.
              </p>

              <Link
                to="/login"
                className="block w-full py-3 px-4 rounded-2xl font-semibold text-center text-white/60 hover:text-white bg-slate-900/60 backdrop-blur-xl border border-white/10 transition-all duration-200"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            /* Form state */
            <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
          )}

          {/* Back to login */}
          {!submitted && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[#020617] text-white/20 tracking-[0.2em] text-xs uppercase">hoặc</span>
                </div>
              </div>

              <p className="text-center text-sm text-slate-500">
                Nhớ mật khẩu?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Đăng nhập
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-white/20 text-xs">
          © {new Date().getFullYear()} Library System. Bảo mật theo chuẩn JWT.
        </p>
      </div>
    </div>
  )
}
