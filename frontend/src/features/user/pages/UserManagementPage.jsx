import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminUserService } from '../services/adminUserService'

const ROLE_OPTIONS = [
  { value: 'READER', label: 'Độc giả', desc: 'Mượn sách, xem lịch sử cá nhân' },
  { value: 'LIBRARIAN', label: 'Nhân viên thư viện', desc: 'Quản lý sách, xác nhận mượn/trả, theo dõi phạt' },
  { value: 'ADMIN', label: 'Quản lý viên', desc: 'Toàn quyền, quản lý tài khoản, báo cáo, cài đặt' },
]

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')

  const [confirmModal, setConfirmModal] = useState(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusError, setStatusError] = useState('')

  const [roleModal, setRoleModal] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [roleAssigning, setRoleAssigning] = useState(false)
  const [roleError, setRoleError] = useState('')

  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(''), 3500)
    return () => clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminUserService.getFilteredUsers({
        keyword: debouncedKeyword || undefined,
        role: roleFilter || undefined,
        page,
        size,
      })
      setUsers(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách người dùng'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, roleFilter, page, size])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(total / size))

  const getPageNumbers = () => {
    const pages = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const handleStatusClick = (user, action) => {
    setConfirmModal({ user, action })
    setStatusError('')
  }

  const handleConfirmStatus = async () => {
    if (!confirmModal) return
    const { user, action } = confirmModal
    const newStatus = action === 'deactivate' ? 'DISABLED' : 'ACTIVE'
    try {
      setStatusUpdating(true)
      setStatusError('')
      await adminUserService.updateUserStatus(user.id, newStatus)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      )
      setSuccessMessage(
        action === 'deactivate'
          ? 'Vô hiệu hóa tài khoản thành công'
          : 'Kích hoạt tài khoản thành công'
      )
      setConfirmModal(null)
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Cập nhật trạng thái thất bại')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleCancelStatus = () => {
    setConfirmModal(null)
    setStatusError('')
  }

  const handleOpenRoleModal = (user) => {
    setRoleModal(user)
    setSelectedRole(user.role)
    setRoleError('')
  }

  const handleCloseRoleModal = () => {
    setRoleModal(null)
    setSelectedRole('')
    setRoleError('')
  }

  const handleConfirmRole = async () => {
    if (!roleModal || !selectedRole || selectedRole === roleModal.role) {
      handleCloseRoleModal()
      return
    }
    try {
      setRoleAssigning(true)
      setRoleError('')
      const result = await adminUserService.assignRole(roleModal.id, selectedRole)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === roleModal.id ? { ...u, role: selectedRole } : u
        )
      )
      setSuccessMessage(result.message || 'Gán vai trò thành công')
      handleCloseRoleModal()
    } catch (err) {
      setRoleError(err.response?.data?.message || 'Gán vai trò thất bại')
    } finally {
      setRoleAssigning(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN')
  }

  const roleBadgeClass = (role) => {
    if (role === 'ADMIN') return 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
    if (role === 'LIBRARIAN') return 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
    return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
  }

  const roleLabel = (role) => {
    if (role === 'READER') return 'Độc giả'
    if (role === 'LIBRARIAN') return 'Nhân viên'
    return 'Admin'
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-10 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '5s' }} />
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-glow-cyan">
            Quản lý người dùng
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Xem, tìm kiếm, lọc và quản lý trạng thái tài khoản người dùng
          </p>
        </div>

        {successMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-900/50 border border-emerald-700/60 text-emerald-300 text-sm animate-pulse"
          >
            <span className="text-emerald-400 font-bold">✓</span>
            {successMessage}
          </div>
        )}

        <div className="glass-analytic p-3 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm theo email hoặc tên..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          />
          <div className="relative">
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full px-4 py-2.5 pr-9 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 appearance-none"
            >
              <option className="bg-slate-900 text-white" value="">Tất cả vai trò</option>
              <option className="bg-slate-900 text-white" value="READER">Độc giả</option>
              <option className="bg-slate-900 text-white" value="LIBRARIAN">Nhân viên thư viện</option>
              <option className="bg-slate-900 text-white" value="ADMIN">Quản lý viên</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        <div className="glass-analytic overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Đang tải danh sách người dùng...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={loadUsers}
                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <p className="text-sm">Không có kết quả phù hợp.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] text-white/40 text-xs uppercase tracking-widest">
                  <th className="w-12 px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-center">Vai trò</th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">Ngày tham gia</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="w-56 px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-white/[0.04] transition-colors duration-200">
                    <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs">
                      {(page - 1) * size + index + 1}
                    </td>
                    <td className="px-4 py-3 text-white font-mono text-xs max-w-[200px] truncate">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${roleBadgeClass(user.role)}`}>
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 text-xs hidden md:table-cell">
                      {formatDate(user.joinedDate)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                          : 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                      }`}>
                        {user.status === 'ACTIVE' ? 'Kích hoạt' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* TODO: Tạm thời ẩn nút Gán vai trò */}
                        {/* <button
                          onClick={() => handleOpenRoleModal(user)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-900/50 hover:bg-cyan-800/70 text-cyan-400 hover:text-cyan-300 border border-cyan-800/50 text-xs font-semibold transition-all active:scale-95"
                        >
                          Gán vai trò
                        </button> */}
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleStatusClick(user, 'deactivate')}
                            className="px-3 py-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-800/70 text-rose-400 hover:text-rose-300 border border-rose-800/50 text-xs font-semibold transition-all active:scale-95"
                          >
                            Vô hiệu hóa
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusClick(user, 'activate')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/70 text-emerald-400 hover:text-emerald-300 border border-emerald-800/50 text-xs font-semibold transition-all active:scale-95"
                          >
                            Kích hoạt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs">
              Tổng cộng: <span className="text-white/60 font-semibold">{total}</span> người dùng
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-white/60 hover:bg-white/[0.08] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Trước
              </button>
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    p === page
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/[0.04] border border-white/5 text-white/60 hover:bg-white/[0.08]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-white/60 hover:bg-white/[0.08] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancelStatus}
        >
          <div
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white text-center mb-2">
              {confirmModal.action === 'deactivate' ? 'Xác nhận vô hiệu hóa' : 'Xác nhận kích hoạt'}
            </h2>
            <p className="text-white/40 text-sm text-center mb-4">
              Bạn có chắc muốn{' '}
              {confirmModal.action === 'deactivate' ? 'vô hiệu hóa' : 'kích hoạt'}{' '}
              tài khoản của{' '}
              <span className="text-white font-semibold">"{confirmModal.user.name}"</span>
              {' '}không?
            </p>

            {statusError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/40 border border-red-700/60 text-red-300 text-sm mb-4">
                <span className="font-bold">✗</span>
                {statusError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelStatus}
                disabled={statusUpdating}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/70 font-semibold text-sm transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmStatus}
                disabled={statusUpdating}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 ${
                  confirmModal.action === 'deactivate'
                    ? 'bg-rose-700 hover:bg-rose-600'
                    : 'bg-emerald-700 hover:bg-emerald-600'
                }`}
              >
                {statusUpdating ? 'Đang xử lý...' : confirmModal.action === 'deactivate' ? 'Vô hiệu hóa' : 'Kích hoạt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {roleModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseRoleModal}
        >
          <div
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white text-center mb-1">
              Gán vai trò
            </h2>
            <p className="text-white/40 text-sm text-center mb-5">
              Người dùng: <span className="text-white font-semibold">"{roleModal.name}"</span>
              <br />
              <span className="text-xs">Vai trò hiện tại: </span>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${roleBadgeClass(roleModal.role)}`}>
                {roleLabel(roleModal.role)}
              </span>
            </p>

            <div className="space-y-3 mb-5">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedRole === opt.value
                      ? 'border-cyan-500 bg-cyan-900/30'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={selectedRole === opt.value}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 accent-cyan-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-sm">{opt.label}</span>
                    <span className="text-slate-400 text-xs mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {roleError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-900/40 border border-red-700/60 text-red-300 text-sm mb-4">
                <span className="font-bold">✗</span>
                {roleError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCloseRoleModal}
                disabled={roleAssigning}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/70 font-semibold text-sm transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRole}
                disabled={roleAssigning || !selectedRole || selectedRole === roleModal.role}
                className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {roleAssigning ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagementPage
