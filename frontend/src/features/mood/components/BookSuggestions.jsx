import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import ReadingPathModal from './ReadingPathModal'

const moodColors = [
  'from-rose-500 to-pink-600',
  'from-orange-500 to-amber-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-pink-500 to-red-500',
  'from-yellow-500 to-orange-500',
  'from-teal-500 to-green-500',
  'from-purple-500 to-fuchsia-500',
]

export default function BookSuggestions({ suggestions, message, moodIndex, selectedMoodId, selectedMoodName }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [showPathModal, setShowPathModal] = useState(false)
  const color = moodColors[(moodIndex || 0) % moodColors.length]

  if (message) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-10 text-center">
        <div className="text-5xl mb-4 opacity-30">📭</div>
        <p className="text-slate-400 text-lg">{message}</p>
        <p className="text-slate-600 text-sm mt-2">Thử chọn một mood khác để khám phá thêm sách</p>
      </div>
    )
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-10 text-center">
        <p className="text-white/30">Chọn một mood để nhận gợi ý sách</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6">
        <div className="space-y-3">
          {suggestions.map((book, i) => (
            <div
              key={book.id}
              className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200"
            >
              <div className={`w-10 h-12 rounded-lg bg-gradient-to-b ${color} flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{book.title}</p>
                <p className="text-white/30 text-xs mt-0.5">
                  {book.author}
                  {book.categoryName && <span className="ml-2 px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 text-[10px]">{book.categoryName}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-amber-400 text-xs font-medium">
                  ★ {book.popularityScore}
                </span>
                <button
                  onClick={() => navigate(`/books/${book.id}`)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.10] text-white/60 hover:bg-white/[0.15] transition-all"
                >
                  Chi tiết
                </button>
                {isLoggedIn && (
                  <button
                    onClick={() => navigate(`/books/${book.id}`)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all"
                  >
                    Mượn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isLoggedIn && selectedMoodId && (
          <button
            onClick={() => setShowPathModal(true)}
            className={`mt-4 w-full py-2.5 rounded-xl text-white text-sm font-medium bg-gradient-to-r ${color} hover:opacity-90 transition-all`}
          >
            Tạo lộ trình đọc
          </button>
        )}

        {!isLoggedIn && (
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-white/30 text-xs">
              <button onClick={() => navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)} className="text-cyan-400 hover:text-cyan-300 underline">
                Đăng nhập
              </button>
              {' '}để tạo lộ trình đọc và mượn sách
            </p>
          </div>
        )}
      </div>

      {showPathModal && selectedMoodId && (
        <ReadingPathModal
          moodId={selectedMoodId}
          moodName={selectedMoodName}
          moodIndex={moodIndex}
          onClose={(saved) => {
            setShowPathModal(false)
          }}
        />
      )}
    </>
  )
}
