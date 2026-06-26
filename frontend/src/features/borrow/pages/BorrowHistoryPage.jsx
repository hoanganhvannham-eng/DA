import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { getMyHistory, confirmDelivery, reportDeliveryIssue, cancelBorrow } from '../services/borrowService'
import BookReturnRequestModal from '../../bookreturn/components/BookReturnRequestModal'
import CancelConfirmModal from '../components/CancelConfirmModal'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } }

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'APPROVED_WAITING_PAYMENT', label: 'Đã duyệt — Chờ nạp tiền' },
  { value: 'AWAITING_PICKUP', label: 'Chờ lấy sách' },
  { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
  { value: 'RESERVED', label: 'Đã giữ sách' },
  { value: 'AWAITING_SHIPMENT', label: 'Chờ giao hàng' },
  { value: 'IN_DELIVERY', label: 'Đang giao' },
  { value: 'DELIVERED_PENDING', label: 'Đã giao — Chờ xác nhận' },
  { value: 'DELIVERY_ISSUE', label: 'Có vấn đề giao hàng' },
  { value: 'DELIVERY_FAILED', label: 'Giao thất bại' },
  { value: 'DELIVERY_LOST', label: 'Mất hàng (Delivery)' },
  { value: 'BORROWING', label: 'Đang mượn' },
  { value: 'OVERDUE', label: 'Quá hạn' },
  { value: 'RETURN_PENDING', label: 'Chờ xác nhận trả' },
  { value: 'RETURN_REQUESTED', label: 'Yêu cầu trả (Shipping)' },
  { value: 'RETURN_IN_TRANSIT', label: 'Đang vận chuyển trả' },
  { value: 'RETURN_RECEIVED', label: 'Đã nhận sách trả' },
  { value: 'RETURN_SHIPPING_FAILED', label: 'Gửi trả thất bại' },
  { value: 'RETURN_SHIPPING_LOST', label: 'Mất hàng (Return)' },
  { value: 'RETURNED', label: 'Đã trả' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

const STATUS_STYLES = {
  APPROVED_WAITING_PAYMENT: 'bg-amber-500/15 backdrop-blur-sm border-amber-500/30 text-amber-300',
  AWAITING_PICKUP: 'bg-teal-500/15 backdrop-blur-sm border-teal-500/30 text-teal-300',
  PENDING_APPROVAL: 'bg-yellow-500/15 backdrop-blur-sm border-yellow-500/30 text-yellow-300',
  RESERVED: 'bg-blue-500/15 backdrop-blur-sm border-blue-500/30 text-blue-300',
  AWAITING_SHIPMENT: 'bg-indigo-500/15 backdrop-blur-sm border-indigo-500/30 text-indigo-300',
  IN_DELIVERY: 'bg-cyan-500/15 backdrop-blur-sm border-cyan-500/30 text-cyan-300',
  DELIVERED_PENDING: 'bg-teal-500/15 backdrop-blur-sm border-teal-500/30 text-teal-300',
  DELIVERY_ISSUE: 'bg-orange-500/15 backdrop-blur-sm border-orange-500/30 text-orange-300',
  DELIVERY_FAILED: 'bg-red-500/15 backdrop-blur-sm border-red-500/30 text-red-300',
  DELIVERY_LOST: 'bg-rose-500/15 backdrop-blur-sm border-rose-500/30 text-rose-300',
  BORROWING: 'bg-green-500/15 backdrop-blur-sm border-green-500/30 text-green-300',
  OVERDUE: 'bg-red-500/15 backdrop-blur-sm border-red-500/30 text-red-300',
  RETURN_PENDING: 'bg-purple-500/15 backdrop-blur-sm border-purple-500/30 text-purple-300',
  RETURN_REQUESTED: 'bg-violet-500/15 backdrop-blur-sm border-violet-500/30 text-violet-300',
  RETURN_IN_TRANSIT: 'bg-fuchsia-500/15 backdrop-blur-sm border-fuchsia-500/30 text-fuchsia-300',
  RETURN_RECEIVED: 'bg-pink-500/15 backdrop-blur-sm border-pink-500/30 text-pink-300',
  RETURN_SHIPPING_FAILED: 'bg-rose-500/15 backdrop-blur-sm border-rose-500/30 text-rose-300',
  RETURN_SHIPPING_LOST: 'bg-red-500/15 backdrop-blur-sm border-red-500/30 text-red-400',
  RETURNED: 'bg-slate-500/15 backdrop-blur-sm border-slate-500/30 text-slate-300',
  REJECTED: 'bg-red-500/15 backdrop-blur-sm border-red-500/30 text-red-300',
  CANCELLED: 'bg-gray-500/15 backdrop-blur-sm border-gray-500/30 text-gray-400',
}

const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.filter(s => s.value).map(s => [s.value, s.label]))

const RISK_FLAG_LABELS = {
  R1: 'Đang mượn ≥4',
  R2: 'Trả muộn ≥2',
  R3: 'Phạt chờ xác nhận',
  R4: 'TK mới <7 ngày',
  R5: 'Cuốn cuối cùng',
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-800 text-gray-300 border-gray-600'
  const label = STATUS_LABELS[status] || status
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  )
}

function CountdownTimer({ targetTime, label }) {
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    if (!targetTime) return
    const target = new Date(targetTime).getTime()
    const update = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setRemaining('Đã hết hạn'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setRemaining(`${h}g ${m}p`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [targetTime])

  if (!remaining) return null
  return (
    <span className="text-sm text-yellow-400 font-medium">
      {label}: {remaining}
    </span>
  )
}

function renderStatusFields(record) {
  const fields = []
  const status = record.status

  if (record.borrowDate) {
    fields.push(
      <div key="borrowDate">
        <span className="text-white/40">Ngày mượn: </span>
        <span className="text-white/80">{new Date(record.borrowDate).toLocaleDateString('vi-VN')}</span>
      </div>
    )
  }

  switch (status) {
    case 'APPROVED_WAITING_PAYMENT':
      fields.push(
        <div key="depositInfo" className="sm:col-span-3">
          <span className="text-amber-400/80 text-xs">Đơn đã được duyệt — vui lòng nạp tiền vào ví để hệ thống tự động xử lý</span>
        </div>
      )
      break

    case 'AWAITING_PICKUP':
      if (record.pickupCode) {
        fields.push(
          <div key="pickupCode" className="sm:col-span-2 flex items-center gap-2">
            <span className="text-white/40">Mã nhận sách: </span>
            <span className="text-cyan-400 font-mono font-bold">{record.pickupCode}</span>
            <button
              onClick={() => navigator.clipboard.writeText(record.pickupCode)}
              className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              title="Sao chép mã"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
            </button>
          </div>
        )
        fields.push(
          <div key="pickupQR" className="sm:col-span-1">
            <QRCodeSVG value={record.pickupCode} size={64} bgColor="#ffffff" fgColor="#0f172a" />
          </div>
        )
      }
      fields.push(
        <div key="pickupNote" className="sm:col-span-3">
          <span className="text-teal-400/80 text-xs">Đến thư viện và đưa mã này cho nhân viên để nhận sách</span>
        </div>
      )
      break

    case 'PENDING_APPROVAL':
      fields.push(
        <div key="pendingUntil" className="sm:col-span-2">
          <CountdownTimer targetTime={record.pendingApprovalUntil} label="Tự động hủy sau" />
        </div>
      )
      if (record.riskFlags) {
        try {
          const flags = JSON.parse(record.riskFlags)
          if (Array.isArray(flags) && flags.length > 0) {
            fields.push(
              <div key="riskFlags" className="sm:col-span-3">
                <span className="text-white/40">Rủi ro: </span>
                {flags.map(f => (
                  <span key={f} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 backdrop-blur-sm text-red-300 border border-red-500/30 mr-1">
                    {RISK_FLAG_LABELS[f] || f}
                  </span>
                ))}
              </div>
            )
          }
        } catch {}
      }
      break

    case 'RESERVED':
      fields.push(
        <div key="reservedUntil" className="sm:col-span-2">
          <CountdownTimer targetTime={record.reservedUntil} label="Hết hạn giữ sách sau" />
        </div>
      )
      fields.push(
        <div key="reservedNote" className="sm:col-span-3">
          <span className="text-yellow-400/80 text-xs">Vui lòng đến thư viện nhận sách trước khi hết thời gian giữ</span>
        </div>
      )
      break

    case 'AWAITING_SHIPMENT':
      if (record.shippingAddress) {
        fields.push(
          <div key="address" className="sm:col-span-2">
            <span className="text-white/40">Địa chỉ giao: </span>
            <span className="text-white/80">{{
            IN_TRANSIT: 'Đang vận chuyển',
            DELIVERED: 'Đã giao',
            FAILED: 'Giao thất bại',
            LOST: 'Mất hàng',
            PENDING: 'Chờ xử lý',
            }[record.shippingStatus] || record.shippingStatus}</span>
          </div>
        )
      }
      break

    case 'IN_DELIVERY':
    case 'DELIVERED_PENDING':
      if (record.trackingNumber) {
        fields.push(
          <div key="tracking">
            <span className="text-white/40">Mã tracking: </span>
            <span className="text-cyan-400 font-mono">{record.trackingNumber}</span>
          </div>
        )
      }
      if (record.shippingStatus) {
        fields.push(
          <div key="shippingStatus">
            <span className="text-white/40">Vận chuyển: </span>
            <span className="text-white/80">{record.shippingStatus}</span>
          </div>
        )
      }
      if (record.shippingAddress) {
        fields.push(
          <div key="address" className="sm:col-span-2">
            <span className="text-white/40">Địa chỉ: </span>
            <span className="text-white/80">{record.shippingAddress}</span>
          </div>
        )
      }
      break

    case 'BORROWING':
      if (record.dueDate) {
        const due = new Date(record.dueDate)
        fields.push(
          <div key="dueDate">
            <span className="text-white/40">Hạn trả: </span>
            <span className="text-white/80">{due.toLocaleDateString('vi-VN')}</span>
          </div>
        )
      }
      if (record.remainingDays !== null && record.remainingDays !== undefined) {
        const color = record.remainingDays <= 3 ? 'text-red-400' : record.remainingDays <= 7 ? 'text-yellow-400' : 'text-green-400'
        fields.push(
          <div key="remaining">
            <span className="text-white/40">Còn lại: </span>
            <span className={`font-medium ${color}`}>{record.remainingDays} ngày</span>
          </div>
        )
      }
      break

    case 'OVERDUE':
      if (record.overdueDays) {
        fields.push(
          <div key="overdue">
            <span className="text-white/40">Quá hạn: </span>
            <span className="text-red-400 font-medium">{record.overdueDays} ngày</span>
          </div>
        )
      }
      if (record.dueDate) {
        fields.push(
          <div key="dueDate">
            <span className="text-white/40">Hạn trả: </span>
            <span className="text-white/80">{new Date(record.dueDate).toLocaleDateString('vi-VN')}</span>
          </div>
        )
      }
      break

    case 'RETURN_PENDING':
      fields.push(
        <div key="returnMethod">
          <span className="text-white/40">Phương thức trả: </span>
          <span className="text-white/80">{record.returnMethod === 'SHIPPING' ? 'Gửi qua shipping' : 'Trả tại thư viện'}</span>
        </div>
      )
      break

    case 'RETURN_REQUESTED':
    case 'RETURN_IN_TRANSIT':
    case 'RETURN_SHIPPING_FAILED':
    case 'RETURN_SHIPPING_LOST':
      fields.push(
        <div key="returnMethod">
          <span className="text-white/40">Phương thức trả: </span>
          <span className="text-white/80">Gửi qua shipping</span>
        </div>
      )
      if (record.pickupAddress) {
        fields.push(
          <div key="address" className="sm:col-span-2">
            <span className="text-white/40">Địa chỉ lấy: </span>
            <span className="text-white/80">{record.pickupAddress}</span>
          </div>
        )
      }
      if (record.trackingNumber) {
        fields.push(
          <div key="tracking">
            <span className="text-white/40">Tracking: </span>
            <span className="text-cyan-400 font-mono">{record.trackingNumber}</span>
          </div>
        )
      }
      if (record.returnAttemptCount !== null && record.returnAttemptCount !== undefined) {
        fields.push(
          <div key="attempt">
            <span className="text-white/40">Lần gửi: </span>
            <span className="text-white/80">{record.returnAttemptCount}/3</span>
          </div>
        )
      }
      if (record.returnLostResolution) {
        fields.push(
          <div key="resolution">
            <span className="text-white/40">Kết quả: </span>
            <span className="text-white/80">{record.returnLostResolution === 'CARRIER_FAULT' ? 'Lỗi carrier' : 'Lỗi độc giả'}</span>
          </div>
        )
      }
      break

    case 'RETURN_RECEIVED':
      fields.push(
        <div key="returnMethod">
          <span className="text-white/40">Phương thức trả: </span>
          <span className="text-white/80">Gửi qua shipping</span>
        </div>
      )
      break

    case 'RETURNED':
      if (record.actualBorrowDate) {
        fields.push(
          <div key="actualBorrowDate">
            <span className="text-white/40">Ngày mượn: </span>
            <span className="text-white/80">{new Date(record.actualBorrowDate).toLocaleDateString('vi-VN')}</span>
          </div>
        )
      }
      if (record.returnedAt) {
        fields.push(
          <div key="returnedAt">
            <span className="text-white/40">Ngày trả: </span>
            <span className="text-white/80">{new Date(record.returnedAt).toLocaleDateString('vi-VN')}</span>
          </div>
        )
      }
      break

    case 'REJECTED':
      if (record.rejectionReason) {
        fields.push(
          <div key="reason" className="sm:col-span-3">
            <span className="text-white/40">Lý do: </span>
            <span className="text-red-400">{record.rejectionReason}</span>
          </div>
        )
      }
      break

    case 'CANCELLED':
      break

    default:
      if (record.fulfillmentMethod === 'DELIVERY' && !['RETURNED', 'IN_DELIVERY', 'DELIVERED_PENDING'].includes(status)) {
        if (record.trackingNumber) {
          fields.push(
            <div key="tracking">
              <span className="text-white/40">Tracking: </span>
              <span className="text-cyan-400 font-mono">{record.trackingNumber}</span>
            </div>
          )
        }
        if (record.shippingStatus) {
          fields.push(
            <div key="shippingStatus">
              <span className="text-white/40">Vận chuyển: </span>
              <span className="text-white/80">{record.shippingStatus}</span>
            </div>
          )
        }
      }
      break
  }

  return fields
}

function renderActionButtons(record, onReturnClick, onConfirmDelivery, onReportIssue, onCancelClick) {
  const btns = []
  const status = record.status

  switch (status) {
    case 'APPROVED_WAITING_PAYMENT':
    case 'AWAITING_PICKUP':
      btns.push(
        <button key="cancel" onClick={() => onCancelClick(record)} className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/5 text-white/60 border border-white/10 hover:text-white hover:bg-white/10 transition-all duration-200">
          Hủy đơn
        </button>
      )
      break
    case 'PENDING_APPROVAL':
    case 'RESERVED':
    case 'AWAITING_SHIPMENT':
      btns.push(
        <button key="cancel" onClick={() => onCancelClick(record)} className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/5 text-white/60 border border-white/10 hover:text-white hover:bg-white/10 transition-all duration-200">
          Hủy đơn
        </button>
      )
      break
    case 'BORROWING':
      btns.push(
        <button key="extend" disabled className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/5 text-white/20 cursor-not-allowed transition-all duration-200">
          Gia hạn
        </button>,
        <button key="return" onClick={() => onReturnClick(record)} className="px-3 py-1.5 text-xs font-medium rounded-xl bg-cyan-500/90 text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all duration-200">
          Xin trả sách
        </button>
      )
      break
    case 'OVERDUE':
      btns.push(
        <button key="return" onClick={() => onReturnClick(record)} className="px-3 py-1.5 text-xs font-medium rounded-xl bg-cyan-500/90 text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all duration-200">
          Xin trả sách
        </button>
      )
      break
    case 'DELIVERED_PENDING':
      btns.push(
        <button key="confirm" onClick={() => onConfirmDelivery(record)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-cyan-500/90 text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all duration-200">
          Đã nhận sách
        </button>,
        <button key="issue" onClick={() => onReportIssue(record)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/5 text-white/60 border border-white/10 hover:text-white hover:bg-white/10 transition-all duration-200">
          Tôi chưa nhận
        </button>
      )
      break
    case 'REJECTED':
      if (record.rejectionReason) {
        btns.push(
          <button key="viewReason" disabled className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white/5 text-white/20 cursor-not-allowed transition-all duration-200">
            Xem lý do
          </button>
        )
      }
      break
  }

  return btns
}

function BorrowRecordCard({ record, onReturnClick, onConfirmDelivery, onReportIssue, onCancelClick, onShowDetail }) {
  const status = record.status

  return (
    <motion.div variants={itemVariants} style={{ perspective: 1000 }}>
      <div
        onClick={() => onShowDetail(record)}
        className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 cursor-pointer"><div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white truncate">{record.bookTitle}</h3>
            {record.bookAuthor && (
              <p className="text-sm text-white/50 mt-0.5">{record.bookAuthor}</p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {renderStatusFields(record)}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {renderActionButtons(record, onReturnClick, onConfirmDelivery, onReportIssue, onCancelClick)}
        </div>
      </div>
    </motion.div>
  )
}

const ISSUE_TYPES = [
  { value: 'NOT_RECEIVED', label: 'Chưa nhận được sách' },
  { value: 'DAMAGED_PACKAGE', label: 'Gói hàng bị hư hỏng' },
  { value: 'WRONG_ADDRESS', label: 'Giao sai địa chỉ' },
  { value: 'OTHER', label: 'Khác' },
]

function ReportIssueModal({ record, onSubmit, onClose }) {
  const [issueType, setIssueType] = useState('NOT_RECEIVED')
  const [issueDescription, setIssueDescription] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!issueDescription.trim()) {
      setError('Vui lòng mô tả vấn đề')
      return
    }
    if (issueDescription.length > 500) {
      setError('Mô tả tối đa 500 ký tự')
      return
    }
    setError('')
    setSubmitting(true)
    await onSubmit(issueType, issueDescription.trim())
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-1">Báo cáo vấn đề giao hàng</h3>
        <p className="text-sm text-white/50 mb-4">
          Sách: <span className="text-white/80">{record.bookTitle}</span>
        </p>

        <div className="mb-4">
          <label className="block text-sm text-white/50 mb-1">Loại vấn đề</label>
          <select value={issueType} onChange={e => setIssueType(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-white/[0.03] border border-white/10 text-white/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
            {ISSUE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white/50 mb-1">Mô tả chi tiết</label>
          <textarea value={issueDescription} onChange={e => setIssueDescription(e.target.value)}
                    rows={4} maxLength={500} placeholder="Vui lòng mô tả vấn đề bạn gặp phải..."
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-white/[0.03] border border-white/10 text-white/80 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-white/30" />
          <div className="text-xs text-white/30 text-right mt-1">{issueDescription.length}/500</div>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={submitting}
                  className="px-4 py-2 text-sm rounded-xl bg-white/5 text-white/60 border border-white/10 hover:text-white hover:bg-white/10 transition-all duration-200">
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={submitting}
                  className="px-4 py-2 text-sm rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 transition-all duration-200">
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BorrowHistoryPage() {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [returnModalRecord, setReturnModalRecord] = useState(null)
  const [returnSuccessMsg, setReturnSuccessMsg] = useState(null)
  const [issueModalRecord, setIssueModalRecord] = useState(null)
  const [cancelModalRecord, setCancelModalRecord] = useState(null)
  const [notificationMsg, setNotificationMsg] = useState(null)
  const [notificationType, setNotificationType] = useState('success')
  const [detailRecord, setDetailRecord] = useState(null)
  const size = 10

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyHistory({ status: statusFilter || undefined, page, size })
      setRecords(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử mượn sách')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page, size])

  const handleConfirmDelivery = async (record) => {
    try {
      const result = await confirmDelivery(record.id)
      setNotificationType('success')
      setNotificationMsg(result.message || 'Xác nhận nhận sách thành công')
      fetchHistory()
    } catch (err) {
      setNotificationType('error')
      setNotificationMsg(err.response?.data?.message || 'Xác nhận thất bại, vui lòng thử lại')
    }
  }

  const handleCancelBorrow = async (borrowId) => {
    try {
      const result = await cancelBorrow(borrowId)
      setCancelModalRecord(null)
      setNotificationType('success')
      setNotificationMsg(result.message || 'Hủy đơn mượn thành công')
      fetchHistory()
    } catch (err) {
      setNotificationType('error')
      setNotificationMsg(err.response?.data?.message || 'Hủy đơn thất bại, vui lòng thử lại')
    }
  }

  const handleReportIssue = async (record, issueType, issueDescription) => {
    try {
      const result = await reportDeliveryIssue(record.id, issueType, issueDescription)
      setIssueModalRecord(null)
      setNotificationType('success')
      setNotificationMsg(result.message || 'Đã gửi báo cáo vấn đề')
      fetchHistory()
    } catch (err) {
      setNotificationType('error')
      setNotificationMsg(err.response?.data?.message || 'Gửi báo cáo thất bại, vui lòng thử lại')
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    setPage(0)
  }, [statusFilter])

  useEffect(() => {
    if (!notificationMsg && !returnSuccessMsg) return
    const timer = setTimeout(() => {
      setReturnSuccessMsg(null)
      setNotificationMsg(null)
    }, 5000)
    return () => clearTimeout(timer)
  }, [notificationMsg, returnSuccessMsg])

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 text-sm transition-all duration-200 group mb-4"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-black font-heading" style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
            Lịch sử mượn sách
          </h1>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white/80 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-500/30 border-t-cyan-400" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4 text-center">
            {error}
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 text-white/10">📖</div>
            <p className="text-white/60 text-lg">Bạn chưa có lịch sử mượn sách</p>
            <p className="text-white/30 text-sm mt-1">Hãy khám phá và mượn những cuốn sách yêu thích</p>
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <>
            <div className="mb-3 text-white/40 label-cyber">
              Tổng số: {total} đơn mượn
            </div>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
              {records.map(record => (
                <BorrowRecordCard
                  key={record.id}
                  record={record}
                  onReturnClick={(rec) => setReturnModalRecord(rec)}
                  onConfirmDelivery={handleConfirmDelivery}
                  onReportIssue={(rec) => setIssueModalRecord(rec)}
                  onCancelClick={(rec) => setCancelModalRecord(rec)}
                  onShowDetail={(rec) => setDetailRecord(rec)}
                />
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:bg-slate-900/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-1.5 text-sm rounded-xl border transition-all duration-200 ${
                      page === i
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                        : 'bg-slate-900/60 backdrop-blur-xl border-white/10 text-white/60 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-sm rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:bg-slate-900/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}

        {(returnSuccessMsg || notificationMsg) && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl text-sm border bg-slate-900/80 backdrop-blur-xl ${
              notificationType === 'error'
                ? 'border-red-500/30 text-red-300'
                : 'border-emerald-500/30 text-emerald-300'
            }`}
          >
            {notificationMsg || returnSuccessMsg}
            <button onClick={() => { setReturnSuccessMsg(null); setNotificationMsg(null) }} className="ml-3 hover:text-white/80">&times;</button>
          </motion.div>
        )}
      </div>

      {returnModalRecord && (
        <BookReturnRequestModal
          record={returnModalRecord}
          onClose={() => setReturnModalRecord(null)}
          onSuccess={(result) => {
            setReturnModalRecord(null)
            setReturnSuccessMsg(result.message || 'Tạo yêu cầu trả sách thành công')
            fetchHistory()
          }}
        />
      )}

      {issueModalRecord && (
        <ReportIssueModal
          record={issueModalRecord}
          onSubmit={(issueType, issueDescription) => handleReportIssue(issueModalRecord, issueType, issueDescription)}
          onClose={() => setIssueModalRecord(null)}
        />
      )}

      {cancelModalRecord && (
        <CancelConfirmModal
          record={cancelModalRecord}
          onSubmit={handleCancelBorrow}
          onClose={() => setCancelModalRecord(null)}
        />
      )}
      {detailRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setDetailRecord(null)}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{detailRecord.bookTitle}</h2>
                {detailRecord.bookAuthor && <p className="text-white/40 text-sm mt-0.5">{detailRecord.bookAuthor}</p>}
              </div>
              <button onClick={() => setDetailRecord(null)} className="text-white/40 hover:text-white transition-colors ml-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Thông tin đơn</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-white/40">Trạng thái:</span>
                  <StatusBadge status={detailRecord.status} />
                </div>
                {detailRecord.fulfillmentMethod && (
                  <div className="mt-1.5">
                    <span className="text-white/40">Phương thức: </span>
                    <span className="text-white/70">{detailRecord.fulfillmentMethod === 'DELIVERY' ? 'Giao hàng' : 'Nhận tại thư viện'}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1.5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Thời gian</p>
                {detailRecord.createdAt && (
                  <div><span className="text-white/40">Ngày tạo: </span><span className="text-white/70">{new Date(detailRecord.createdAt).toLocaleString('vi-VN')}</span></div>
                )}
                {detailRecord.borrowDate && (
                  <div><span className="text-white/40">Ngày mượn: </span><span className="text-white/70">{new Date(detailRecord.borrowDate).toLocaleDateString('vi-VN')}</span></div>
                )}
                {detailRecord.dueDate && (
                  <div><span className="text-white/40">Hạn trả: </span><span className="text-white/70">{new Date(detailRecord.dueDate).toLocaleDateString('vi-VN')}</span></div>
                )}
                {detailRecord.returnedAt && (
                  <div><span className="text-white/40">Ngày trả: </span><span className="text-white/70">{new Date(detailRecord.returnedAt).toLocaleDateString('vi-VN')}</span></div>
                )}
              </div>

              {detailRecord.pickupCode && (
                <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Mã nhận sách</p>
                  <div className="flex items-center gap-4">
                    <QRCodeCanvas
                    id="qr-canvas-download"
                    value={detailRecord.pickupCode}
                    size={80}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                    <div>
                      <span className="text-cyan-400 font-mono font-bold text-lg block">{detailRecord.pickupCode}</span>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => navigator.clipboard.writeText(detailRecord.pickupCode)}
                          className="px-2 py-1 text-xs rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                        >
                          Sao chép
                        </button>
                        <button
                          onClick={() => {
                            const canvas = document.getElementById('qr-canvas-download')
                            if (!canvas) return
                            const url = canvas.toDataURL('image/png')
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `QR-${detailRecord.pickupCode}.png`
                            a.click()
                          }}
                          className="px-2 py-1 text-xs rounded-lg bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          Lưu ảnh
                        </button>
                      </div>
                      <p className="text-white/30 text-xs mt-1">Đưa mã này cho nhân viên thư viện</p>
                    </div>
                  </div>
                </div>
              )}

              {detailRecord.rejectionReason && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Lý do từ chối</p>
                  <p className="text-rose-300 text-sm">{detailRecord.rejectionReason}</p>
                </div>
              )}
              {(detailRecord.trackingNumber || detailRecord.shippingAddress || detailRecord.shippingStatus) && (
                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1.5">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Vận chuyển</p>
                  {detailRecord.trackingNumber && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">Mã tracking: </span>
                      <span className="text-cyan-400 font-mono">{detailRecord.trackingNumber}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(detailRecord.trackingNumber)}
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        title="Sao chép"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {detailRecord.shippingStatus && (
                    <div><span className="text-white/40">Trạng thái vận chuyển: </span><span className="text-white/70">{{
                      IN_TRANSIT: 'Đang vận chuyển',
                      DELIVERED: 'Đã giao',
                      FAILED: 'Giao thất bại',
                      LOST: 'Mất hàng',
                      PENDING: 'Chờ xử lý',
                    }[detailRecord.shippingStatus] || detailRecord.shippingStatus}</span></div>
                  )}
                  {detailRecord.shippingAddress && (
                    <div><span className="text-white/40">Địa chỉ giao: </span><span className="text-white/70">{detailRecord.shippingAddress}</span></div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={() => setDetailRecord(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
