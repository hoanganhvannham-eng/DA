import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../features/auth/hooks/useAuth'
import QrScannerModal from '../../../shared/components/QrScannerModal'
import ConfirmPickupModal from '../../../features/borrow/components/ConfirmPickupModal'
import { lookupByPickupCode, pickupByCode } from '../../../features/borrow/services/borrowService'

const ROLE_LABELS = {
  READER: { label: 'Độc giả', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  LIBRARIAN: { label: 'Nhân viên', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ADMIN: { label: 'Quản lý', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
}

const PICKUP_STATUS_VI = {
  BORROWING: 'Đang mượn',
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED_WAITING_PAYMENT: 'Chờ nạp tiền',
  RESERVED: 'Đã giữ sách',
  AWAITING_SHIPMENT: 'Chờ giao hàng',
  IN_DELIVERY: 'Đang giao hàng',
  RETURN_PENDING: 'Chờ trả sách',
  RETURNED: 'Đã trả',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy',
}

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [bookMenuOpen, setBookMenuOpen] = useState(false)
  const [confirmMenuOpen, setConfirmMenuOpen] = useState(false)
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [pickupConfirmTarget, setPickupConfirmTarget] = useState(null)
  const [pickupNotification, setPickupNotification] = useState(null)
  const bookMenuRef = useRef(null)
  const confirmMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return
    const close = (e) => {
      if (!e.target.closest('#user-menu')) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [dropdownOpen])

  useEffect(() => {
    const close = (e) => {
      if (bookMenuRef.current && !bookMenuRef.current.contains(e.target)) setBookMenuOpen(false)
      if (confirmMenuRef.current && !confirmMenuRef.current.contains(e.target)) setConfirmMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const handleLogout = async () => {
    await logout()
    setDropdownOpen(false)
    navigate('/')
  }
  const handleQrScanSuccess = async (scannedCode) => {
    const code = scannedCode.trim().toUpperCase()
    try {
      const data = await lookupByPickupCode(code)
      if (data.status !== 'AWAITING_PICKUP') {
        setPickupNotification({ msg: `Sách đang ở trạng thái: ${PICKUP_STATUS_VI[data.status] || data.status}` })
        return false
      }
      setShowQrScanner(false)
      setPickupConfirmTarget({ ...data, id: code })
      return true
    } catch (err) {
      setPickupNotification({ msg: err.response?.data?.message || 'Không tìm thấy phiếu mượn với mã này' })
      return false
    }
  }

  const handleConfirmPickupCode = async (code) => {
    await pickupByCode(code)
    setPickupConfirmTarget(null)
    setPickupNotification({ msg: '✓ Xác nhận nhận sách thành công!' })
  }

  // Nav links cho khách / độc giả (không đổi)
  const publicNavLinks = [
    { label: 'Tính năng', href: '#features' },
    { label: 'Giới thiệu', href: '#about' },
    { label: 'Cách dùng', href: '#how-it-works' },
    { label: 'Khám phá Mood', href: '/mood', isRoute: true },
    { label: 'FAQ', href: '#faq' },
    { label: 'Liên hệ', href: '#contact' },
  ]

  const roleInfo = user ? (ROLE_LABELS[user.role] || ROLE_LABELS.READER) : null

  const getInitials = (role) => {
    if (role === 'ADMIN') return 'AD'
    if (role === 'LIBRARIAN') return 'LB'
    return 'RD'
  }

  const isStaff = user && (user.role === 'LIBRARIAN' || user.role === 'ADMIN')

  // ── Navbar riêng cho LIBRARIAN + ADMIN ──
  const StaffNavbar = () => (
    <nav className="hidden md:flex items-center gap-1">

      {/* Quản lý sách — có submenu */}
      <div ref={bookMenuRef} className="relative">
        <button
          onMouseEnter={() => setBookMenuOpen(true)}
          onMouseLeave={() => setBookMenuOpen(false)}
          // onClick={() => navigate('/books')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all duration-200"
        >
          Quản lý sách
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {bookMenuOpen && (
          <div
            className="absolute top-full left-0 mt-0 pt-2 w-48  bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl shadow-black/40 py-1 z-50"
            onMouseEnter={() => setBookMenuOpen(true)}
            onMouseLeave={() => setBookMenuOpen(false)}
          >
            <Link
              to="/books"
              className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              Thư viện sách
            </Link>
            <Link
              to="/categories"
              className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
              Quản lý thể loại
            </Link>
            <Link
              to="/moods"
              className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
              Quản lý Mood
            </Link>
          </div>
        )}
      </div>

      {/* Xác nhận giao sách — có submenu */}
      <div ref={confirmMenuRef} className="relative">
        <button
          onMouseEnter={() => setConfirmMenuOpen(true)}
          onMouseLeave={() => setConfirmMenuOpen(false)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all duration-200"
        >
          Xác nhận giao sách
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {confirmMenuOpen && (
          <div
            className="absolute top-full left-0 mt-0 pt-2 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl shadow-black/40 py-1 z-50"
            onMouseEnter={() => setConfirmMenuOpen(true)}
            onMouseLeave={() => setConfirmMenuOpen(false)}
          >
            <Link
              to="/librarian/pickup"
              className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              </svg>
              Nhập mã
            </Link>
            <button
              onClick={() => { setConfirmMenuOpen(false); setShowQrScanner(true) }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              Quét mã
            </button>
            <button
              onClick={() => { setConfirmMenuOpen(false); setPickupNotification({ msg: 'Chức năng đang được hoàn thiện' }) }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-15H6.75A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6.75 21h10.5a2.25 2.25 0 0 0 2.25-2.25V9.75m-12 9.75H6.75A2.25 2.25 0 0 1 4.5 18V5.25A2.25 2.25 0 0 1 6.75 3h7.5l4.5 4.5" />
              </svg>
              Lập phiếu mượn
            </button>
          </div>
        )}
      </div>

      {/* Xác nhận trả sách */}
      <Link
        to="/librarian/returns"
        className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all duration-200"
      >
        Xác nhận trả sách
      </Link>

      {/* Quản lý mượn trả */}
      <Link
        to="/librarian/borrows"
        className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all duration-200"
      >
        Quản lý mượn trả
      </Link>

      {/* Báo cáo chi tiết */}
      <Link
        to="/reports/detailed"
        className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all duration-200"
      >
        Báo cáo chi tiết
      </Link>
    </nav>
  )

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl transition-all duration-500 glass-analytic ${scrolled ? 'shadow-xl' : ''
        }`}
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <span className="font-bold text-base text-white tracking-tight font-heading">LibraryMS</span>
          </Link>

          {/* Nav — staff hoặc public */}
          {isStaff ? <StaffNavbar /> : (
            <nav className="hidden md:flex items-center gap-1">
              {publicNavLinks.map((link) => (
                link.isRoute ? (
                  <Link key={link.label} to={link.href}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all duration-200">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all duration-200">
                    {link.label}
                  </a>
                )
              ))}
            </nav>
          )}

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div id="user-menu" className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-cyan-500/30 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                    {getInitials(user.role)}
                  </div>
                  <span className={`hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                  <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#0f172a] backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl shadow-black/40 flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                          {getInitials(user.role)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Tài khoản của tôi</p>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {/* Hồ sơ — tất cả role */}
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        Hồ sơ cá nhân
                      </Link>

                      {/* READER only */}
                      {user.role === 'READER' && (<>
                        <Link to="/my-borrows" onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                          </svg>
                          Lịch sử mượn sách
                        </Link>
                        <Link to="/my-wallet" onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                          </svg>
                          Ví điện tử
                        </Link>
                        <Link to="/my-fines" onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Khoản phạt của tôi
                        </Link>
                      </>)}

                      {/* ADMIN only */}
                      {user.role === 'ADMIN' && (<>
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                          </svg>
                          Dashboard
                        </Link>
                        <Link to="/fine-levels" onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Quản lý mức phạt
                        </Link>
                        <Link to="/admin/users" onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                          </svg>
                          Quản lý người dùng
                        </Link>
                        <Link to="/librarian/fines/pending" onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Xác nhận thanh toán phạt
                        </Link>
                      </>)}
                    </div>

                    <div className="p-2 border-t border-slate-800/60">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white rounded-xl shadow-lg shadow-cyan-700/30 hover:shadow-cyan-600/40 transition-all duration-300">
                  Đăng nhập
                </Link>
                <Link to="/register" id="landing-register-btn"
                  className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl shadow-lg shadow-amber-600/30 hover:shadow-amber-500/40 transition-all duration-300">
                  Đăng ký miễn phí
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/50 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {/* Mobile nav links — staff hoặc public */}
              {isStaff ? (<>
                <Link to="/books" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all">Thư viện sách</Link>
                <Link to="/categories" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all">Quản lý thể loại</Link>
                <Link to="/moods" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all">Quản lý Mood</Link>
                <Link to="/librarian/pickup" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all">Nhập mã giao sách</Link>
                <Link to="/librarian/borrows" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all">Quản lý mượn trả</Link>
                <Link to="/reports/detailed" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all">Báo cáo chi tiết</Link>
              </>) : publicNavLinks.map((link) => (
                link.isRoute ? (
                  <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-all">
                    {link.label}
                  </a>
                )
              ))}

              {user ? (
                <div className="mt-3 px-1">
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/40 border border-slate-700/30 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {getInitials(user.role)}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Đã đăng nhập</p>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 w-full py-2.5 px-3 text-sm font-medium text-slate-300 border border-slate-700/50 rounded-xl hover:bg-white/5 transition-all mb-2">
                    Hồ sơ cá nhân
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full py-2.5 text-center text-sm font-medium text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all">
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 mt-3 px-1">
                  <Link to="/login" className="flex-1 py-2.5 text-center text-sm font-medium text-slate-300 border border-slate-700 rounded-xl hover:border-slate-600 transition-all">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="flex-1 py-2.5 text-center text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {showQrScanner && (
        <QrScannerModal
          onScanSuccess={handleQrScanSuccess}
          onClose={() => setShowQrScanner(false)}
        />
      )}
      {pickupConfirmTarget && createPortal(
        <ConfirmPickupModal
          borrow={pickupConfirmTarget}
          onSubmit={handleConfirmPickupCode}
          onClose={() => setPickupConfirmTarget(null)}
        />,
        document.body
      )}

      {pickupNotification && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', maxWidth: '320px', width: '90%', textAlign: 'center' }}>
            <p style={{ color: pickupNotification.msg?.startsWith('✓') ? '#86efac' : '#fca5a5', fontSize: '15px', marginBottom: '16px', lineHeight: 1.5 }}>
              {pickupNotification.msg}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setPickupNotification(null)}
                style={{ padding: '10px 32px', borderRadius: '10px', background: '#22d3ee', color: '#000', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}