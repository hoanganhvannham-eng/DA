import React, { useState } from 'react'

/**
 * RegisterForm — form inputs, client-side validation, password strength.
 */
export default function RegisterForm({ onSubmit, isLoading, serverErrors }) {
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim()) errs.email = 'Email không được để trống'
    else if (!emailRe.test(form.email)) errs.email = 'Email không đúng định dạng'
    else {
      const domain = form.email.split('@')[1]?.toLowerCase()
      if (domain !== 'library.com' && domain !== 'gmail.com')
        errs.email = 'Email chỉ chấp nhận đuôi @library.com hoặc @gmail.com'
    }

    if (!form.name.trim()) errs.name = 'Tên không được để trống'
    else if (form.name.trim().length > 50) errs.name = 'Tên tối đa 50 ký tự'

    if (!form.password) errs.password = 'Mật khẩu không được để trống'
    else if (form.password.length < 8 || form.password.length > 16)
      errs.password = 'Mật khẩu phải từ 8 đến 16 ký tự'

    if (!form.confirmPassword) errs.confirmPassword = 'Xác nhận mật khẩu không được để trống'
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Mật khẩu xác nhận không trùng'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(form)
  }

  // Password strength
  const getStrength = () => {
    const p = form.password
    if (!p) return { level: 0, text: '', color: '' }
    let s = 0
    if (p.length >= 8) s++
    if (p.length >= 12) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    if (s <= 2) return { level: s, text: 'Yếu', color: 'bg-red-500' }
    if (s <= 3) return { level: s, text: 'Trung bình', color: 'bg-yellow-500' }
    return { level: s, text: 'Mạnh', color: 'bg-emerald-500' }
  }
  const strength = getStrength()

  const merged = { ...errors }
  if (serverErrors) {
    Object.keys(serverErrors).forEach((k) => {
      if (!merged[k]) merged[k] = serverErrors[k]
    })
  }

  const ErrorMsg = ({ msg }) =>
    msg ? (
      <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {msg}
      </p>
    ) : null

  const inputCls = (field) =>
    `w-full pl-10 pr-11 py-2.5 bg-white/[0.04] border rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-[12px] ${
      merged[field]
        ? 'border-red-500/50 focus:ring-red-500/30'
        : 'border-white/[0.06] focus:ring-cyan-400/30 focus:border-cyan-400/40'
    }`

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle} tabIndex={-1}
      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
      {show ? (
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
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="register-form" noValidate>
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-[0.15em] text-white/50 mb-1.5">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange}
            placeholder="name@example.com" className={inputCls('email')} disabled={isLoading} />
        </div>
        <ErrorMsg msg={merged.email} />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-[0.15em] text-white/50 mb-1.5">Họ và tên</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <input type="text" id="name" name="name" value={form.name} onChange={handleChange}
            placeholder="Nguyễn Văn A" className={inputCls('name')} disabled={isLoading} />
        </div>
        <ErrorMsg msg={merged.name} />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.15em] text-white/50 mb-1.5">Mật khẩu</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <input type={showPwd ? 'text' : 'password'} id="password" name="password"
            value={form.password} onChange={handleChange} placeholder="8–16 ký tự"
            className={inputCls('password')} disabled={isLoading} />
          <EyeBtn show={showPwd} toggle={() => setShowPwd(!showPwd)} />
        </div>
        {form.password && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 flex gap-1">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= strength.level ? strength.color : 'bg-slate-700'}`} />
              ))}
            </div>
            <span className={`text-xs ${
              strength.level <= 2 ? 'text-red-400' : strength.level <= 3 ? 'text-yellow-400' : 'text-emerald-400'
            }`}>{strength.text}</span>
          </div>
        )}
        <ErrorMsg msg={merged.password} />
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-[0.15em] text-white/50 mb-1.5">Xác nhận mật khẩu</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <input type={showConfirm ? 'text' : 'password'} id="confirmPassword" name="confirmPassword"
            value={form.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu"
            className={inputCls('confirmPassword')} disabled={isLoading} />
          <EyeBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
        </div>
        <ErrorMsg msg={merged.confirmPassword} />
      </div>

      {/* Submit */}
      <button type="submit" id="register-submit-btn" disabled={isLoading}
        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Đang xử lý...</span>
          </>
        ) : (
          <span>Đăng ký tài khoản</span>
        )}
      </button>
    </form>
  )
}
