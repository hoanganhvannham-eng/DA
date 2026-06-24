import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authService } from '../services/authService'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')
  const [errorCode, setErrorCode] = useState('')

  // Guard against React StrictMode double-mount causing duplicate API calls
  const calledRef = useRef(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Link xác nhận không hợp lệ')
      setErrorCode('MISSING_TOKEN')
      return
    }

    // Prevent duplicate call from StrictMode re-mount
    if (calledRef.current) return
    calledRef.current = true

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token)
        setStatus('success')
        setMessage(res.message || 'Xác nhận email thành công!')
      } catch (err) {
        setStatus('error')
        const data = err.response?.data
        setMessage(data?.message || 'Đã xảy ra lỗi khi xác nhận email')
        setErrorCode(data?.code || 'UNKNOWN')
      }
    }
    verify()
  }, [token])

  const isExpired = errorCode === 'AUTH_TOKEN_EXPIRED'

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden" style={{ perspective: '1000px' }}>
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '-6s' }} />
      </div>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      <div className="w-full max-w-md">
        <div className="glass-standard rounded-2xl p-8 text-center shadow-2xl shadow-black/40 group hover:scale-[1.02] hover:translate-z-[20px] hover:border-cyan-500/30 transition-all duration-300">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <svg className="animate-spin w-8 h-8 text-cyan-400 text-glow-cyan" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h2 className="text-xl font-heading font-bold text-white text-glow-cyan mb-2">Đang xác nhận...</h2>
              <p className="text-slate-400">Vui lòng đợi trong giây lát</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400 text-glow-emerald" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-heading font-bold text-white text-glow-emerald mb-3">{message}</h2>
              <p className="text-slate-400 mb-6">Tài khoản đã được kích hoạt. Bạn có thể đăng nhập ngay.</p>
              <Link to="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-indigo-500 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-cyan-500/25">
                Đăng nhập
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-rose-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-heading font-bold text-white mb-3">Xác nhận thất bại</h2>
              <p className="text-slate-400 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                {isExpired && (
                  <Link to="/register"
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-indigo-500 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-cyan-500/25">
                    Đăng ký lại
                  </Link>
                )}
                <Link to="/register"
                  className="text-slate-400 hover:text-cyan-400 hover:text-glow-cyan text-sm font-medium transition-all duration-300">
                  Quay lại trang đăng ký
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
