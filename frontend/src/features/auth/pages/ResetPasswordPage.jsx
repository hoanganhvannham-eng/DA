import React, { useState, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import ResetPasswordForm from '../components/ResetPasswordForm'
import { authService } from '../services/authService'

/**
 * ResetPasswordPage — trang đặt lại mật khẩu (UC03b Phase 2).
 *
 * Reads `token` from URL query param (?token=...).
 * Handles error cases: token expired (410), token used (400), same password (400).
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [errorType, setErrorType] = useState('') // 'expired' | 'used' | 'same' | 'not_found' | ''
  const [success, setSuccess] = useState(false)

  // No token in URL — invalid access
  if (!token) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4" style={{ perspective: '1000px' }}>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 mb-4">
            <svg className="w-7 h-7 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Link không hợp lệ</h2>
          <p className="text-white/40 mb-6">Link đặt lại mật khẩu không hợp lệ hoặc đã bị hỏng.</p>
          <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Yêu cầu link mới →
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = useCallback(async ({ newPassword, confirmPassword }) => {
    setIsLoading(true)
    setGlobalError('')
    setErrorType('')

    try {
      await authService.resetPassword({ token, newPassword, confirmPassword })
      setSuccess(true)
      // Auto redirect to login after 3 seconds
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } catch (err) {
      const status = err.response?.status
      const code   = err.response?.data?.code
      const message = err.response?.data?.message

      if (status === 404 || code === 'AUTH_TOKEN_NOT_FOUND') {
        setErrorType('not_found')
        setGlobalError(message || 'Link đặt lại mật khẩu không hợp lệ')
      } else if (status === 410 || code === 'AUTH_TOKEN_EXPIRED') {
        setErrorType('expired')
        setGlobalError(message || 'Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại')
      } else if (code === 'AUTH_TOKEN_ALREADY_USED') {
        setErrorType('used')
        setGlobalError(message || 'Link đặt lại mật khẩu đã được sử dụng')
      } else if (code === 'AUTH_SAME_PASSWORD') {
        setErrorType('same')
        setGlobalError(message || 'Mật khẩu mới không được trùng với mật khẩu cũ')
      } else {
        setErrorType('')
        setGlobalError(message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [token, navigate])

  const ErrorAlert = () => {
    if (!globalError) return null

    const isRecoverable = errorType === 'expired' || errorType === 'not_found' || errorType === 'used'

    return (
      <div className={`mb-5 p-4 rounded-2xl border ${
        isRecoverable
          ? 'bg-orange-500/10 border-orange-500/30'
          : 'bg-red-500/10 border-red-500/20'
      }`} id="reset-password-error">
        <div className="flex items-start gap-3">
          <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isRecoverable ? 'text-orange-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className={`text-sm font-medium ${isRecoverable ? 'text-orange-300' : 'text-red-400'}`}>
              {globalError}
            </p>
            {isRecoverable && (
              <Link
                to="/forgot-password"
                className="mt-2 inline-block text-xs text-orange-300 hover:text-orange-200 underline underline-offset-2 transition-colors"
              >
                Yêu cầu link mới →
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-8" style={{ perspective: '1000px' }}>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-[80px] animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/25 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow-cyan">Đặt lại mật khẩu</h1>
          <p className="text-white/40">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl">

          {success ? (
            /* Success */
            <div id="reset-password-success">
              <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-emerald-300 font-medium mb-1">Thành công!</p>
                    <p className="text-sm text-emerald-400/80">Đặt lại mật khẩu thành công. Đang chuyển hướng đến trang đăng nhập...</p>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="block w-full py-3 px-4 rounded-2xl font-bold text-center text-white bg-cyan-500 hover:bg-cyan-400 transition-all duration-200 shadow-lg shadow-cyan-500/30"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              <ErrorAlert />
              <ResetPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
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
