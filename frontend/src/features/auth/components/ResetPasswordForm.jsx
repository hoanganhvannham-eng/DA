import React, { useState, useCallback } from 'react'

/**
 * ResetPasswordForm — form nhập mật khẩu mới + xác nhận.
 *
 * @param {{ onSubmit: ({ newPassword, confirmPassword }) => Promise<void>, isLoading: boolean }} props
 */
export default function ResetPasswordForm({ onSubmit, isLoading }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = useCallback(() => {
    const newErrors = {}
    if (!newPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được để trống'
    } else if (newPassword.length < 8 || newPassword.length > 16) {
      newErrors.newPassword = 'Mật khẩu mới phải từ 8 đến 16 ký tự'
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống'
    } else if (newPassword && confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [newPassword, confirmPassword])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({ newPassword, confirmPassword })
  }

  const EyeIcon = ({ show }) => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      {show ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </>
      )}
    </svg>
  )

  const renderPasswordField = (id, label, value, setter, error) => (
    <div className="mb-5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => { setter(e.target.value); setErrors({}) }}
          placeholder="••••••••"
          autoComplete="new-password"
          className={`w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.04] border text-white placeholder-slate-500 outline-none transition-all duration-200
            ${error
              ? 'border-red-500/50 focus:border-red-400 focus:ring-1 focus:ring-red-400/30'
              : 'border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
            }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
          tabIndex={-1}
        >
          <EyeIcon show={showPassword} />
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} noValidate>
      {renderPasswordField('reset-new-password', 'Mật khẩu mới', newPassword, setNewPassword, errors.newPassword)}
      {renderPasswordField('reset-confirm-password', 'Xác nhận mật khẩu', confirmPassword, setConfirmPassword, errors.confirmPassword)}

      <button
        type="submit"
        disabled={isLoading}
        id="reset-password-submit"
        className="w-full py-3 px-4 rounded-2xl font-bold text-white bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/30"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang xử lý...
          </span>
        ) : (
          'Đặt lại mật khẩu'
        )}
      </button>
    </form>
  )
}
