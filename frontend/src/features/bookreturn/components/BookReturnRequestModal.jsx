import { useState, useEffect } from 'react'
import { createReturnRequest } from '../services/bookReturnService'
import { userService } from '../../user/services/userService'

export default function BookReturnRequestModal({ record, onClose, onSuccess }) {
  const [returnMethod, setReturnMethod] = useState('AT_LIBRARY')
  const [pickupAddress, setPickupAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // const isDelivery = record.fulfillmentMethod === 'DELIVERY'
  const isDelivery = true

  useEffect(() => {
    if (isDelivery && returnMethod === 'SHIPPING') {
      setProfileLoading(true)
      userService.getProfile()
        .then(profile => {
          if (profile.address) setPickupAddress(profile.address)
        })
        .catch(() => { })
        .finally(() => setProfileLoading(false))
    }
  }, [returnMethod, isDelivery])

  const handleSubmit = async () => {
    if (returnMethod === 'SHIPPING' && !pickupAddress.trim()) {
      setError('Vui lòng nhập địa chỉ lấy hàng')
      return
    }
    if (returnMethod === 'SHIPPING' && pickupAddress.length > 255) {
      setError('Địa chỉ tối đa 255 ký tự')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = {
        borrowRecordId: record.id,
        returnMethod,
        pickupAddress: returnMethod === 'SHIPPING' ? pickupAddress.trim() : null,
      }
      const result = await createReturnRequest(data)
      onSuccess(result)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tạo yêu cầu trả sách'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in-up">
        <h2 className="text-lg font-semibold text-white mb-4">Xin trả sách</h2>

        <div className="mb-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
          <p className="text-white font-medium truncate">{record.bookTitle}</p>
          {record.bookAuthor && (
            <p className="text-white/40 text-sm mt-1">{record.bookAuthor}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">Phương thức trả</label>
          <div className="space-y-2">
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${returnMethod === 'AT_LIBRARY' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
            >
              <input
                type="radio"
                name="returnMethod"
                value="AT_LIBRARY"
                checked={returnMethod === 'AT_LIBRARY'}
                onChange={() => setReturnMethod('AT_LIBRARY')}
                className="accent-cyan-500"
              />
              <div>
                <p className="text-white/80 text-sm font-medium">Trả tại thư viện</p>
                <p className="text-white/40 text-xs">Mang sách đến thư viện để nhân viên xác nhận</p>
              </div>
            </label>

            {isDelivery && (
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${returnMethod === 'SHIPPING' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
              >
                <input
                  type="radio"
                  name="returnMethod"
                  value="SHIPPING"
                  checked={returnMethod === 'SHIPPING'}
                  onChange={() => setReturnMethod('SHIPPING')}
                  className="accent-cyan-500"
                />
                <div>
                  <p className="text-white/80 text-sm font-medium">Gửi qua shipping</p>
                  <p className="text-white/40 text-xs">Nhân viên đến lấy sách tại địa chỉ của bạn</p>
                </div>
              </label>
            )}
          </div>
        </div>

        {returnMethod === 'SHIPPING' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1">Địa chỉ lấy hàng</label>
            {profileLoading ? (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-500" />
                Đang tải địa chỉ...
              </div>
            ) : (
              <textarea
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
                placeholder="Nhập địa chỉ lấy hàng"
                rows={2}
                maxLength={255}
                className="w-full bg-white/[0.03] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-cyan-500/50 placeholder-white/30 resize-none"
              />
            )}
            <p className="text-white/20 text-xs mt-1">Tối đa 255 ký tự</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-white/40 hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
            )}
            Xác nhận trả sách
          </button>
        </div>
      </div>
    </div>
  )
}
