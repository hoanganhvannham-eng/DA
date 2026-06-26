import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
 
let jsQRPromise = null
function getJsQR() {
  if (!jsQRPromise) jsQRPromise = import('jsqr').then(m => m.default)
  return jsQRPromise
}
 
function invertImageData(imageData) {
  const data = new Uint8ClampedArray(imageData.data)
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = 255 - data[i]
    data[i + 1] = 255 - data[i + 1]
    data[i + 2] = 255 - data[i + 2]
  }
  return new ImageData(data, imageData.width, imageData.height)
}
 
function toImageData(img, w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)
  return ctx.getImageData(0, 0, w, h)
}
 
async function readQrFromFile(file) {
  console.log('🔍 readQrFromFile start:', file.name, file.size, file.type)
  const jsQR = await getJsQR()
  console.log('🔍 jsQR loaded:', typeof jsQR)
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      console.log('⏰ Timeout fired — img.onload chưa chạy!')
      reject(new Error('Hết thời gian xử lý ảnh'))
    }, 8000)
    const img = new Image()
    const url = URL.createObjectURL(file)
    console.log('🔍 blob URL created:', url)
    img.onload = () => {
      URL.revokeObjectURL(url)
      console.log('✅ Ảnh load OK:', img.width, 'x', img.height)
      try {
        for (const scale of [1, 2, 0.5, 1.5, 0.75]) {
          const w = Math.round(img.width * scale)
          const h = Math.round(img.height * scale)
          if (w < 50 || h < 50) continue
          const id = toImageData(img, w, h)
          const c1 = jsQR(id.data, w, h, { inversionAttempts: 'attemptBoth' })
          console.log(`Scale ${scale} normal:`, c1 ? '✅ ' + c1.data : '❌')
          if (c1) { clearTimeout(timer); resolve(c1.data); return }
          const c2 = jsQR(invertImageData(id).data, w, h, { inversionAttempts: 'attemptBoth' })
          console.log(`Scale ${scale} invert:`, c2 ? '✅ ' + c2.data : '❌')
          if (c2) { clearTimeout(timer); resolve(c2.data); return }
        }
        clearTimeout(timer)
        console.log('❌ Tất cả scale thất bại')
        reject(new Error('Không tìm thấy mã QR trong ảnh'))
      } catch (err) {
        console.error('❌ Lỗi xử lý:', err)
        clearTimeout(timer); reject(err)
      }
    }
    img.onerror = (err) => {
      console.log('❌ img.onerror fired:', err)
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      reject(new Error('Không đọc được file ảnh'))
    }
    img.src = url
    console.log('🔍 img.src set, waiting for onload...')
  })
}
export default function QrScannerModal({ onScanSuccess, onClose }) {
  const scannerRef = useRef(null)
  const isRunningRef = useRef(false)
  const isMountedRef = useRef(true)
  const [error, setError] = useState(null)
  const [started, setStarted] = useState(false)
  const [scanning, setScanning] = useState(false)
 
  const stopScanner = useCallback(() => {
    isRunningRef.current = false
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    const region = document.getElementById('qr-scanner-region')
    if (region) region.innerHTML = ''
  }, [])
 
  // Đóng modal NGAY LẬP TỨC — gọi onClose() trước, stop camera sau
  const handleClose = useCallback(() => {
    isMountedRef.current = false
    onClose()
    stopScanner()
  }, [onClose, stopScanner])
 
  const startScanner = useCallback(async () => {
    stopScanner()
    isMountedRef.current = true
    const region = document.getElementById('qr-scanner-region')
    if (!region) return
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      if (!isMountedRef.current) return
      const html5QrCode = new Html5Qrcode('qr-scanner-region')
      scannerRef.current = html5QrCode
      const width = region.offsetWidth || 360
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: Math.min(width - 40, 260), height: Math.min(width - 40, 260) }, aspectRatio: 1.0 },
        async (decodedText) => {
          if (!isRunningRef.current) return
          isRunningRef.current = false
          try { await html5QrCode.stop() } catch (_) {}
          if (!isMountedRef.current) return
          const shouldClose = await onScanSuccess(decodedText)
          if (shouldClose === false && isMountedRef.current) startScanner()
        },
        () => {}
      )
      if (isMountedRef.current) {
        isRunningRef.current = true
        setStarted(true)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Không thể truy cập camera: ' + (err?.message || String(err)))
      }
    }
  }, [stopScanner, onScanSuccess])
 
  useEffect(() => {
    isMountedRef.current = true
    const timer = setTimeout(() => { if (isMountedRef.current) startScanner() }, 150)
    return () => {
      clearTimeout(timer)
      isMountedRef.current = false
      stopScanner()
    }
  }, []) // eslint-disable-line
 
  const handleFileUpload = async (e) => {
    console.log('📁 handleFileUpload called', e.target.files)
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setScanning(true)
    setError(null)
    try {
      const result = await readQrFromFile(file)
      console.log('🔍 isMountedRef.current:', isMountedRef.current, '| result:', result)
      if (!isMountedRef.current) return
      setScanning(false)
      console.log('🧪 typeof onScanSuccess:', typeof onScanSuccess, onScanSuccess)
      const shouldClose = await onScanSuccess(result)
      console.log('🧪 shouldClose:', shouldClose)
      if (shouldClose !== false) {
        onClose()
        stopScanner()
      }
    } catch (err) {
      console.error('💥 handleFileUpload catch:', err)
      if (!isMountedRef.current) return
      setScanning(false)
      setError(err.message || 'Không đọc được mã QR từ ảnh. Vui lòng thử ảnh khác hoặc quét trực tiếp.')
    }
  }
 
  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', overflow: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', background: '#0f172a', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
 
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Quét mã QR</span>
          <button onClick={handleClose} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}>&times;</button>
        </div>
 
        {error ? (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '12px', fontSize: '13px' }}>
            {error}
            <button onClick={() => { setError(null); startScanner() }} style={{ display: 'block', width: '100%', marginTop: '8px', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px' }}>
              Thử lại camera
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <div id="qr-scanner-region" style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', background: '#000' }} />
            {scanning && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid rgba(34,211,238,0.2)', borderTop: '3px solid #22d3ee', borderRadius: '50%', animation: 'qrspin 0.8s linear infinite' }} />
                <p style={{ color: '#22d3ee', fontSize: '13px', margin: 0 }}>Đang đọc mã QR...</p>
              </div>
            )}
            {!started && !scanning && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>Đang khởi động camera...</p>}
            {started && !scanning && <p style={{ color: 'rgba(34,211,238,0.6)', fontSize: '12px', textAlign: 'center', marginTop: '6px' }}>Hướng camera vào mã QR để quét tự động</p>}
          </div>
        )}
 
        <div style={{ display: 'flex', gap: '8px' }}>
          <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: scanning ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: scanning ? 'not-allowed' : 'pointer', pointerEvents: scanning ? 'none' : 'auto' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {scanning ? 'Đang xử lý...' : 'Tải ảnh lên'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={scanning} />
          </label>
          <button onClick={handleClose} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', background: 'none', fontSize: '13px', cursor: 'pointer' }}>
            Huỷ
          </button>
        </div>
 
        <style>{`@keyframes qrspin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
    , document.body)
}