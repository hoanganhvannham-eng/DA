import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import ReadingPathModal from './ReadingPathModal'
import { getCoverGradientPreset } from '../../book/utils/bookUiUtils'

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
        {isLoggedIn && selectedMoodId && (
          <button
            onClick={() => setShowPathModal(true)}
            className={`mb-4 w-full py-2.5 rounded-xl text-white text-sm font-medium bg-gradient-to-r ${color} hover:opacity-90 transition-all`}
          >
            Tạo lộ trình đọc
          </button>
        )}

        {!isLoggedIn && (
          <div className="mb-4 pb-4 border-b border-white/5 text-center">
            <p className="text-white/30 text-xs">
              <button onClick={() => navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)} className="text-cyan-400 hover:text-cyan-300 underline">
                Đăng nhập
              </button>
              {' '}để tạo lộ trình đọc và mượn sách
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {suggestions.map((book, i) => (
            <div key={book.id} className="flex flex-col items-center">
              <div
                onClick={() => navigate(`/books/${book.id}`)}
                className="relative w-44 h-64 rounded-xl overflow-hidden shadow-2xl group hover:scale-[1.03] hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer"
              >
                {book.imageUrl ? (
                  <img src={book.imageUrl} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCoverGradientPreset(book.title)}`} />
                )}
                <div className="absolute top-0 left-[3px] w-[3px] h-full bg-gradient-to-r from-black/40 to-transparent z-10" />
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col justify-between h-full p-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/80 bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
                      {book.categoryName}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-sm leading-snug line-clamp-3 drop-shadow-md">
                      {book.title}
                    </h3>
                    <div className="w-6 h-0.5 bg-white/30 my-2" />
                    <p className="text-white/70 text-xs font-medium truncate drop-shadow-md">
                      {book.author}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-amber-400 text-xs font-medium">★ {book.popularityScore}</span>
                {isLoggedIn && (
                  <button
                    onClick={() => navigate(`/books/${book.id}`)}
                    className="px-2 py-1 text-xs font-medium rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
                  >
                    Mượn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

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
