import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'
import { authService } from '../services/authService'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || ''
  const [isLoading, setIsLoading] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [devActivating, setDevActivating] = useState(false)
  const [devMessage, setDevMessage] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    setServerErrors({})
    setGlobalError('')

    try {
      await authService.register(formData)
      setRegisteredEmail(formData.email)
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      if (data?.code === 'VALIDATION_FAILED' && data?.errors) {
        const fieldErrors = {}
        data.errors.forEach((e) => { fieldErrors[e.field] = e.message })
        setServerErrors(fieldErrors)
      } else if (data?.message) {
        setGlobalError(data.message)
      } else {
        setGlobalError('Đã xảy ra lỗi. Vui lòng thử lại sau')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await authService.resendVerification(registeredEmail)
      setGlobalError('')
    } catch {
      // Anti-enumeration: ignore errors
    }
  }

  // [DEV ONLY] — Chỉ hiển thị khi Vite chạy ở chế độ development (npm run dev)
  const handleDevActivate = async () => {
    setDevActivating(true)
    setDevMessage('')
    try {
      await authService.devActivateAccount(registeredEmail)
      setDevMessage('✓ Kích hoạt thành công! Đang chuyển hướng...')
      setTimeout(() => navigate(`/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`), 1200)
    } catch (err) {
      setDevMessage('✗ ' + (err.response?.data?.message || 'Lỗi kích hoạt'))
    } finally {
      setDevActivating(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-8 lg:py-12 relative overflow-hidden" style={{ perspective: '1000px' }} onMouseMove={handleMouseMove}>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Ambient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse opacity-[0.08]" style={{ transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 20}px)` }} />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px] animate-pulse opacity-[0.08]" style={{ transform: `translate(${(mousePos.x - 0.5) * -15}px, ${(mousePos.y - 0.5) * -15}px)`, animationDelay: '-4s' }} />
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-[80px] animate-pulse opacity-[0.08]" style={{ transform: `translate(${(mousePos.x - 0.5) * -10}px, ${(mousePos.y - 0.5) * 10}px)`, animationDelay: '-8s' }} />
        </div>
        <div className="relative w-full max-w-md">

          {/* Back to home */}
          <Link
            to="/"
            id="btn-back-home"
            className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm transition-colors duration-300 group mb-6"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Quay lại trang chủ
          </Link>

          <div className="glass-analytic p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-white mb-3">Kiểm tra email</h2>
            <p className="text-white/40 mb-2">
              Chúng tôi đã gửi email xác nhận đến
            </p>
            <p className="text-cyan-400 font-medium mb-6">{registeredEmail}</p>
            <p className="text-slate-500 text-sm mb-6">
              Vui lòng click link trong email để kích hoạt tài khoản. Link có hiệu lực trong 24 giờ.
            </p>
            <button onClick={handleResend}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
              Gửi lại email xác nhận
            </button>

            {/* ── DEV ONLY SECTION ────────────────────────────────────────────── */}
            {import.meta.env.DEV && (
              <div className="mt-6 pt-5 border-t border-amber-500/20">
                <div className="flex items-center gap-2 justify-center mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    DEV MODE
                  </span>
                  <span className="text-slate-500 text-xs">Mock Email — không gửi email thật</span>
                </div>
                <button
                  id="dev-activate-btn"
                  onClick={handleDevActivate}
                  disabled={devActivating}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {devActivating ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang kích hoạt...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                      </svg>
                      Kích hoạt ngay (bỏ qua email)
                    </>
                  )}
                </button>
                {devMessage && (
                  <p className={`mt-2 text-xs font-medium ${devMessage.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {devMessage}
                  </p>
                )}
              </div>
            )}
            {/* ── END DEV ONLY ─────────────────────────────────────────────────── */}
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-8 lg:py-12 relative overflow-hidden" style={{ perspective: '1000px' }} onMouseMove={handleMouseMove}>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse opacity-[0.08]" style={{ transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 20}px)` }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px] animate-pulse opacity-[0.08]" style={{ transform: `translate(${(mousePos.x - 0.5) * -15}px, ${(mousePos.y - 0.5) * -15}px)`, animationDelay: '-4s' }} />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-[80px] animate-pulse opacity-[0.08]" style={{ transform: `translate(${(mousePos.x - 0.5) * -10}px, ${(mousePos.y - 0.5) * 10}px)`, animationDelay: '-8s' }} />
      </div>

      <div className="relative w-full max-w-md">

        {/* Back to home */}
        <Link
          to="/"
          id="btn-back-home"
          className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm transition-colors duration-300 group mb-6"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="label-cyber text-cyan-400/50 mb-4 inline-block">Đăng ký</span>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/20 mb-4 hover:scale-105 transition-transform duration-300">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 text-glow-cyan">Đăng ký tài khoản</h1>
          <p className="text-white/40 mb-2">Tạo tài khoản mới để sử dụng thư viện</p>
        </div>

        {/* Form Card */}
        <div className="glass-analytic p-8">
          {globalError && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-sm text-red-400" id="register-global-error">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {globalError}
            </div>
          )}
          <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} serverErrors={serverErrors} />
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-white/30 text-sm">
          Đã có tài khoản?{' '}
          <Link
            to={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'}
            className="text-white/30 hover:text-cyan-400 font-medium transition-all duration-300"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
