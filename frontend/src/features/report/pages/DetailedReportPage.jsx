import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Book, BarChart3, CircleDollarSign, AlertTriangle, Shield,
  Clock, Search, TrendingUp, DollarSign, ArrowLeft
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import dayjs from 'dayjs'
import { getDetailedReport } from '../services/reportService'
import { getCategories } from '../../book/services/categoryService'
import SummaryCard from '../components/SummaryCard'
import TabButton from '../components/TabButton'
import ChartContainer, { ChartGradients, CustomTooltip } from '../components/ChartContainer'
import { BookTable, BorrowReturnTable, FineTable, LostDamagedTable } from '../components/ReportTables'
import FilterBar from '../components/FilterBar'
import ExportButton from '../components/ExportButton'

const COLORS = ['#22d3ee', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6']

const TABS = [
  { key: 'BOOK', label: 'Sách', icon: Book },
  { key: 'BORROW_RETURN', label: 'Mượn Trả', icon: BarChart3 },
  { key: 'FINE', label: 'Phạt', icon: CircleDollarSign },
  { key: 'LOST_DAMAGED', label: 'Bồi Thường', icon: AlertTriangle },
]

const RANGE_MAP = { today: 'DAY', week: 'WEEK', month: 'MONTH', quarter: 'QUARTER', year: 'YEAR', custom: null }

const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute rounded-full blur-[80px] pointer-events-none w-[500px] h-[500px] bg-cyan-500/10 -top-40 -left-20 animate-pulse" />
    <div className="absolute rounded-full blur-[80px] pointer-events-none w-[600px] h-[600px] bg-violet-500/10 top-1/2 -translate-y-1/2 -right-20" />
    <div className="absolute rounded-full blur-[80px] pointer-events-none w-[400px] h-[400px] bg-indigo-500/10 -bottom-20 left-1/4 animate-pulse" style={{ animationDelay: '2s' }} />
  </div>
)

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const itemVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }

const DetailedReportPage = () => {
  const [activeType, setActiveType] = useState('BOOK')
  const [timeRange, setTimeRange] = useState(null)
  const [filters, setFilters] = useState({
    dateRange: 'month',
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    categoryId: '',
  })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories()
        if (res?.categories) setCategories(res.categories)
      } catch {
        // silently fail — category filter just won't show options
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getDetailedReport(activeType, timeRange)
        setReport(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải báo cáo')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [activeType, timeRange, filters.categoryId])

  const handleFilterChange = (newFilters) => {
    const prevRange = filters.dateRange
    setFilters(newFilters)
    if (newFilters.dateRange !== prevRange) {
      setTimeRange(RANGE_MAP[newFilters.dateRange])
    }
  }

  const d = report?.data
  const isEmpty = report && report.totalRecords === 0

  const renderSummaryCards = () => {
    if (!d) return null

    if (activeType === 'BOOK') {
      const cats = d.categories || []
      const totalBooks = cats.reduce((s, c) => s + c.totalBooks, 0)
      const totalBorrows = cats.reduce((s, c) => s + c.borrowCount, 0)
      return (
        <motion.div variants={containerVariants} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        >
          <SummaryCard title="Tổng thể loại" value={cats.length} icon={<Book />} color="cyan" variant={itemVariants} />
          <SummaryCard title="Tổng số sách" value={totalBooks} icon={<Book />} color="violet" variant={itemVariants} />
          <SummaryCard title="Tổng lượt mượn" value={totalBorrows} icon={<TrendingUp />} color="emerald" variant={itemVariants} />
        </motion.div>
      )
    }

    if (activeType === 'BORROW_RETURN') {
      const buckets = d.timeBuckets || []
      const totalBorrows = buckets.reduce((s, b) => s + b.borrows, 0)
      const totalReturns = buckets.reduce((s, b) => s + b.returns, 0)
      return (
        <motion.div variants={containerVariants} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          <SummaryCard title="Tổng đơn mượn" value={totalBorrows} icon={<BarChart3 />} color="cyan" variant={itemVariants} />
          <SummaryCard title="Tổng đơn trả" value={totalReturns} icon={<TrendingUp />} color="emerald" variant={itemVariants} />
        </motion.div>
      )
    }

    if (activeType === 'FINE') {
      const debtors = d.debtors || []
      const totalDebt = debtors.reduce((s, db) => s + db.totalOwed, 0)
      return (
        <motion.div variants={containerVariants} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        >
          <SummaryCard title="Tổng doanh thu" value={`${(d.totalRevenue || 0).toLocaleString()}đ`} icon={<DollarSign />} color="emerald" variant={itemVariants} />
          <SummaryCard title="Số người nợ" value={debtors.length} icon={<BarChart3 />} color="violet" variant={itemVariants} />
          <SummaryCard title="Tổng nợ" value={`${totalDebt.toLocaleString()}đ`} icon={<AlertTriangle />} color="rose" variant={itemVariants} />
        </motion.div>
      )
    }

    if (activeType === 'LOST_DAMAGED') {
      const records = d.records || []
      const lost = records.filter((r) => r.bookCondition === 'LOST').length
      const damaged = records.filter((r) => r.bookCondition === 'DAMAGED').length
      return (
        <motion.div variants={containerVariants} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          <SummaryCard title="Sách mất" value={lost} icon={<AlertTriangle />} color="rose" variant={itemVariants} />
          <SummaryCard title="Sách hư hỏng" value={damaged} icon={<AlertTriangle />} color="amber" variant={itemVariants} />
        </motion.div>
      )
    }
  }

  const renderCharts = () => {
    if (!d) return null

    if (activeType === 'BOOK') {
      const cats = d.categories || []
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ChartContainer title="Phân bố theo thể loại" icon={BarChart3}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cats}
                  cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8}
                  dataKey="totalBooks" nameKey="categoryName" stroke="none"
                >
                  {cats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Lượt mượn theo thể loại" icon={Book}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cats} layout="vertical" margin={{ left: 20, right: 30 }}>
                <ChartGradients />
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" />
                <YAxis dataKey="categoryName" type="category" width={100} tick={{ fontSize: 12, fill: 'white', opacity: 0.6 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="borrowCount" fill="url(#cyanGrad)" radius={[0, 8, 8, 0]} name="Số lần mượn" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )
    }

    if (activeType === 'BORROW_RETURN') {
      const buckets = d.timeBuckets || []
      return (
        <div className="grid grid-cols-1 gap-8 mb-12">
          <ChartContainer title="Xu hướng mượn trả" icon={Clock}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={buckets}>
                <ChartGradients />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" tickFormatter={(str) => dayjs(str).format('DD/MM')} stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="borrows" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#cyanGrad)" name="Mượn" />
                <Area type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#emeraldGrad)" name="Trả" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )
    }

    if (activeType === 'FINE') {
      const debtors = d.debtors || []
      if (!debtors.length) return null
      return (
        <div className="grid grid-cols-1 gap-8 mb-12">
          <ChartContainer title="Người nợ nhiều nhất" icon={CircleDollarSign}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={debtors.slice(0, 10)} margin={{ left: 20, right: 30 }}>
                <ChartGradients />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="readerName" tick={{ fontSize: 11, fill: 'white', opacity: 0.6 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="totalOwed" fill="url(#roseGrad)" radius={[6, 6, 0, 0]} name="Tổng nợ" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )
    }

    if (activeType === 'LOST_DAMAGED') {
      const records = d.records || []
      const lost = records.filter((r) => r.bookCondition === 'LOST').length
      const damaged = records.filter((r) => r.bookCondition === 'DAMAGED').length
      if (!lost && !damaged) return null
      return (
        <div className="grid grid-cols-1 gap-8 mb-12">
          <ChartContainer title="Tỷ lệ mất / hư hỏng" icon={AlertTriangle}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Mất', value: lost },
                    { name: 'Hư hỏng', value: damaged },
                  ]}
                  cx="50%" cy="50%" innerRadius={90} outerRadius={120} paddingAngle={10}
                  dataKey="value" stroke="none"
                >
                  <Cell fill="#f43f5e" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )
    }
  }

  const renderTable = () => {
    if (!d) return null

    if (activeType === 'BOOK') return <BookTable data={d} />
    if (activeType === 'BORROW_RETURN') return <BorrowReturnTable data={d} />
    if (activeType === 'FINE') return <FineTable data={d} />
    if (activeType === 'LOST_DAMAGED') return <LostDamagedTable data={d} />
  }

  const currentTab = TABS.find((t) => t.key === activeType)

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-inter pb-20">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-cyan-400 transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              Quay lại Dashboard
            </Link>
            <span className="text-cyan-400  font-bold tracking-[0.2em] text-xs uppercase mb-3 block">Library Analytics</span>
            <h1 className="text-5xl  font-black text-white" style={{ textShadow: '0 0 40px rgba(34,211,238,0.3)' }}>
              Báo cáo chi tiết
            </h1>
            <p className="text-white/40 mt-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Thống kê chi tiết theo loại báo cáo
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <ExportButton reportType={activeType} timeRange={timeRange} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 mb-10 shadow-2xl"
        >
          <FilterBar
            activeTab={activeType}
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
          />
        </motion.div>

        <div className="flex justify-center mb-12">
          <div className="bg-slate-900/60 backdrop-blur-xl p-2 rounded-3xl border border-white/10 flex gap-2">
            {TABS.map(({ key, label, icon }) => (
              <TabButton
                key={key}
                active={activeType === key}
                onClick={() => setActiveType(key)}
                icon={icon}
                label={label}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
                <div className="absolute inset-4 border-2 border-transparent border-b-violet-500 rounded-full animate-spin" />
              </div>
              <p className="mt-8 text-cyan-400  font-medium animate-pulse tracking-widest uppercase text-sm">Synchronizing Intelligence...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-red-500/20 max-w-md mx-auto"
              style={{ boxShadow: '0 0 40px rgba(239,68,68,0.1)' }}
            >
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
          ) : isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-[3rem] border border-dashed border-white/20 py-32 flex flex-col items-center justify-center text-white/40 shadow-inner"
            >
              <div className="w-24 h-24 bg-slate-900/60 backdrop-blur-xl rounded-full flex items-center justify-center mb-8 border border-white/10">
                <Search className="w-10 h-10 opacity-30" />
              </div>
              <h2 className="text-2xl  font-bold text-white/60 mb-2">Không có dữ liệu</h2>
              <p className="max-w-md text-center">{report?.message || 'Không có dữ liệu trong khoảng thời gian này'}</p>
            </motion.div>
          ) : d ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderSummaryCards()}
              {renderCharts()}

              <div className="flex items-center justify-between mb-8 mt-16 px-4">
                <h3 className="text-2xl  font-black text-white flex items-center gap-4">
                  Dữ liệu chi tiết
                  <div className="h-[2px] w-20 bg-gradient-to-r from-cyan-500 to-transparent" />
                </h3>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Shield size={14} />
                  Tổng số bản ghi: {report.totalRecords}
                </div>
              </div>

              {renderTable()}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DetailedReportPage
