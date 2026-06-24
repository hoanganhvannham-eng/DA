import { useState, useCallback } from 'react'
import { FileDown, Download, RefreshCw } from 'lucide-react'
import { requestExport, getExportStatus, downloadExport, retryExport } from '../services/reportService'

const ExportButton = ({ reportType, timeRange }) => {
  const [exportState, setExportState] = useState('idle')
  const [exportId, setExportId] = useState(null)
  const [message, setMessage] = useState('')

  const pollStatus = useCallback(async (id) => {
    const poll = async () => {
      try {
        const status = await getExportStatus(id)
        if (status.status === 'READY') {
          setExportState('ready')
          setExportId(id)
          setMessage('File CSV đã sẵn sàng để tải về')
        } else if (status.status === 'FAILED') {
          setExportState('failed')
          setMessage(status.message || 'Xuất báo cáo thất bại')
        } else {
          setTimeout(poll, 3000)
        }
      } catch {
        setExportState('error')
        setMessage('Lỗi kiểm tra trạng thái xuất báo cáo')
      }
    }
    setTimeout(poll, 3000)
  }, [])

  const handleExport = async () => {
    try {
      setExportState('submitting')
      const result = await requestExport(reportType, timeRange)
      setExportId(result.exportId)
      setExportState('polling')
      setMessage('Đang xử lý xuất báo cáo...')
      pollStatus(result.exportId)
    } catch (err) {
      const msg = err.response?.data?.message || 'Xuất báo cáo thất bại'
      setMessage(msg)
      setExportState('error')
    }
  }

  const handleDownload = async () => {
    try {
      const blob = await downloadExport(exportId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setMessage('Tải file thất bại')
    }
  }

  const handleRetry = async () => {
    try {
      const result = await retryExport(exportId)
      setExportState('polling')
      setMessage('Đang xử lý lại...')
      pollStatus(result.exportId)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Thử lại thất bại')
    }
  }

  return (
    <div className="flex items-center gap-3">
      {exportState === 'idle' && (
        <button onClick={handleExport}
          className="group flex items-center gap-3 px-8 py-4 bg-slate-900/70 backdrop-blur-2xl rounded-2xl text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 shadow-lg shadow-emerald-500/10"
        >
          <FileDown className="w-5 h-5 group-hover:animate-bounce" />
          <span className=" font-bold uppercase tracking-wider text-sm">Xuất Dữ Liệu CSV</span>
        </button>
      )}

      {exportState === 'submitting' && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 rounded-xl text-sm text-slate-300">
          <RefreshCw size={18} className="animate-spin text-emerald-400" />
          Đang kiểm tra dữ liệu...
        </div>
      )}

      {exportState === 'polling' && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 rounded-xl text-sm text-slate-300">
          <RefreshCw size={18} className="animate-spin text-cyan-400" />
          {message}
        </div>
      )}

      {exportState === 'ready' && (
        <>
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-600/20"
          >
            <Download size={18} />
            Tải CSV
          </button>
          {message && <span className="text-xs text-emerald-400">{message}</span>}
        </>
      )}

      {(exportState === 'failed' || exportState === 'error') && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-red-400">{message}</span>
          <button onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/60 text-slate-300 rounded-xl text-xs hover:bg-slate-600/60 transition-all"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportButton
