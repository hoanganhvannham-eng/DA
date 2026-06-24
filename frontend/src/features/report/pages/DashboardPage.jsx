import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Users, Activity, Star, AlertTriangle, Shield, BarChart3, ArrowLeft, DollarSign } from 'lucide-react'
import { getDashboard } from '../services/reportService'
import BookStatsCard from '../components/BookStatsCard'
import ReaderStatsCard from '../components/ReaderStatsCard'
import TodayBorrowsCard from '../components/TodayBorrowsCard'
import TopBooksTable from '../components/TopBooksTable'
import OverdueReadersTable from '../components/OverdueReadersTable'
import FineStatsCard from '../components/FineStatsCard'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }

const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute top-[20%] right-[15%] w-[25%] h-[25%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
  </div>
)

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const data = await getDashboard()
        setDashboard(data)
      } catch (err) {
        const msg = err.response?.data?.message || 'Không thể tải dữ liệu dashboard'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <BackgroundBlobs />
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <BackgroundBlobs />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-red-500/20" style={{ boxShadow: '0 0 40px rgba(239,68,68,0.1)' }}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-indigo-600/20"
            >
              Thử lại
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  const emptySections = new Set(dashboard?.emptySections || [])

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 relative overflow-x-hidden">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-all duration-300 group mb-6"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Quay lại trang chủ
        </Link>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight" style={{ textShadow: '0 0 40px rgba(99,102,241,0.3)' }}>
                Báo cáo tổng quan
              </h1>
              <p className="text-slate-400 mt-1 flex items-center gap-2">
                <Shield size={16} className="text-cyan-500" />
                Dashboard dữ liệu hệ thống thư viện
              </p>
            </div>
            <Link
              to="/reports/detailed"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-indigo-600/20"
            >
              <BarChart3 size={18} />
              Báo cáo chi tiết
            </Link>
          </div>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          <motion.div variants={item}>
            <BookStatsCard
              bookStats={dashboard?.bookStats}
              isEmpty={emptySections.has('book_stats')}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <ReaderStatsCard
                readerStats={dashboard?.readerStats}
                isEmpty={emptySections.has('reader_stats')}
              />
            </motion.div>
            <motion.div variants={item}>
              <TodayBorrowsCard
                count={dashboard?.todayBorrows}
                isEmpty={emptySections.has('today_borrows')}
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <TopBooksTable
                books={dashboard?.topBooks || []}
                isEmpty={emptySections.has('top_books')}
              />
            </motion.div>
            <motion.div variants={item}>
              <OverdueReadersTable
                readers={dashboard?.overdueReaders || []}
                isEmpty={emptySections.has('overdue_readers')}
              />
            </motion.div>
          </div>

          <motion.div variants={item}>
            <FineStatsCard
              fineStats={dashboard?.fineStats}
              isEmpty={emptySections.has('fine_stats')}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage
