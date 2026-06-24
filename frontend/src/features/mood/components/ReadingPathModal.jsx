import React, { useState, useEffect } from 'react'
import { generatePath, savePath } from '../services/readingPathService'

const moodColors = [
  'from-rose-500 to-pink-600',
  'from-orange-500 to-amber-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
]

export default function ReadingPathModal({ moodId, moodName, moodIndex, onClose, onBorrow }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [path, setPath] = useState(null)
  const [items, setItems] = useState([])
  const [needConfirmReplace, setNeedConfirmReplace] = useState(false)
  const color = moodColors[(moodIndex || 0) % moodColors.length]

  useEffect(() => {
    let mounted = true
    setLoading(true)
    generatePath(moodId)
      .then((data) => {
        if (mounted) {
          const books = data.generatedPath?.books || data.books || []
          setPath(data.generatedPath || data)
          setItems(books.map((b, i) => ({ ...b, order: i + 1 })))
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.response?.data?.message || 'Không thể tạo lộ trình đọc')
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [moodId])

  const moveItem = (index, direction) => {
    const newItems = [...items]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newItems.length) return
    ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
    newItems.forEach((item, i) => { item.order = i + 1 })
    setItems(newItems)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        moodId,
        items: items.map((item) => ({ bookId: item.id, order: item.order })),
      }
      if (needConfirmReplace) {
        payload.confirmReplace = true
      }
      const result = await savePath(payload)
      if (result.confirmReplace) {
        setNeedConfirmReplace(true)
        setSaving(false)
        return
      }
      onClose(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu lộ trình thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
         onClick={() => !saving && onClose()}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in-up"
           onClick={(e) => e.stopPropagation()}>

        <div className={`p-6 bg-gradient-to-r ${color} rounded-t-[2rem] flex items-center justify-between`}>
          <h2 className="text-white font-bold text-lg">Lộ trình đọc</h2>
          {moodName && <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs">{moodName}</span>}
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/40 text-sm">Đang tạo lộ trình...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-rose-400 text-sm mb-4">{error}</p>
              <button onClick={() => onClose()}
                      className="px-4 py-2 bg-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-600 transition-all">
                Đóng
              </button>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <>
              <p className="text-slate-400 text-xs mb-4">
                Sắp xếp lộ trình đọc của bạn. Kéo thả hoặc dùng nút để thay đổi thứ tự.
              </p>

              <div className="space-y-2">
                {items.map((book, i) => (
                  <div key={book.id}
                       className="flex items-center gap-3 p-3 bg-white/[0.05] rounded-xl border border-white/10">
                    <div className={`w-8 h-10 rounded-lg bg-gradient-to-b ${color} flex items-center justify-center text-white text-xs flex-shrink-0`}>
                      {book.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{book.title}</p>
                      <p className="text-white/30 text-xs truncate">{book.author}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => moveItem(i, -1)} disabled={i === 0}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.10] text-white/40 hover:bg-white/[0.15] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm">
                        ▲
                      </button>
                      <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.10] text-white/40 hover:bg-white/[0.15] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all text-sm">
                        ▼
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {needConfirmReplace && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-amber-400 text-xs text-center">
                    Bạn đã có lộ trình cho mood này. Tạo mới sẽ thay thế lộ trình cũ.
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button onClick={() => onClose()}
                        className="flex-1 px-4 py-2.5 bg-white/[0.05] rounded-xl text-white/40 text-sm font-medium hover:bg-white/[0.08] transition-all">
                  Hủy
                </button>
                <button onClick={handleSave} disabled={saving}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${
                          saving ? 'bg-cyan-500/50 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400'
                        }`}>
                  {saving ? 'Đang lưu...' : (needConfirmReplace ? 'Xác nhận thay thế' : 'Lưu lộ trình')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
