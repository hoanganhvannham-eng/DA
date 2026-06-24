import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

/**
 * LoginPage — trang đăng nhập (UC02).
 *
 * Xử lý các tình huống từ backend:
 *  - ✅ Đăng nhập thành công → lưu token → redirect theo role
 *  - ❌ Sai email/password        → AUTH_INVALID_CREDENTIALS (401)
 *  - ❌ Tài khoản chưa kích hoạt → AUTH_ACCOUNT_PENDING (403)
 *  - ❌ Bị khóa (brute-force)    → AUTH_TOO_MANY_ATTEMPTS (429) + Retry-After header
 *                                    → hiển thị countdown timer
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || ''
  const { login } = useAuth()

  const [isLoading, setIsLoading]     = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [errorType, setErrorType]     = useState('') // 'locked' | 'pending' | 'invalid' | ''

  // Countdown khi bị khóa (BR-AUTH-01)
  const [lockCountdown, setLockCountdown] = useState(0)

  // Đếm ngược mỗi giây khi bị khóa
  useEffect(() => {
    if (lockCountdown <= 0) return
    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGlobalError('')
          setErrorType('')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [lockCountdown])

  // Format giây → mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleSubmit = useCallback(async ({ email, password }) => {
    setIsLoading(true)
    setGlobalError('')
    setErrorType('')

    try {
      const data = await authService.login({ email, password })

      // Sync auth state toàn cục ngay lập tức (Navbar cập nhật không cần reload)
      login(data.user)

      // ── Redirect ────────────────────────────────────────────────────────
      // Nếu có returnUrl (vd từ BookDetail), ưu tiên quay lại trang đó
      if (returnUrl) {
        navigate(returnUrl, { replace: true })
      } else {
        const role = data.user?.role
        if (role === 'ADMIN' || role === 'LIBRARIAN') {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }

    } catch (err) {
      const status  = err.response?.status
      const code    = err.response?.data?.code
      const message = err.response?.data?.message

      if (status === 429 || code === 'AUTH_TOO_MANY_ATTEMPTS') {
        // Lấy Retry-After từ header (giây) hoặc fallback 900s (15 phút)
        const retryAfterRaw = err.response?.headers?.['retry-after']
        const retrySecs = retryAfterRaw ? parseInt(retryAfterRaw, 10) : 900
        setLockCountdown(retrySecs)
        setErrorType('locked')
        setGlobalError(message || 'Tài khoản tạm thời bị khóa do nhập sai quá nhiều lần.')

      } else if (status === 403 || code === 'AUTH_ACCOUNT_PENDING') {
        setErrorType('pending')
        setGlobalError('Tài khoản chưa được xác nhận. Vui lòng kiểm tra email để kích hoạt.')

      } else if (status === 401 || code === 'AUTH_INVALID_CREDENTIALS') {
        setErrorType('invalid')
        setGlobalError('Email hoặc mật khẩu không đúng.')

      } else {
        setErrorType('invalid')
        setGlobalError(message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [navigate, returnUrl])

  // ── Error alert variants ────────────────────────────────────────────────────
  const ErrorAlert = () => {
    if (!globalError) return null

    if (errorType === 'locked') {
      return (
        <div className="mb-5 p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl" id="login-locked-alert">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-orange-300 font-medium mb-1">Tài khoản tạm thời bị khóa</p>
              <p className="text-sm text-orange-400/80">{globalError}</p>
              {lockCountdown > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-orange-400/60">Thử lại sau:</span>
                  <span className="text-base font-mono font-bold text-orange-300">
                    {formatTime(lockCountdown)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (errorType === 'pending') {
      return (
        <div className="mb-5 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl" id="login-pending-alert">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-yellow-300 font-medium mb-1">Email chưa được xác nhận</p>
              <p className="text-sm text-yellow-400/80">{globalError}</p>
              <Link
                to={returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : '/register'}
                className="mt-2 inline-block text-xs text-yellow-300 hover:text-yellow-200 underline underline-offset-2 transition-colors"
              >
                Gửi lại email xác nhận →
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-sm text-red-400" id="login-error-alert">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        {globalError}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-8" style={{ perspective: '1000px' }}>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full animate-pulse" style={{ background: 'rgba(6,182,212,0.10)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full animate-pulse" style={{ background: 'rgba(139,92,246,0.10)', filter: 'blur(80px)' }} />
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 shadow-lg shadow-cyan-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Đăng nhập</h1>
          <p className="text-white/40">Chào mừng bạn quay lại Thư viện</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl">

          <ErrorAlert />

          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isLoading || lockCountdown > 0}
            serverError={!!globalError}
          />

          {/* Forgot password link */}
          <div className="mt-4 text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              id="forgot-password-link"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-slate-900 text-white/30 tracking-[0.2em] text-xs uppercase">hoặc</span>
            </div>
          </div>

          {/* Google Login Button */}
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
            className="w-full py-3 px-4 bg-white/5 border border-white/10
                       hover:bg-white/10 text-white font-medium
                       rounded-2xl transition-all duration-300
                       flex items-center justify-center gap-3 mb-6"
            id="google-login-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Đăng nhập với Google</span>
          </a>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500">
            Chưa có tài khoản?{' '}
            <Link
              to={returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : '/register'}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-white/20 text-xs">
          © {new Date().getFullYear()} Library System. Bảo mật theo chuẩn JWT.
        </p>
      </div>
    </div>
  )
}
