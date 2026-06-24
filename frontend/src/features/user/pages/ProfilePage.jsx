import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { userService } from '../services/userService'

const ROLE_LABELS = {
  READER: { label: 'Độc giả', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  LIBRARIAN: { label: 'Nhân viên', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  ADMIN: { label: 'Quản lý', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
}

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatCurrency = (amount) => {
  if (amount == null) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

/**
 * ProfilePage — Trang hồ sơ cá nhân (UC03).
 *
 * Chức năng:
 *  - Xem thông tin hồ sơ
 *  - Cập nhật tên, SĐT, địa chỉ
 *  - Thay đổi mật khẩu
 */
export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!isLoggedIn) navigate('/login', { replace: true })
  }, [isLoggedIn, navigate])

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'password'

  // ── Form cập nhật thông tin ──────────────────────────────────────────────
  const [infoForm, setInfoForm] = useState({ name: '', phone: '', address: '' })
  const [infoErrors, setInfoErrors] = useState({})
  const [infoStatus, setInfoStatus] = useState('') // '' | 'loading' | 'success' | 'error'
  const [infoMessage, setInfoMessage] = useState('')

  // ── Form đổi mật khẩu ───────────────────────────────────────────────────
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdErrors, setPwdErrors] = useState({})
  const [pwdStatus, setPwdStatus] = useState('')
  const [pwdMessage, setPwdMessage] = useState('')

  // Load profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      const data = await userService.getProfile()
      setProfile(data)
      setInfoForm({ name: data.name || '', phone: data.phone || '', address: data.address || '' })
    } catch {
      // Nếu 401 → redirect login
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { if (isLoggedIn) loadProfile() }, [isLoggedIn, loadProfile])

  // ── Validate info form ───────────────────────────────────────────────────
  const validateInfo = () => {
    const errors = {}
    if (!infoForm.name?.trim()) errors.name = 'Tên không được để trống'
    else if (infoForm.name.length > 50) errors.name = 'Tên tối đa 50 ký tự'
    if (infoForm.phone && !/^(0[35789])+([0-9]{8})$/.test(infoForm.phone)) {
      errors.phone = 'Số điện thoại không đúng định dạng (VD: 0912345678)'
    }
    if (infoForm.address && infoForm.address.length > 255) errors.address = 'Địa chỉ tối đa 255 ký tự'
    return errors
  }

  const handleInfoSubmit = async (e) => {
    e.preventDefault()
    const errors = validateInfo()
    if (Object.keys(errors).length > 0) { setInfoErrors(errors); return }
    setInfoErrors({})
    setInfoStatus('loading')
    try {
      const updated = await userService.updateProfile(infoForm)
      setProfile(updated)
      setInfoStatus('success')
      setInfoMessage('Cập nhật thông tin thành công!')
      setTimeout(() => setInfoStatus(''), 3000)
    } catch (err) {
      setInfoStatus('error')
      const serverErrors = err.response?.data?.errors
      if (serverErrors) {
        const mapped = {}
        serverErrors.forEach(e => { mapped[e.field] = e.message })
        setInfoErrors(mapped)
      } else {
        setInfoMessage(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
      }
    }
  }

  // ── Validate password form ───────────────────────────────────────────────
  const validatePwd = () => {
    const errors = {}
    if (!pwdForm.oldPassword) errors.oldPassword = 'Mật khẩu cũ không được để trống'
    if (!pwdForm.newPassword) errors.newPassword = 'Mật khẩu mới không được để trống'
    else if (pwdForm.newPassword.length < 8 || pwdForm.newPassword.length > 16)
      errors.newPassword = 'Mật khẩu mới phải từ 8 đến 16 ký tự'
    if (!pwdForm.confirmPassword) errors.confirmPassword = 'Xác nhận mật khẩu không được để trống'
    else if (pwdForm.newPassword !== pwdForm.confirmPassword)
      errors.confirmPassword = 'Xác nhận mật khẩu không khớp'
    return errors
  }

  const handlePwdSubmit = async (e) => {
    e.preventDefault()
    const errors = validatePwd()
    if (Object.keys(errors).length > 0) { setPwdErrors(errors); return }
    setPwdErrors({})
    setPwdStatus('loading')
    try {
      await userService.changePassword(pwdForm)
      setPwdStatus('success')
      setPwdMessage('Đổi mật khẩu thành công!')
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPwdStatus(''), 3000)
    } catch (err) {
      setPwdStatus('error')
      const code = err.response?.data?.code
      const msg = err.response?.data?.message
      if (code === 'AUTH_INVALID_OLD_PASSWORD') setPwdErrors({ oldPassword: 'Mật khẩu cũ không đúng' })
      else if (code === 'AUTH_SAME_PASSWORD') setPwdErrors({ newPassword: 'Mật khẩu mới không được trùng với mật khẩu cũ' })
      else { setPwdMessage(msg || 'Đã xảy ra lỗi. Vui lòng thử lại.') }
    }
  }

  const roleInfo = profile ? (ROLE_LABELS[profile.role] || ROLE_LABELS.READER) : null

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  // ── Shared input style ───────────────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-3 bg-white/[0.04] border rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 transition-all ${
      err ? 'border-red-500/40 ring-red-500/20' : 'border-white/5 focus:ring-cyan-500/20 focus:border-cyan-500/40'
    }`

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-20 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-10 pt-16">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm mb-8 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Quay lại trang chủ
        </Link>

        {/* Header card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl mb-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-cyan-500/25 flex-shrink-0">
              {profile.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{profile.name}</h1>
              <p className="text-white/40 text-sm truncate">{profile.email}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase border mt-1 ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
            <div className="hidden sm:flex flex-col gap-1 text-right">
              <p className="text-xs text-white/30">Ngày tham gia</p>
              <p className="text-sm text-white/40 font-mono">{formatDate(profile.joinedDate)}</p>
            </div>
          </div>

          {/* Reader stats — borrowCount/totalFines */}
          {profile.role === 'READER' && (
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Số lần mượn sách</p>
                {/* ⚠️ TODO (library-borrow): Hiện tại null — sẽ có giá trị khi module borrow được triển khai */}
                <p className="text-2xl font-black text-cyan-400">
                  {profile.borrowCount ?? <span className="text-white/20 text-sm font-normal">Chưa có dữ liệu</span>}
                </p>
              </div>
              <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Tổng tiền phạt</p>
                {/* ⚠️ TODO (library-fine): Hiện tại null — sẽ có giá trị khi module fine được triển khai */}
                <p className="text-2xl font-black text-amber-400">
                  {profile.totalFines != null ? formatCurrency(profile.totalFines) : <span className="text-white/20 text-sm font-normal">Chưa có dữ liệu</span>}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-slate-900/40 border border-white/5 rounded-2xl p-1 mb-6">
          {[
            { key: 'info', label: 'Thông tin cá nhân' },
            { key: 'password', label: 'Đổi mật khẩu' },
          ].map((tab) => (
            <button
              key={tab.key}
              id={`profile-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Thông tin cá nhân */}
        {activeTab === 'info' && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Cập nhật thông tin
            </h2>

            {/* Readonly fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/5">
              <div>
                <label className="block text-xs text-white/30 mb-1.5">Email <span className="text-white/20">(Không thể thay đổi)</span></label>
                <div className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white/30 text-sm">{profile.email}</div>
              </div>
              <div>
                <label className="block text-xs text-white/30 mb-1.5">Ngày tham gia <span className="text-white/20">(Không thể thay đổi)</span></label>
                <div className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white/30 text-sm">{formatDate(profile.joinedDate)}</div>
              </div>
            </div>

            {/* Success/error alert */}
            {infoStatus === 'success' && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-sm text-emerald-400" id="profile-info-success">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                {infoMessage}
              </div>
            )}
            {infoStatus === 'error' && !Object.keys(infoErrors).length && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400" id="profile-info-error">{infoMessage}</div>
            )}

            <form onSubmit={handleInfoSubmit} id="profile-info-form" className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="block text-xs text-white/40 mb-1.5">Tên hiển thị <span className="text-red-400">*</span></label>
                <input
                  id="profile-name"
                  type="text"
                  value={infoForm.name}
                  onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls(infoErrors.name)}
                  placeholder="Nhập tên của bạn"
                  maxLength={50}
                />
                {infoErrors.name && <p className="mt-1.5 text-xs text-red-400">{infoErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="profile-phone" className="block text-xs text-white/40 mb-1.5">Số điện thoại <span className="text-white/20">(Tùy chọn)</span></label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={infoForm.phone}
                  onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))}
                  className={inputCls(infoErrors.phone)}
                  placeholder="VD: 0912345678"
                />
                {infoErrors.phone && <p className="mt-1.5 text-xs text-red-400">{infoErrors.phone}</p>}
              </div>

              <div>
                <label htmlFor="profile-address" className="block text-xs text-white/40 mb-1.5">Địa chỉ <span className="text-white/20">(Tùy chọn)</span></label>
                <textarea
                  id="profile-address"
                  rows={3}
                  value={infoForm.address}
                  onChange={e => setInfoForm(f => ({ ...f, address: e.target.value }))}
                  className={inputCls(infoErrors.address) + ' resize-none'}
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                  maxLength={255}
                />
                {infoErrors.address && <p className="mt-1.5 text-xs text-red-400">{infoErrors.address}</p>}
              </div>

              <button
                id="profile-info-submit"
                type="submit"
                disabled={infoStatus === 'loading'}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 text-sm flex items-center justify-center gap-2"
              >
                {infoStatus === 'loading' ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                ) : 'Lưu thông tin'}
              </button>
            </form>
          </div>
        )}

        {/* Tab: Đổi mật khẩu */}
        {activeTab === 'password' && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              Thay đổi mật khẩu
            </h2>

            {pwdStatus === 'success' && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-sm text-emerald-400" id="profile-pwd-success">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                {pwdMessage}
              </div>
            )}
            {pwdStatus === 'error' && !Object.keys(pwdErrors).length && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400" id="profile-pwd-error">{pwdMessage}</div>
            )}

            <form onSubmit={handlePwdSubmit} id="profile-pwd-form" className="space-y-4">
              {[
                { id: 'profile-old-password', key: 'oldPassword', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại' },
                { id: 'profile-new-password', key: 'newPassword', label: 'Mật khẩu mới', placeholder: '8–16 ký tự' },
                { id: 'profile-confirm-password', key: 'confirmPassword', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
              ].map(({ id, key, label, placeholder }) => (
                <div key={key}>
                  <label htmlFor={id} className="block text-xs text-white/40 mb-1.5">{label} <span className="text-red-400">*</span></label>
                  <input
                    id={id}
                    type="password"
                    value={pwdForm[key]}
                    onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                    className={inputCls(pwdErrors[key])}
                    placeholder={placeholder}
                    autoComplete={key === 'oldPassword' ? 'current-password' : 'new-password'}
                  />
                  {pwdErrors[key] && <p className="mt-1.5 text-xs text-red-400">{pwdErrors[key]}</p>}
                </div>
              ))}

              <button
                id="profile-pwd-submit"
                type="submit"
                disabled={pwdStatus === 'loading'}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 text-sm flex items-center justify-center gap-2"
              >
                {pwdStatus === 'loading' ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                ) : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
