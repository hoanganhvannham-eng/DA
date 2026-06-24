import React, { useState } from 'react'
import MoodPicker from '../../../features/mood/components/MoodPicker'
import BookSuggestions from '../../../features/mood/components/BookSuggestions'
import { getRecommendations } from '../../../features/mood/services/recommendationService'

export default function MoodSection() {
  const [selectedMoodId, setSelectedMoodId] = useState(null)
  const [selectedMoodName, setSelectedMoodName] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeMoodIndex, setActiveMoodIndex] = useState(0)

  const handleMoodSelect = async (moodId, moodName) => {
    setSelectedMoodId(moodId)
    setSelectedMoodName(moodName || '')
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
    <section id="mood" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-violet-500/20 text-violet-400 label-cyber mb-6">
              🎭 Mood-based Recommendation
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Sách phù hợp với
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> tâm trạng</span>
              {' '}của bạn
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Không biết đọc gì? Chỉ cần chọn tâm trạng hiện tại, hệ thống sẽ gợi ý những cuốn sách hoàn hảo.
              Không cần đăng nhập, dùng ngay lập tức.
            </p>

            <MoodPicker
              selectedMoodId={selectedMoodId}
              onMoodSelect={handleMoodSelect}
            />
          </div>

          <div className="relative">
            {loading ? (
              <div className="glass-analytic p-10 text-center">
                <div className="flex justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                <p className="text-slate-500 text-sm mt-4">Đang tìm sách phù hợp...</p>
              </div>
            ) : (
              <BookSuggestions
                suggestions={suggestions}
                message={message}
                moodIndex={activeMoodIndex}
                selectedMoodId={selectedMoodId}
                selectedMoodName={selectedMoodName}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
