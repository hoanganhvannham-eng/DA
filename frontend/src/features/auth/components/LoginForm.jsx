import React, { useState } from 'react'

/**
 * LoginForm — form inputs cho đăng nhập.
 * Hỗ trợ: show/hide password, client-side validation, trạng thái disabled khi loading.
 */
export default function LoginForm({ onSubmit, isLoading, serverError }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim())          errs.email    = 'Email không được để trống'
    else if (!emailRe.test(form.email)) errs.email = 'Email không đúng định dạng'

    if (!form.password)              errs.password = 'Mật khẩu không được để trống'
    else if (form.password.length < 8 || form.password.length > 16)
      errs.password = 'Mật khẩu phải từ 8 đến 16 ký tự'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(form)
  }

  const inputCls = (field) =>
    `w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border rounded-xl text-white placeholder-slate-500
     focus:outline-none focus:ring-2 transition-all duration-300 ${
      (errors[field] || serverError)
        ? 'border-red-500/50 focus:ring-red-500/30'
        : 'border-white/10 focus:ring-cyan-500/30 focus:border-cyan-500/50'
    }`

  const ErrorMsg = ({ msg }) =>
    msg ? (
      <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {msg}
      </p>
    ) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="login-form" noValidate>

      {/* Email */}
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <input
            type="email" id="login-email" name="email"
            value={form.email} onChange={handleChange}
            placeholder="name@example.com"
            className={inputCls('email')}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
        <ErrorMsg msg={errors.email} />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1.5">
          Mật khẩu
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <input
            type={showPwd ? 'text' : 'password'} id="login-password" name="password"
            value={form.password} onChange={handleChange}
            placeholder="Nhập mật khẩu"
            className={`${inputCls('password')} pr-11`}
            disabled={isLoading}
            autoComplete="current-password"
          />
          {/* Toggle show/hide */}
          <button
            type="button" tabIndex={-1}
            onClick={() => setShowPwd(!showPwd)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 hover:text-white/60 transition-colors"
            aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPwd ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>
        <ErrorMsg msg={errors.password} />
      </div>

      {/* Submit */}
      <button
        type="submit" id="login-submit-btn"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-cyan-500
                   hover:bg-cyan-400 text-white font-semibold
                   rounded-2xl shadow-lg shadow-cyan-500/30
                   transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          <span>Đăng nhập</span>
        )}
      </button>
    </form>
  )
}
