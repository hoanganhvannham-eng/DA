import React, { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { createBorrowRequest, getRentalRates, getDepositPolicies } from '../services/borrowService'
import { getWallet } from '../../wallet/services/walletService'
import { formatCurrency } from '../../../shared/utils/formatUtils'
import TopUpModal from '../../wallet/components/TopUpModal'

const BorrowModal = ({ bookId, bookTitle, replacementPrice, depositPolicyId, customDepositRate, onClose, onSuccess }) => {
  const [showTopUp, setShowTopUp] = useState(false)
  const [durationDays, setDurationDays] = useState(14)
  const [fulfillmentMethod, setFulfillmentMethod] = useState('AT_LIBRARY')
  const [shippingAddress, setShippingAddress] = useState('')
  const [addressError, setAddressError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const [rentalRates, setRentalRates] = useState([])
  const [depositPolicies, setDepositPolicies] = useState([])
  const [wallet, setWallet] = useState(null)

  const fetchWalletOnly = async () => {
    try {
      const walletData = await getWallet()
      setWallet(walletData)
    } catch {
      // silent fail
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rates, policies, walletData] = await Promise.all([
          getRentalRates(),
          getDepositPolicies(),
          getWallet(),
        ])
        setRentalRates(Array.isArray(rates) ? rates : [])
        setDepositPolicies(Array.isArray(policies) ? policies : [])
        setWallet(walletData)
      } catch {
        // silent fail - wallet info is optional display
      }
    }
    fetchData()
  }, [])

  const findMatchingRate = () => {
    return rentalRates.find(
      r => durationDays >= r.minDays && durationDays <= r.maxDays
    )
  }

  const getDepositRate = () => {
    if (customDepositRate !== null && customDepositRate !== undefined) {
      return Number(customDepositRate)
    }
    if (!depositPolicies.length || !depositPolicyId) return 20
    const policy = depositPolicies.find(p => p.id === depositPolicyId)
    return policy ? Number(policy.depositRate) : 20
  }

  const matchingRate = findMatchingRate()
  const rentalFee = matchingRate ? Number(matchingRate.fee) : 0
  const depositRate = getDepositRate()
  const depositAmount = replacementPrice ? (replacementPrice * depositRate) / 100 : 0
  const frozenAmount = (replacementPrice || 0) + depositAmount
  const totalRequired = rentalFee + frozenAmount
  const availableBalance = wallet ? Number(wallet.availableBalance) : 0
  const hasEnoughBalance = availableBalance >= totalRequired

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setAddressError('')

    if (durationDays > 30) {
      setError('Thời hạn mượn tối đa 30 ngày')
      return
    }

    if (fulfillmentMethod === 'DELIVERY' && !shippingAddress.trim()) {
      setAddressError('Vui lòng nhập địa chỉ giao hàng')
      return
    }
    if (fulfillmentMethod === 'DELIVERY' && shippingAddress.trim().length > 255) {
      setAddressError('Địa chỉ tối đa 255 ký tự')
      return
    }

    setSubmitting(true)
    try {
      const data = {
        bookId,
        durationDays,
        fulfillmentMethod,
        shippingAddress: fulfillmentMethod === 'DELIVERY' ? shippingAddress.trim() : null,
      }
      const response = await createBorrowRequest(data)
      setResult(response)
      if (onSuccess) onSuccess(response)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tạo yêu cầu mượn sách'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="text-center space-y-4">
            <div className="text-5xl">⏳</div>
            <h3 className="text-xl font-bold text-white">{result.message || 'Tạo yêu cầu mượn thành công'}</h3>
            <p className="text-white/60 text-sm">
              Yêu cầu mượn sách của bạn đang chờ nhân viên thư viện xác nhận.
              Vui lòng theo dõi trạng thái trong lịch sử mượn sách.
            </p>
            {result.pickupCode && (
              <div className="bg-white/[0.05] rounded-xl p-4 flex flex-col items-center gap-3">
                <p className="text-xs text-white/40">Mã nhận sách:</p>
                <p className="text-lg font-mono font-bold text-cyan-400">{result.pickupCode}</p>
                <QRCodeCanvas
                  id="borrow-result-qr-canvas"
                  value={result.pickupCode}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
                <button
                  type="button"
                  onClick={() => {
                    const canvas = document.getElementById('borrow-result-qr-canvas')
                    if (!canvas) return
                    const url = canvas.toDataURL('image/png')
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `QR-${result.pickupCode}.png`
                    a.click()
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                >
                  Lưu ảnh mã QR
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-white/5 text-white/40 transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Mượn sách</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 mb-5">
          <p className="text-sm text-white font-medium truncate">{bookTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Thời hạn mượn (ngày)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={durationDays}
              onChange={e => setDurationDays(parseInt(e.target.value) || 14)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-cyan-500/20"
            />
            <p className="text-xs text-white/30 mt-1">Tối thiểu 1, tối đa 30 ngày.</p>
          </div>

          {matchingRate && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Gói thuê:</span>
                <span className="text-white">{matchingRate.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Phí thuê:</span>
                <span className="text-cyan-400 font-semibold">{formatCurrency(rentalFee)}</span>
              </div>
            </div>
          )}

          {replacementPrice > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Giá trị sách:</span>
                <span className="text-white">{formatCurrency(replacementPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Tỷ lệ cọc:</span>
                <span className="text-white">{depositRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Tiền cọc:</span>
                <span className="text-amber-400 font-semibold">{formatCurrency(depositAmount)}</span>
              </div>
            </div>
          )}

          {replacementPrice > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Giá sách (bị phong toả):</span>
                <span className="text-white">{formatCurrency(replacementPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Tổng tiền phong toả:</span>
                <span className="text-cyan-400 font-semibold">{formatCurrency(frozenAmount)}</span>
              </div>
            </div>
          )}

          {wallet && (
            <div className={`rounded-xl p-3 border ${hasEnoughBalance ? 'bg-white/[0.03] border-white/5' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Số dư khả dụng:</span>
                <span className={`font-semibold ${hasEnoughBalance ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {formatCurrency(availableBalance)}
                </span>
              </div>
              {!hasEnoughBalance && totalRequired > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTopUp(true)}
                  className="mt-2 w-full py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-colors"
                >
                  Nạp thêm tiền
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Phương thức nhận sách</label>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${fulfillmentMethod === 'AT_LIBRARY'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'border-white/10 bg-white/[0.03]'
                }`}>
                <input
                  type="radio"
                  name="fulfillmentMethod"
                  value="AT_LIBRARY"
                  checked={fulfillmentMethod === 'AT_LIBRARY'}
                  onChange={() => setFulfillmentMethod('AT_LIBRARY')}
                  className="sr-only"
                />
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${fulfillmentMethod === 'AT_LIBRARY' ? 'border-cyan-500/50' : 'border-white/20'
                  }`}>
                  {fulfillmentMethod === 'AT_LIBRARY' && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Nhận tại thư viện</p>
                  <p className="text-xs text-white/40">Đến thư viện để nhận sách trực tiếp</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${fulfillmentMethod === 'DELIVERY'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'border-white/10 bg-white/[0.03]'
                }`}>
                <input
                  type="radio"
                  name="fulfillmentMethod"
                  value="DELIVERY"
                  checked={fulfillmentMethod === 'DELIVERY'}
                  onChange={() => setFulfillmentMethod('DELIVERY')}
                  className="sr-only"
                />
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${fulfillmentMethod === 'DELIVERY' ? 'border-cyan-500/50' : 'border-white/20'
                  }`}>
                  {fulfillmentMethod === 'DELIVERY' && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Giao tận nơi</p>
                  <p className="text-xs text-white/40">Sách được giao đến địa chỉ của bạn</p>
                </div>
              </label>
            </div>
          </div>

          {fulfillmentMethod === 'DELIVERY' && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Địa chỉ giao hàng</label>
              <textarea
                value={shippingAddress}
                onChange={e => { setShippingAddress(e.target.value); setAddressError('') }}
                placeholder="Nhập địa chỉ giao hàng..."
                rows={3}
                maxLength={255}
                className={`w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none placeholder-white/30 ${addressError ? 'border-rose-500/50' : 'border-white/10'
                  }`}
              />
              {addressError && <p className="text-xs text-red-400 mt-1">{addressError}</p>}
              <p className="text-xs text-slate-500 mt-1">{shippingAddress.length}/255</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || (wallet && !hasEnoughBalance)}
            className="w-full py-3 rounded-xl bg-cyan-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/30"
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận mượn sách'}
          </button>
        </form>
      </div>

      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          returnUrl={`/books/${bookId}?resumeBorrow=true`}
        />
      )}
    </div>
  )
}

export default BorrowModal