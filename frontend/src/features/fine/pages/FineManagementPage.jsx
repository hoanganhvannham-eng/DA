import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getFineLevels,
  createFineLevel,
  updateFineLevel,
  deleteFineLevel,
} from '../services/fineService'

const todayStr = () => new Date().toISOString().split('T')[0]
const thirtyDaysAgoStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

const FineManagementPage = () => {
  const [fineLevels, setFineLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingAmount, setEditingAmount] = useState('')
  const [editingAmountPerDay, setEditingAmountPerDay] = useState('')
  const [editingMaxAmount, setEditingMaxAmount] = useState('')
  const [editingFineType, setEditingFineType] = useState('')
  const [editError, setEditError] = useState('')
  const [savingId, setSavingId] = useState(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newAmountPerDay, setNewAmountPerDay] = useState('')
  const [newMaxAmount, setNewMaxAmount] = useState('')
  const [newFineDate, setNewFineDate] = useState(todayStr())
  const [newFineType, setNewFineType] = useState('ALL')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  const [deletingFine, setDeletingFine] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [successMessage, setSuccessMessage] = useState('')

  const loadFineLevels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFineLevels()
      setFineLevels(data.fineLevels || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách mức phạt'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFineLevels()
  }, [loadFineLevels])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(''), 3500)
    return () => clearTimeout(timer)
  }, [successMessage])

  const handleStartEdit = (fine) => {
    setEditingId(fine.id)
    setEditingName(fine.name)
    setEditingAmount(String(fine.amount))
    setEditingAmountPerDay(fine.amountPerDay ? String(fine.amountPerDay) : '')
    setEditingMaxAmount(fine.maxAmount ? String(fine.maxAmount) : '')
    setEditingFineType(fine.fineType || 'ALL')
    setEditError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setEditingAmount('')
    setEditingAmountPerDay('')
    setEditingMaxAmount('')
    setEditingFineType('')
    setEditError('')
  }

  const handleSaveEdit = async (fineId) => {
    const trimmedName = editingName.trim()
    if (!trimmedName) { setEditError('Tên mức phạt không được để trống'); return }
    if (trimmedName.length > 25) { setEditError('Tên mức phạt tối đa 25 ký tự'); return }

    const parsedAmount = parseFloat(editingAmount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setEditError('Số tiền phải lớn hơn 0'); return }

    try {
      setSavingId(fineId)
      setEditError('')
      const updateData = { name: trimmedName, amount: parsedAmount, fineType: editingFineType }
      if (editingAmountPerDay) {
        const parsedAmountPerDay = parseFloat(editingAmountPerDay)
        if (!isNaN(parsedAmountPerDay) && parsedAmountPerDay > 0) {
          updateData.amountPerDay = parsedAmountPerDay
        }
      }
      if (editingMaxAmount) {
        const parsedMaxAmount = parseFloat(editingMaxAmount)
        if (!isNaN(parsedMaxAmount) && parsedMaxAmount > 0) {
          updateData.maxAmount = parsedMaxAmount
        }
      }
      const data = await updateFineLevel(fineId, updateData)
      setFineLevels((prev) =>
        prev.map((f) => (f.id === fineId ? data : f))
      )
      setEditingId(null)
      setSuccessMessage('Cập nhật mức phạt thành công')
    } catch (err) {
      setEditError(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setSavingId(null)
    }
  }

  const handleEditKeyDown = (e, fineId) => {
    if (e.key === 'Enter') handleSaveEdit(fineId)
    if (e.key === 'Escape') handleCancelEdit()
  }

  const handleAdd = async () => {
    const trimmedName = newName.trim()
    if (!trimmedName) { setAddError('Tên mức phạt không được để trống'); return }
    if (trimmedName.length > 25) { setAddError('Tên mức phạt tối đa 25 ký tự'); return }

    const parsedAmount = parseFloat(newAmount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setAddError('Số tiền phải lớn hơn 0'); return }

    if (newFineDate < thirtyDaysAgoStr() || newFineDate > todayStr()) {
      setAddError('Ngày phạt phải trong vòng 30 ngày trước')
      return
    }

    try {
      setAdding(true)
      setAddError('')
      const createData = {
        name: trimmedName,
        amount: parsedAmount,
        fineDate: newFineDate || null,
        fineType: newFineType,
      }
      if (newAmountPerDay) {
        const parsedAmountPerDay = parseFloat(newAmountPerDay)
        if (!isNaN(parsedAmountPerDay) && parsedAmountPerDay > 0) {
          createData.amountPerDay = parsedAmountPerDay
        }
      }
      if (newMaxAmount) {
        const parsedMaxAmount = parseFloat(newMaxAmount)
        if (!isNaN(parsedMaxAmount) && parsedMaxAmount > 0) {
          createData.maxAmount = parsedMaxAmount
        }
      }
      const data = await createFineLevel(createData)
      setFineLevels((prev) => [data, ...prev])
      setNewName('')
      setNewAmount('')
      setNewAmountPerDay('')
      setNewMaxAmount('')
      setNewFineDate(todayStr())
      setShowAddForm(false)
      setSuccessMessage('Thêm mức phạt thành công')
    } catch (err) {
      setAddError(err.response?.data?.message || 'Thêm mức phạt thất bại')
    } finally {
      setAdding(false)
    }
  }

  const handleCancelAdd = () => {
    setShowAddForm(false)
    setNewName('')
    setNewAmount('')
    setNewAmountPerDay('')
    setNewMaxAmount('')
    setNewFineDate(todayStr())
    setNewFineType('ALL')
    setAddError('')
  }

  const handleDeleteClick = (fine) => {
    setDeletingFine(fine)
    setDeleteError('')
  }

  const handleConfirmDelete = async () => {
    if (!deletingFine) return
    try {
      setDeleting(true)
      setDeleteError('')
      await deleteFineLevel(deletingFine.id)
      setFineLevels((prev) => prev.filter((f) => f.id !== deletingFine.id))
      setDeletingFine(null)
      setSuccessMessage('Xóa mức phạt thành công')
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Xóa mức phạt thất bại')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setDeletingFine(null)
    setDeleteError('')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN')
  }
  const formatNumberInput = (value) => {
    if (!value) return ''
    const num = String(value).replace(/\D/g, '')
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const parseNumberInput = (value) => {
    return value.replace(/\./g, '')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-10 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
      </div>
      <div className="max-w-4xl mx-auto space-y-6">

        <Link
          to="/"
          id="btn-back-home"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight text-glow-cyan">
              Quản lý mức phạt
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Thêm, sửa, xóa các mức phạt trong hệ thống
            </p>
          </div>
          <button
            id="btn-add-fine-level"
            onClick={() => { setShowAddForm(true); setAddError(''); setNewName(''); setNewAmount(''); setNewAmountPerDay(''); setNewMaxAmount(''); setNewFineDate(todayStr()); setNewFineType('ALL') }}
            disabled={showAddForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-500
              hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-bold text-sm transition-all duration-200 shadow-lg
              shadow-cyan-500/30 active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
            Thêm mức phạt
          </button>
        </div>

        {successMessage && (
          <div
            id="success-toast"
            role="alert"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-900/40
              backdrop-blur-xl border border-emerald-700/40 text-emerald-300 text-sm"
          >
            <span className="text-emerald-400 font-bold">✓</span>
            {successMessage}
          </div>
        )}

        {showAddForm && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-white font-semibold mb-3">Thêm mức phạt mới</h3>
            <div className="flex flex-col gap-3">
              <input
                id="input-new-fine-name"
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setAddError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancelAdd() }}
                placeholder="Nhập tên mức phạt (tối đa 25 ký tự)"
                maxLength={25}
                autoFocus
                className={`px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${addError ? 'border-red-500/60' : 'border-white/10'}`}
              />
              <input
                id="input-new-fine-amount"
                type="text"
                value={formatNumberInput(newAmount)}
                onChange={(e) => { setNewAmount(parseNumberInput(e.target.value)); setAddError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancelAdd() }}
                placeholder="Nhập số tiền phạt"
                className={`px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${addError ? 'border-red-500/60' : 'border-white/10'}`}
              />
              <input
                id="input-new-fine-amount-per-day"
                type="text"
                value={formatNumberInput(newAmountPerDay)}
                onChange={(e) => { setNewAmountPerDay(parseNumberInput(e.target.value)); setAddError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancelAdd() }}
                placeholder="Phạt mỗi ngày trễ (VNĐ/ngày) - chỉ cho OVERDUE"
                className={`px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${addError ? 'border-red-500/60' : 'border-white/10'}`}
              />
              <input
                id="input-new-fine-max-amount"
                type="text"
                value={formatNumberInput(newMaxAmount)}
                onChange={(e) => { setNewMaxAmount(parseNumberInput(e.target.value)); setAddError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') handleCancelAdd() }}
                placeholder="Giới hạn tối đa (VNĐ) - tùy chọn"
                className={`px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${addError ? 'border-red-500/60' : 'border-white/10'}`}
              />
              <input
                id="input-new-fine-date"
                type="date"
                value={newFineDate}
                onChange={(e) => setNewFineDate(e.target.value)}
                min={thirtyDaysAgoStr()}
                max={todayStr()}
                className="px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              <p className="text-white/40 text-xs">Ngày phạt (mặc định: hôm nay, trong vòng 30 ngày)</p>
              <select
                id="select-new-fine-type"
                value={newFineType}
                onChange={(e) => setNewFineType(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all [color-scheme:dark]"
              >
                <option value="ALL" className="bg-slate-900">Tất cả loại phạt</option>
                <option value="OVERDUE" className="bg-slate-900">Phạt trả muộn</option>
                <option value="DAMAGED" className="bg-slate-900">Phạt hư hỏng</option>
                <option value="LOST" className="bg-slate-900">Phạt mất sách</option>
              </select>
              <p className="text-white/40 text-xs">Loại phạt — hiển thị khi chọn tình trạng sách tương ứng</p>
              <div className="flex gap-3">
                <button
                  id="btn-confirm-add"
                  onClick={handleAdd}
                  disabled={adding}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition-all active:scale-95"
                >
                  {adding ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  id="btn-cancel-add"
                  onClick={handleCancelAdd}
                  disabled={adding}
                  className="px-5 py-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-semibold text-sm transition-all active:scale-95"
                >
                  Hủy
                </button>
              </div>
            </div>
            {addError && (
              <p id="add-error-msg" className="text-red-400 text-xs mt-2">{addError}</p>
            )}
          </div>
        )}

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Đang tải danh sách mức phạt...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={loadFineLevels}
                className="px-4 py-2 rounded-2xl border border-white/10 text-slate-300 hover:bg-white/[0.04] text-sm transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : fineLevels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-sm text-white/30">Chưa có mức phạt nào.</p>
            </div>
          ) : (
            <table id="fine-level-table" className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60 text-white/40 text-xs uppercase tracking-[0.2em] font-bold">
                  <th className="w-12 px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3 text-left">Tên mức phạt</th>
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Số tiền</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Phạt/Ngày</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Tối đa</th>
                  <th className="px-4 py-3 text-center hidden md:table-cell">Ngày phạt</th>
                  <th className="w-32 px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fineLevels.map((fine, index) => (
                  <tr
                    key={fine.id}
                    className={`transition-colors duration-150 ${editingId === fine.id
                      ? 'bg-cyan-950/20 border-l-2 border-cyan-500'
                      : 'hover:bg-white/[0.04]'
                      }`}
                  >
                    <td className="px-4 py-3 text-center text-white/30 font-mono text-xs">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      {editingId === fine.id ? (
                        <div className="space-y-1">
                          <input
                            id={`input-edit-name-${fine.id}`}
                            type="text"
                            value={editingName}
                            onChange={(e) => { setEditingName(e.target.value); setEditError('') }}
                            onKeyDown={(e) => handleEditKeyDown(e, fine.id)}
                            maxLength={25}
                            autoFocus
                            className={`w-full px-3 py-2 rounded-xl bg-slate-900/60 backdrop-blur border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${editError ? 'border-red-500' : 'border-cyan-500/40'}`}
                          />
                          {editError && (
                            <p className="text-red-400 text-xs">{editError}</p>
                          )}
                        </div>
                      ) : (
                        <button
                          id={`fine-name-${fine.id}`}
                          onClick={() => handleStartEdit(fine)}
                          title="Click để sửa"
                          className="group flex items-center gap-2 text-white hover:text-cyan-300 transition-colors text-left font-medium w-full"
                        >
                          {fine.name}
                          <span className="opacity-0 group-hover:opacity-60 text-xs transition-opacity">✏</span>
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {editingId === fine.id ? (
                        <select
                          value={editingFineType}
                          onChange={(e) => setEditingFineType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/60 backdrop-blur border border-cyan-500/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all [color-scheme:dark]"
                        >
                          <option value="ALL" className="bg-slate-900">Tất cả</option>
                          <option value="OVERDUE" className="bg-slate-900">Trả muộn</option>
                          <option value="DAMAGED" className="bg-slate-900">Hư hỏng</option>
                          <option value="LOST" className="bg-slate-900">Mất sách</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${fine.fineType === 'ALL' ? 'bg-slate-700/40 text-slate-400' :
                          fine.fineType === 'OVERDUE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                            fine.fineType === 'DAMAGED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                              fine.fineType === 'LOST' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                'bg-slate-700/40 text-slate-400'
                          }`}>
                          {{
                            ALL: 'Tất cả',
                            OVERDUE: 'Trả muộn',
                            DAMAGED: 'Hư hỏng',
                            LOST: 'Mất sách',
                          }[fine.fineType] || fine.fineType}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {editingId === fine.id ? (
                        <input
                          id={`input-edit-amount-${fine.id}`}
                          type="text"
                          value={formatNumberInput(editingAmount)}
                          onChange={(e) => { setEditingAmount(parseNumberInput(e.target.value)); setEditError('') }}
                          onKeyDown={(e) => handleEditKeyDown(e, fine.id)}
                          className={`w-full px-3 py-2 rounded-xl bg-slate-900/60 backdrop-blur border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${editError ? 'border-red-500' : 'border-cyan-500/40'}`}
                        />
                      ) : (
                        <span className="text-white font-mono">{formatCurrency(fine.amount)}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell">
                      {editingId === fine.id ? (
                        <input
                          id={`input-edit-amount-per-day-${fine.id}`}
                          type="text"
                          value={formatNumberInput(editingAmountPerDay)}
                          onChange={(e) => { setEditingAmountPerDay(parseNumberInput(e.target.value)); setEditError('') }}
                          onKeyDown={(e) => handleEditKeyDown(e, fine.id)}
                          placeholder="VNĐ/ngày"
                          className={`w-full px-3 py-2 rounded-xl bg-slate-900/60 backdrop-blur border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${editError ? 'border-red-500' : 'border-cyan-500/40'}`}
                        />
                      ) : (
                        <span className="text-white/60 font-mono text-xs">
                          {fine.amountPerDay ? `${formatCurrency(fine.amountPerDay)}/ngày` : '—'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell">
                      {editingId === fine.id ? (
                        <input
                          id={`input-edit-max-amount-${fine.id}`}
                          type="text"
                          value={formatNumberInput(editingMaxAmount)}
                          onChange={(e) => { setEditingMaxAmount(parseNumberInput(e.target.value)); setEditError('') }}
                          onKeyDown={(e) => handleEditKeyDown(e, fine.id)}
                          placeholder="VNĐ"
                          className={`w-full px-3 py-2 rounded-xl bg-slate-900/60 backdrop-blur border text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${editError ? 'border-red-500' : 'border-cyan-500/40'}`}
                        /> 
                      ) : (
                        <span className="text-white/60 font-mono text-xs">
                          {fine.maxAmount ? formatCurrency(fine.maxAmount) : '—'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-400 text-xs hidden md:table-cell">
                      {formatDate(fine.fineDate)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {editingId === fine.id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            id={`btn-save-${fine.id}`}
                            onClick={() => handleSaveEdit(fine.id)}
                            disabled={savingId === fine.id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50 transition-all"
                          >
                            {savingId === fine.id ? '...' : 'Lưu'}
                          </button>
                          <button
                            id={`btn-cancel-edit-${fine.id}`}
                            onClick={handleCancelEdit}
                            disabled={savingId === fine.id}
                            className="px-3 py-1.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-50 transition-all"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-delete-${fine.id}`}
                          onClick={() => handleDeleteClick(fine)}
                          className="px-3 py-1.5 rounded-xl bg-red-900/40 hover:bg-red-800/60 text-red-400 border border-red-700/40 text-xs font-semibold transition-all active:scale-95"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && fineLevels.length > 0 && (
          <p className="text-slate-500 text-xs text-right">
            Tổng cộng: <span className="text-slate-400 font-semibold">{fineLevels.length}</span> mức phạt
          </p>
        )}
      </div>

      {deletingFine && (
        <div
          id="modal-delete-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-delete-title" className="text-lg font-bold text-white text-center mb-2">
              Xác nhận xóa
            </h2>
            <p className="text-slate-400 text-sm text-center mb-4">
              Bạn có chắc muốn xóa mức phạt{' '}
              <span className="text-white font-semibold">"{deletingFine.name}"</span> không?
              <br />
              <span className="text-red-400 text-xs mt-1 inline-block">
                Hành động này không thể hoàn tác.
              </span>
            </p>

            {deleteError && (
              <div
                id="delete-error-msg"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-900/30 border border-red-700/40 text-red-300 text-sm mb-4"
              >
                <span className="font-bold">✗</span>
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                id="btn-cancel-delete"
                onClick={handleCancelDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                id="btn-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FineManagementPage
