import React, { useState, useCallback } from 'react'

/**
 * ForgotPasswordForm — form nhập email yêu cầu đặt lại mật khẩu.
 *
 * @param {{ onSubmit: (email: string) => Promise<void>, isLoading: boolean }} props
 */
export default function ForgotPasswordForm({ onSubmit, isLoading }) {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})

  const validate = useCallback(() => {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không đúng định dạng'
    } else {
      const domain = email.split('@')[1]?.toLowerCase()
      if (domain !== 'library.com' && domain !== 'gmail.com')
        newErrors.email = 'Email chỉ chấp nhận đuôi @library.com hoặc @gmail.com'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(email)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <div className="mb-5">
        <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-300 mb-2">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          className={`w-full px-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border text-white placeholder-slate-500 outline-none transition-all duration-200
            ${errors.email
              ? 'border-rose-500/50 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
              : 'border-white/10 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20'
            }`}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        id="forgot-password-submit"
        className="w-full py-3 px-4 rounded-2xl font-bold text-white bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/30"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang gửi...
          </span>
        ) : (
          'Gửi link đặt lại mật khẩu'
        )}
      </button>
    </form>
  )
}
