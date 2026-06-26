import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PendingApprovalTab from '../components/PendingApprovalTab'
import AwaitingShipmentTab from '../../shipping/components/AwaitingShipmentTab'
import DeliveryIssuesTab from '../../shipping/components/DeliveryIssuesTab'
import ReturnRequestedTab from '../../bookreturn/components/ReturnRequestedTab'
import ReturnIssuesTab from '../../bookreturn/components/ReturnIssuesTab'
const TABS = [
  { id: 'pending', label: 'Chờ duyệt', icon: '⏳' },
  { id: 'shipping', label: 'Chờ giao hàng', icon: '🚚' },
  { id: 'return-requested', label: 'Chờ gửi trả', icon: '📬' },
  { id: 'delivery-issues', label: 'Vấn đề giao hàng', icon: '⚠️' },
  { id: 'return-issues', label: 'Vấn đề trả sách', icon: '❌' },
]
const tabVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } },
}

const renderTab = (activeTab, refreshTrigger, onRefresh) => {
  switch (activeTab) {
    case 'pending': return <PendingApprovalTab refreshTrigger={refreshTrigger} onRefresh={onRefresh} />
    case 'shipping': return <AwaitingShipmentTab refreshTrigger={refreshTrigger} onRefresh={onRefresh} />
    case 'return-requested': return <ReturnRequestedTab refreshTrigger={refreshTrigger} onRefresh={onRefresh} />
    case 'delivery-issues': return <DeliveryIssuesTab refreshTrigger={refreshTrigger} onRefresh={onRefresh} />
    case 'return-issues': return <ReturnIssuesTab refreshTrigger={refreshTrigger} onRefresh={onRefresh} />
    default: return null
  }
}

const BorrowManagementPage = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1)

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-y-auto custom-scrollbar">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] animate-blob-drift opacity-60">
        <div className="h-full w-full rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] animate-blob-drift opacity-60" style={{ animationDelay: '-6s' }}>
        <div className="h-full w-full rounded-full bg-violet-500/10 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8" style={{ perspective: '1000px' }}>
        {/* Breadcrumb */}
        <Link
          to="/"
          className="group mb-6 inline-flex items-center gap-2 text-sm text-white/40 transition-all duration-200 hover:text-cyan-400"
        >
          <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại trang chủ
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-glow-cyan">Quản lý mượn trả</h1>
          <p className="mt-1 text-sm text-white/40">Xử lý yêu cầu mượn sách và xác nhận trả sách</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 rounded-2xl border border-white/5 bg-slate-900/60 p-1.5 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <div className="grid min-w-[500px] grid-cols-5 gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'text-white/40 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderTab(activeTab, refreshTrigger, handleRefresh)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default BorrowManagementPage
