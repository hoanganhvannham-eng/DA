import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MoodPicker from '../../../features/mood/components/MoodPicker'
import BookSuggestions from '../../../features/mood/components/BookSuggestions'
import { getRecommendations } from '../../../features/mood/services/recommendationService'
 
export default function MoodExplorePage() {
  const [selectedMoodId, setSelectedMoodId] = useState(null)
  const [selectedMoodName, setSelectedMoodName] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeMoodIndex, setActiveMoodIndex] = useState(0)
 
  const handleMoodSelect = async (moodId, moodName, moodIdx) => {
    setSelectedMoodId(moodId)
    setSelectedMoodName(moodName || '')
    setActiveMoodIndex(moodIdx || 0)
    setLoading(true)
    setMessage(null)
 
    try {
      const data = await getRecommendations(moodId)
      setSuggestions(data.suggestions || [])
      setMessage(data.message || null)
    } catch {
      setSuggestions([])
      setMessage('Không thể tải gợi ý, vui lòng thử lại sau')
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[80px] animate-pulse" />
        <div
          className="absolute top-1/3 -right-48 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: '-4s' }}
        />
        <div
          className="absolute -bottom-48 left-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: '-8s' }}
        />
      </div>
 
      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
 
      <Navbar />
 
      <main className="relative z-10 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 
          {/* Back button */}
            <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors mb-10"
            >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Quay lại
            </button>
 
          {/* Header */}
          <div className="mb-12">
            {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-violet-500/20 text-violet-400 text-xs font-medium tracking-widest uppercase mb-6">
              🎭 Mood-based Recommendation
            </div> */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Sách phù hợp với
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> tâm trạng</span>
              {' '}của bạn
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              Không biết đọc gì? Chỉ cần chọn tâm trạng hiện tại, hệ thống sẽ gợi ý những cuốn sách hoàn hảo.
              Không cần đăng nhập, dùng ngay lập tức.
            </p>
          </div>
 
          {/* Mood Picker */}
          <div className="mb-10">
            <p className="text-white/40 text-sm mb-4 uppercase tracking-widest font-medium">Tâm trạng của bạn hôm nay?</p>
            <MoodPicker
              selectedMoodId={selectedMoodId}
              onMoodSelect={(id, name, idx) => handleMoodSelect(id, name, idx)}
            />
          </div>
 
          {/* Divider */}
          <div className="border-t border-white/5 mb-10" />
 
          {/* Results area */}
          {loading ? (
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 p-16 text-center">
              <div className="flex justify-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
              <p className="text-slate-500 text-sm">Đang tìm sách phù hợp với tâm trạng của bạn...</p>
            </div>
          ) : (
            <div>
              {selectedMoodId && (
                <p className="text-white/30 text-sm mb-4">
                  Gợi ý sách cho tâm trạng{' '}
                  <span className="text-violet-400 font-medium">{selectedMoodName}</span>
                </p>
              )}
              <BookSuggestions
                suggestions={suggestions}
                message={message}
                moodIndex={activeMoodIndex}
                selectedMoodId={selectedMoodId}
                selectedMoodName={selectedMoodName}
              />
            </div>
          )}
 
        </div>
      </main>
 
      <Footer />
    </div>
  )
}
 